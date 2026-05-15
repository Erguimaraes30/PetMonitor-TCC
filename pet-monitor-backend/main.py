from fastapi import FastAPI, BackgroundTasks, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import os
import uvicorn
from dotenv import load_dotenv

# Importando todas as funções do seu database.py
from database import (
    init_db, save_bpm, get_pet_history, save_alert,
    get_alert_limits, update_alert_limits, get_alerts
)
# Removido 'generate_daily_report' que causava o ImportError
from services.ai_agent import analyze_bpm_history

load_dotenv()

app = FastAPI(title="Pet Monitoring Agent - ScanTap System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BPMReading(BaseModel):
    pet_id: str
    bpm: int
    status_coleira: str = "online"

# ================== UTILITÁRIOS ==================

def check_bpm_alert(pet_id: str, bpm: int) -> bool:
    limits = get_alert_limits(pet_id)
    if bpm > limits["bpm_max"]:
        save_alert(pet_id, "BPM_ALTO", bpm, f"BPM acima do limite: {bpm} > {limits['bpm_max']}")
        return True
    if bpm < limits["bpm_min"]:
        save_alert(pet_id, "BPM_BAIXO", bpm, f"BPM abaixo do limite: {bpm} < {limits['bpm_min']}")
        return True
    return False

# ================== ROTAS ==================

@app.on_event("startup")
def startup_event():
    init_db()

@app.post("/monitor/seed", status_code=201)
async def receive_seed_data(data: BPMReading, background_tasks: BackgroundTasks):
    p_id = data.pet_id if data.pet_id else "pet_001"
    background_tasks.add_task(save_bpm, p_id, data.bpm, data.status_coleira)
    alerta_disparado = check_bpm_alert(p_id, data.bpm)
    return {"received": True, "alerta_disparado": alerta_disparado}

@app.get("/monitor/alerts/{pet_id}")
async def get_pet_alerts_route(pet_id: str, limit: int = 20):
    alerts = get_alerts(pet_id, limit)
    
    if not alerts:
        return {"pet_id": pet_id, "alertas": []}
    
    formatted = []
    for a in alerts:
        tipo_traduzido = "TAQUICARDIA" if a.get('tipo_alerta') == "BPM_ALTO" else "BRADICARDIA"
        
        formatted.append({
            "id": a.get('id'),
            "tipo": tipo_traduzido,
            "bpm": a.get('bpm'),
            "timestamp": a.get('timestamp'),
            "mensagem": a.get('mensagem'),
            "lido": bool(a.get('resolvido', 0))
        })
        
    return {"pet_id": pet_id, "alertas": formatted}

@app.post("/monitor/alerts/read-all/{pet_id}")
async def mark_all_alerts_as_read(pet_id: str):
    """Marca todos os alertas de um pet como lidos"""
    try:
        import sqlite3
        conn = sqlite3.connect(os.getenv("DATABASE_PATH", "pet_monitor.db"))
        cursor = conn.cursor()
        cursor.execute("UPDATE alertas SET resolvido = 1 WHERE pet_id = ?", (pet_id,))
        conn.commit()
        conn.close()
        return {"status": "sucesso", "mensagem": "Todos os alertas marcados como lidos"}
    except Exception as e:
        return {"status": "erro", "mensagem": str(e)}

@app.get("/monitor/history/{pet_id}")
async def get_pet_history_route(pet_id: str, limit: int = 30):
    history = get_pet_history(pet_id, limit)
    return {"pet_id": pet_id, "dados": history}

@app.get("/monitor/analysis/{pet_id}")
async def get_pet_analysis(pet_id: str, limit: int = 50):
    history = get_pet_history(pet_id, limit)
    if not history:
        raise HTTPException(status_code=404, detail="Sem dados para análise")
    
    analysis = analyze_bpm_history(history)
    
    return {
        "pet_id": pet_id,
        "analise_ia": analysis,
        "status": "sucesso"
    }

@app.get("/settings/limits/{pet_id}")
async def get_alert_limits_route(pet_id: str):
    return {"pet_id": pet_id, **get_alert_limits(pet_id)}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)