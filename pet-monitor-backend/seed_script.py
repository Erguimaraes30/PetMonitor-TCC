"""
Script de simulação de dados para teste do backend.
Simula a variação realista de BPM de um cão de grande porte.
"""
import requests
import random
import time
import math
from datetime import datetime

BASE_URL = "http://localhost:8000"
PET_ID = "pet_001"

# Estados possíveis do pet com faixas de BPM realistas para cães de grande porte
ESTADOS = {
    "dormindo":     {"min": 60,  "max": 75,  "duracao": (30, 60), "label": "😴 Dormindo"},
    "repouso":      {"min": 70,  "max": 90,  "duracao": (20, 40), "label": "🛋️  Em repouso"},
    "alerta":       {"min": 85,  "max": 110, "duracao": (10, 20), "label": "👀 Alerta"},
    "caminhando":   {"min": 100, "max": 130, "duracao": (10, 25), "label": "🚶 Caminhando"},
    "brincando":    {"min": 120, "max": 150, "duracao": (5,  15), "label": "🎾 Brincando"},
}

def get_next_estado(atual):
    """Transição natural entre estados — evita pulos bruscos"""
    transicoes = {
        "dormindo":   ["repouso"],
        "repouso":    ["dormindo", "alerta", "caminhando"],
        "alerta":     ["repouso", "caminhando"],
        "caminhando": ["repouso", "alerta", "brincando"],
        "brincando":  ["caminhando", "alerta"],
    }
    return random.choice(transicoes[atual])

def simular_bpm_realista(bpm_atual, estado):
    """
    Simula variação suave de BPM dentro do estado atual.
    Usa uma leve oscilação senoidal para parecer mais natural.
    """
    config = ESTADOS[estado]
    
    # Variação pequena e gradual (±3 BPM por leitura)
    variacao = random.uniform(-3, 3)
    
    # Leve oscilação senoidal para simular respiração/batimento natural
    oscilacao = math.sin(time.time() * 0.5) * 2
    
    novo_bpm = bpm_atual + variacao + oscilacao
    
    # Mantém dentro dos limites do estado atual
    novo_bpm = max(config["min"], min(config["max"], novo_bpm))
    
    return round(novo_bpm)

def send_bpm_reading(bpm: int, estado: str):
    """Envia uma leitura de BPM para o backend"""
    try:
        payload = {
            "pet_id": PET_ID,
            "bpm": bpm,
            "status_coleira": "online"
        }
        response = requests.post(f"{BASE_URL}/monitor/seed", json=payload, timeout=5)
        
        if response.status_code == 201:
            data = response.json()
            alerta = "⚠️  ALERTA DISPARADO" if data.get("alerta_disparado") else ""
            print(f"✅ BPM {bpm:3d} | {ESTADOS[estado]['label']:<25} {alerta}")
            return True
        else:
            print(f"❌ Erro ao enviar: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        return False

def simulate_bpm_data():
    """
    Simula coleta de dados de BPM com comportamento realista.
    O pet passa por diferentes estados ao longo do tempo.
    """
    print("🐕 Iniciando simulação realista de BPM...")
    print(f"⏰ Timestamp: {datetime.now()}")
    print(f"🎯 Pet: {PET_ID}")
    print("-" * 50)
    
    estado_atual = "repouso"
    bpm_atual = 80
    leituras_no_estado = 0
    duracao_estado = random.randint(*ESTADOS[estado_atual]["duracao"])
    
    try:
        while True:
            # Simula BPM com variação natural
            bpm_atual = simular_bpm_realista(bpm_atual, estado_atual)
            send_bpm_reading(bpm_atual, estado_atual)
            
            leituras_no_estado += 1
            
            # Muda de estado quando atingir a duração definida
            if leituras_no_estado >= duracao_estado:
                novo_estado = get_next_estado(estado_atual)
                config = ESTADOS[novo_estado]
                
                print(f"\n🔄 Estado mudou: {ESTADOS[estado_atual]['label']} → {config['label']}")
                print("-" * 50)
                
                # Ajusta o BPM gradualmente para o novo estado
                bpm_atual = (bpm_atual + config["min"]) // 2
                estado_atual = novo_estado
                leituras_no_estado = 0
                duracao_estado = random.randint(*config["duracao"])
            
            time.sleep(3)
    
    except KeyboardInterrupt:
        print("\n⛔ Simulação interrompida pelo usuário")
        print(f"📊 Última leitura: {bpm_atual} BPM | Estado: {ESTADOS[estado_atual]['label']}")

def test_endpoints():
    """Testa os endpoints principais"""
    print("\n📋 Testando endpoints...")
    
    try:
        resp = requests.get(f"{BASE_URL}/health")
        print(f"✅ Health: {resp.json()['status']}")
        
        resp = requests.get(f"{BASE_URL}/monitor/history/{PET_ID}")
        if resp.status_code == 200:
            dados = resp.json()['dados']
            print(f"✅ History: {len(dados)} registros | Último BPM: {dados[0]['bpm'] if dados else 'N/A'}")
        
        resp = requests.get(f"{BASE_URL}/monitor/analysis/{PET_ID}")
        if resp.status_code == 200:
            print(f"✅ Analysis: {resp.json()['analise_ia']}")
        
    except Exception as e:
        print(f"❌ Erro ao testar: {e}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        test_endpoints()
    else:
        simulate_bpm_data()