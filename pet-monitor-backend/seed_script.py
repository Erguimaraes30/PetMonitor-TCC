"""
Script de simulação de dados para teste do backend.
Envia dados de BPM aleatórios para a API FastAPI.
"""
import requests
import random
import time
from datetime import datetime

BASE_URL = "http://localhost:8000"
PETS = ["pet_001", "pet_002", "pet_003"]

def send_bpm_reading(pet_id: str, bpm: int):
    """Envia uma leitura de BPM para o backend"""
    try:
        payload = {
            "pet_id": pet_id,
            "bpm": bpm,
            "status_coleira": "online"
        }
        response = requests.post(f"{BASE_URL}/monitor/seed", json=payload)
        
        if response.status_code == 201:
            print(f"✅ [{pet_id}] BPM {bpm} enviado com sucesso")
            return True
        else:
            print(f"❌ Erro ao enviar: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        return False


def simulate_bpm_data():
    """
    Simula coleta de dados de BPM.
    Em produção, isso viria do ESP32 / coleira IoT.
    """
    print("🚀 Iniciando simulação de dados...")
    print(f"⏰ Timestamp: {datetime.now()}")
    
    try:
        while True:
            for pet_id in PETS:
                # Simula BPM aleatório (normal entre 60-140)
                bpm = random.randint(60, 140)
                send_bpm_reading(pet_id, bpm)
            
            # Aguarda 5 segundos antes do próximo envio
            time.sleep(5)
    
    except KeyboardInterrupt:
        print("\n⛔ Simulação interrompida pelo usuário")


def test_endpoints():
    """Testa os endpoints principais"""
    print("\n📋 Testando endpoints...")
    
    try:
        # Health check
        resp = requests.get(f"{BASE_URL}/health")
        print(f"✅ Health: {resp.json()}")
        
        # Historico
        resp = requests.get(f"{BASE_URL}/monitor/history/pet_001")
        if resp.status_code == 200:
            print(f"✅ History: {len(resp.json()['dados'])} registros encontrados")
        
        # Analise IA
        resp = requests.get(f"{BASE_URL}/monitor/analysis/pet_001")
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
