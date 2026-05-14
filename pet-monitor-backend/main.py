"""
Pet Monitoring Agent - ScanTap System
Backend FastAPI para monitoramento de animais de estimação com IoT.
"""
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from datetime import datetime
import uvicorn
import os
from dotenv import load_dotenv

from database import (
    init_db, save_bpm, get_pet_history, save_alert,
    get_alert_limits, update_alert_limits
)
from services.ai_agent import analyze_bpm_history, generate_daily_report
from services.adafruit_svc import publish_bpm_to_adafruit

load_dotenv()

app = FastAPI(
    title="Pet Monitoring Agent - ScanTap System",
    version="1.0.0",
    description="Backend para monitoramento de pets com IoT e IA"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================== MODELOS PYDANTIC ==================

class BPMReading(BaseModel):
    pet_id: str
    bpm: int
    status_coleira: str = "online"


class AlertLimits(BaseModel):
    pet_id: str
    bpm_min: int
    bpm_max: int


# ================== UTILITÁRIOS ==================

def check_bpm_alert(pet_id: str, bpm: int) -> bool:
    limits = get_alert_limits(pet_id)
    
    if bpm > limits["bpm_max"]:
        mensagem = f"BPM acima do limite: {bpm} > {limits['bpm_max']}"
        save_alert(pet_id, "BPM_ALTO", bpm, mensagem)
        print(f"⚠️  {mensagem}")
        return True
    
    if bpm < limits["bpm_min"]:
        mensagem = f"BPM abaixo do limite: {bpm} < {limits['bpm_min']}"
        save_alert(pet_id, "BPM_BAIXO", bpm, mensagem)
        print(f"⚠️  {mensagem}")
        return True
    
    return False


# ================== ROTAS ==================

@app.on_event("startup")
def startup_event():
    init_db()
    print("🚀 Pet Monitoring Agent iniciado!")


@app.get("/")
def root():
    return {
        "servico": "Pet Monitoring Agent",
        "versao": "1.0.0",
        "status": "online",
        "timestamp": datetime.now().isoformat()
    }


@app.post("/monitor/seed", status_code=201)
async def receive_seed_data(data: BPMReading, background_tasks: BackgroundTasks):
    background_tasks.add_task(save_bpm, data.pet_id, data.bpm, data.status_coleira)
    alerta_disparado = check_bpm_alert(data.pet_id, data.bpm)
    background_tasks.add_task(publish_bpm_to_adafruit, f"pet-{data.pet_id}-bpm", data.bpm)
    
    return {
        "received": True,
        "pet_id": data.pet_id,
        "bpm": data.bpm,
        "status_coleira": data.status_coleira,
        "alerta_disparado": alerta_disparado,
        "timestamp": datetime.now().isoformat()
    }


@app.get("/monitor/history/{pet_id}")
async def get_pet_history_route(pet_id: str, limit: int = 20):
    history = get_pet_history(pet_id, limit)
    
    if not history:
        raise HTTPException(status_code=404, detail=f"Nenhum histórico encontrado para pet {pet_id}")
    
    return {
        "pet_id": pet_id,
        "total_registros": len(history),
        "dados": history,
        "timestamp_request": datetime.now().isoformat()
    }


@app.get("/monitor/analysis/{pet_id}")
async def get_pet_analysis(pet_id: str, limit: int = 50):
    history = get_pet_history(pet_id, limit)
    
    if not history:
        raise HTTPException(status_code=404, detail=f"Sem dados para análise")
    
    analysis = analyze_bpm_history(history)
    report = generate_daily_report(pet_id, history)
    
    return {
        "pet_id": pet_id,
        "analise_ia": analysis,
        "relatorio": report,
        "timestamp": datetime.now().isoformat()
    }


@app.post("/settings/sync", status_code=200)
async def sync_alert_limits(limits: AlertLimits):
    success = update_alert_limits(limits.pet_id, limits.bpm_min, limits.bpm_max)
    
    if not success:
        raise HTTPException(status_code=500, detail="Erro ao sincronizar limites")
    
    return {
        "sincronizado": True,
        "pet_id": limits.pet_id,
        "bpm_min": limits.bpm_min,
        "bpm_max": limits.bpm_max,
        "timestamp": datetime.now().isoformat()
    }


@app.get("/settings/limits/{pet_id}")
async def get_alert_limits_route(pet_id: str):
    limits = get_alert_limits(pet_id)
    
    return {
        "pet_id": pet_id,
        "bpm_min": limits["bpm_min"],
        "bpm_max": limits["bpm_max"],
        "timestamp": datetime.now().isoformat()
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }


# ================== EXECUÇÃO ==================

if __name__ == "__main__":
    host = os.getenv("SERVER_HOST", "0.0.0.0")
    port = int(os.getenv("SERVER_PORT", 8000))
    
    print(f"🌐 Iniciando servidor em {host}:{port}")
    uvicorn.run(app, host=host, port=port)