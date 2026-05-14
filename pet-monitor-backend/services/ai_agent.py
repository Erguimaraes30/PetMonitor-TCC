"""
Serviço de IA para análise de padrões de BPM.
Responsável por gerar insights sobre o estado do pet usando LLM.
"""
import os
import requests
from typing import List, Dict, Optional
from datetime import datetime, timedelta

LLM_API_KEY = os.getenv("LLM_API_KEY")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-3.5-turbo")


def analyze_bpm_history(bpm_data: List[Dict]) -> Optional[str]:
    """
    Analisa um histórico de BPMs e gera um insight sobre o estado do pet.
    
    Args:
        bpm_data: Lista de dicts com 'bpm' e 'timestamp'
    
    Returns:
        Texto de análise IA ou None se erro
    """
    if not bpm_data:
        return "Sem dados suficientes para análise."
    
    if not LLM_API_KEY:
        return generate_local_analysis(bpm_data)
    
    try:
        # Prepara dados para o LLM
        avg_bpm = sum([d['bpm'] for d in bpm_data]) / len(bpm_data)
        max_bpm = max([d['bpm'] for d in bpm_data])
        min_bpm = min([d['bpm'] for d in bpm_data])
        
        prompt = f"""
Você é um assistente veterinário especializado em monitoramento de pets.
Com base nos seguintes dados de frequência cardíaca:
- BPM Médio: {avg_bpm:.0f}
- BPM Máximo: {max_bpm}
- BPM Mínimo: {min_bpm}
- Número de leituras: {len(bpm_data)}

Descreva brevemente (2-3 linhas) o estado provável do pet: repouso, atividade normal, brincadeira ou possível estresse.
"""
        
        headers = {"Authorization": f"Bearer {LLM_API_KEY}"}
        payload = {
            "model": LLM_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 100
        }
        
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            json=payload,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            return result['choices'][0]['message']['content'].strip()
        else:
            print(f"⚠️  Erro LLM: {response.status_code}")
            return generate_local_analysis(bpm_data)
    
    except Exception as e:
        print(f"❌ Erro na análise IA: {e}")
        return generate_local_analysis(bpm_data)


def generate_local_analysis(bpm_data: List[Dict]) -> str:
    """
    Gera análise local sem dependência de LLM.
    Útil como fallback quando API não está disponível.
    """
    if not bpm_data:
        return "Sem dados para análise."
    
    bpms = [d['bpm'] for d in bpm_data]
    avg_bpm = sum(bpms) / len(bpms)
    
    if avg_bpm < 70:
        return "🛌 Pet em repouso. Frequência cardíaca baixa indicando descanso ou sono."
    elif avg_bpm < 100:
        return "😊 Pet calmo. Atividade normal com frequência cardíaca estável."
    elif avg_bpm < 130:
        return "🎾 Pet ativo. Pode estar brincando ou em atividade leve."
    else:
        return "⚡ Pet muito ativo ou possível estresse. Monitore os próximos valores."


def generate_daily_report(pet_id: str, bpm_history: List[Dict]) -> Dict:
    """
    Gera um relatório diário do pet com análise de tendências.
    """
    if not bpm_history:
        return {
            "pet_id": pet_id,
            "data": datetime.now().isoformat(),
            "resumo": "Sem dados no período",
            "bpm_medio": 0,
            "bpm_max": 0,
            "bpm_min": 0
        }
    
    bpms = [d['bpm'] for d in bpm_history]
    
    return {
        "pet_id": pet_id,
        "data": datetime.now().isoformat(),
        "resumo": analyze_bpm_history(bpm_history),
        "bpm_medio": round(sum(bpms) / len(bpms), 2),
        "bpm_max": max(bpms),
        "bpm_min": min(bpms),
        "total_leituras": len(bpms)
    }
