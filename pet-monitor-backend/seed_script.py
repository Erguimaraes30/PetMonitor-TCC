import requests
import random
import time
import math
import threading
from datetime import datetime

BASE_URL = "https://petmonitor-tcc.onrender.com" 
PET_ID = "pet_001"

# Controle de anomalia forçada
forçar_anomalia = None # Pode ser "TAQ", "BRA" ou None

ESTADOS = {
    "dormindo":     {"min": 60,  "max": 75,  "duracao": (30, 60), "label": "😴 Dormindo"},
    "repouso":      {"min": 70,  "max": 90,  "duracao": (20, 40), "label": "🛋️  Em repouso"},
    "alerta":       {"min": 85,  "max": 110, "duracao": (10, 20), "label": "👀 Alerta"},
    "caminhando":   {"min": 100, "max": 130, "duracao": (10, 25), "label": "🚶 Caminhando"},
    "brincando":    {"min": 120, "max": 150, "duracao": (5,  15), "label": "🎾 Brincando"},
    "TAQUICARDIA":  {"min": 160, "max": 190, "label": "⚠️ EMERGÊNCIA: TAQUICARDIA"},
    "BRADICARDIA":  {"min": 35,  "max": 50,  "label": "⚠️ EMERGÊNCIA: BRADICARDIA"},
}

def monitorar_teclado():
    """Função que roda em paralelo para capturar comandos do usuário"""
    global forçar_anomalia
    while True:
        comando = input().lower().strip()
        if comando == 't':
            forçar_anomalia = "TAQ"
            print("\n[COMANDO] 🚨 Ativando Taquicardia na próxima leitura...\n")
        elif comando == 'b':
            forçar_anomalia = "BRA"
            print("\n[COMANDO] 🚨 Ativando Bradicardia na próxima leitura...\n")
        elif comando == 'n':
            forçar_anomalia = None
            print("\n[COMANDO] ✅ Voltando ao normal...\n")

def send_bpm_reading(bpm: int, estado: str):
    try:
        payload = {
            "pet_id": PET_ID,
            "bpm": bpm,
            "status_coleira": "online"
        }
        response = requests.post(f"{BASE_URL}/monitor/seed", json=payload, timeout=10)
        
        if response.status_code == 201:
            data = response.json()
            alerta = "🚨 ALERTA NO APP!" if data.get("alerta_disparado") else ""
            print(f"✅ BPM {bpm:3d} | {ESTADOS[estado]['label']:<30} {alerta}")
            return True
        else:
            print(f"❌ Erro: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        return False

def simulate_bpm_data():
    global forçar_anomalia
    print(f"🐕 Simulação iniciada em: {BASE_URL}")
    print("⌨️  COMANDOS: [t] Taquicardia | [b] Bradicardia | [n] Normal | [Ctrl+C] Sair")
    print("-" * 60)
    
    # Inicia a thread que ouve o teclado sem travar o loop
    threading.Thread(target=monitorar_teclado, daemon=True).start()

    estado_atual = "repouso"
    bpm_atual = 80
    leituras_no_estado = 0
    duracao_estado = random.randint(*ESTADOS[estado_atual]["duracao"])
    
    try:
        while True:
            # LÓGICA DE INTERRUPÇÃO POR ANOMALIA
            if forçar_anomalia == "TAQ":
                bpm_atual = random.randint(ESTADOS["TAQUICARDIA"]["min"], ESTADOS["TAQUICARDIA"]["max"])
                estado_envio = "TAQUICARDIA"
            elif forçar_anomalia == "BRA":
                bpm_atual = random.randint(ESTADOS["BRADICARDIA"]["min"], ESTADOS["BRADICARDIA"]["max"])
                estado_envio = "BRADICARDIA"
            else:
                # Fluxo Normal
                config = ESTADOS[estado_atual]
                variacao = random.uniform(-3, 3)
                novo_bpm = bpm_atual + variacao
                bpm_atual = round(max(config["min"], min(config["max"], novo_bpm)))
                estado_envio = estado_atual

            send_bpm_reading(bpm_atual, estado_envio)
            
            # Controle de transição de estados (apenas se estiver no modo normal)
            if not forçar_anomalia:
                leituras_no_estado += 1
                if leituras_no_estado >= duracao_estado:
                    # Lógica de transição simplificada para o exemplo
                    proximos = ["dormindo", "repouso", "alerta", "caminhando", "brincando"]
                    estado_atual = random.choice(proximos)
                    leituras_no_estado = 0
                    duracao_estado = random.randint(*ESTADOS[estado_atual]["duracao"])
                    print(f"\n🔄 Mudando para: {ESTADOS[estado_atual]['label']}")

            time.sleep(5)
    
    except KeyboardInterrupt:
        print("\n⛔ Encerrado.")

if __name__ == "__main__":
    simulate_bpm_data()