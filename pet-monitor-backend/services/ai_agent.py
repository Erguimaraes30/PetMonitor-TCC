import os
import requests
from typing import List, Dict, Optional
from datetime import datetime

LLM_API_KEY = os.getenv("LLM_API_KEY")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini") # Recomendado gpt-4o-mini pelo custo/benefício

def analyze_bpm_history(bpm_data: List[Dict]) -> Optional[str]:
    if not bpm_data or len(bpm_data) < 5:
        return "Dados insuficientes para uma análise comportamental precisa."

    # --- ENGENHARIA DE FEATURES (O "CÉREBRO" DA LÓGICA LOCAL) ---
    bpms = [d['bpm'] for d in bpm_data]
    avg_bpm = sum(bpms) / len(bpms)
    max_bpm = max(bpms)
    min_bpm = min(bpms)
    
    # Variabilidade (Amplitude): Detecta se o pet está instável ou constante
    amplitude = max_bpm - min_bpm
    
    # Tendência (Últimos 5 min vs Resto): O BPM está subindo ou descendo?
    recent_avg = sum(bpms[:5]) / 5
    trend = "subindo" if recent_avg > avg_bpm + 5 else "descendo" if recent_avg < avg_bpm - 5 else "estável"

    if not LLM_API_KEY:
        return generate_local_analysis(avg_bpm, max_bpm, amplitude, trend)

    try:
        # PROMPT AVANÇADO: Dá contexto veterinário e persona para a IA
        prompt = f"""
        Você é um especialista em comportamento animal e fisiologia veterinária.
        Analise os sinais vitais do pet e forneça um insight humanizado:

        DADOS DO PERÍODO:
        - Frequência Média: {avg_bpm:.0f} BPM
        - Pico Máximo: {max_bpm} BPM (Mínimo: {min_bpm})
        - Variabilidade: {amplitude} BPM (Oscilação entre picos)
        - Tendência Recente: O batimento está {trend}.
        - Amostragem: {len(bpm_data)} leituras.

        INSTRUÇÕES:
        1. Identifique se o comportamento parece ser sono profundo, alerta, exercício ou estresse agudo.
        2. Se houver alta variabilidade ({amplitude} > 40), mencione que o pet pode estar em fase REM ou alternando entre agitação e pausa.
        3. Se o BPM estiver muito alto e constante, sugira hidratação ou descanso.
        4. Responda em no máximo 3 linhas com um tom empático e técnico.
        """

        headers = {"Authorization": f"Bearer {LLM_API_KEY}"}
        payload = {
            "model": LLM_MODEL,
            "messages": [
                {"role": "system", "content": "Você é um monitor de saúde pet inteligente."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7 # Adiciona um pouco de "personalidade" ao texto
        }

        response = requests.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers, timeout=12)
        
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content'].strip()
        return generate_local_analysis(avg_bpm, max_bpm, amplitude, trend)

    except Exception as e:
        print(f"❌ Erro IA: {e}")
        return generate_local_analysis(avg_bpm, max_bpm, amplitude, trend)

def generate_local_analysis(avg, max_val, amp, trend) -> str:
    """Fallback inteligente: Lógica baseada em comportamento, não só números."""
    if max_val > 150:
        return f"⚡ Alerta de alta intensidade. O pet atingiu {max_val} BPM. Se ele não estiver brincando, pode estar estressado ou com calor."
    if amp > 50:
        return "🎢 Alta oscilação detectada. O pet parece estar alternando momentos de euforia com pausas curtas de descanso."
    if avg < 75 and trend == "estável":
        return "🛌 Repouso profundo detectado. O ritmo cardíaco está calmo e constante, ideal para um sono recuperador."
    return "✅ Ritmo estável. O pet apresenta uma frequência cardíaca compatível com atividades domésticas normais."