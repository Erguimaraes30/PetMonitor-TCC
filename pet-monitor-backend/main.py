from fastapi import FastAPI, BackgroundTasks, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timezone
import os
import uvicorn
import requests
from dotenv import load_dotenv

# Importando todas as funções do seu database.py
from database import (
    init_db, save_bpm, get_pet_history, save_alert,
    get_alert_limits, update_alert_limits, get_alerts,
    update_email_settings, get_email_settings,
    get_alert_state, set_alert_state
)
# Removido 'generate_daily_report' que causava o ImportError
from services.ai_agent import analyze_bpm_history
from services.email_svc import send_alert_email

load_dotenv()

ADAFRUIT_USERNAME = os.getenv("ADAFRUIT_IO_USERNAME") or os.getenv("ADAFRUIT_USERNAME")
ADAFRUIT_IO_KEY = os.getenv("ADAFRUIT_IO_KEY")
ADAFRUIT_BASE_URL = "https://io.adafruit.com/api/v2"
PETMONITOR_FEEDS = ("bpm", "ir", "status")

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

class EmailAlertSettings(BaseModel):
    enabled: bool
    tutor_email: str = ""
    vet_email: str = ""
    tutor_nome: str = ""
    vet_nome: str = ""
    pet_nome: str = ""

# ================== UTILITÁRIOS ==================

def parse_int(value):
    try:
        if value is None or str(value).strip() == "":
            return 0
        return int(float(value))
    except (TypeError, ValueError):
        return 0


def parse_status(value):
    if value is None or str(value).strip() == "":
        return "sem dados"
    return str(value).strip()


def get_feed_last_value(feed_key):
    url = f"{ADAFRUIT_BASE_URL}/{ADAFRUIT_USERNAME}/feeds/{feed_key}/data/last"
    response = requests.get(
        url,
        headers={"X-AIO-Key": ADAFRUIT_IO_KEY},
        timeout=10,
    )
    response.raise_for_status()
    data = response.json()

    return {
        "value": data.get("value"),
        "created_at": data.get("created_at"),
    }


def check_bpm_alert(pet_id: str, bpm: int, background_tasks: BackgroundTasks = None) -> bool:
    limits = get_alert_limits(pet_id)
    state = get_alert_state(pet_id)
    active_type = state.get("active_type")

    if bpm > limits["bpm_max"]:
        message = f"BPM acima do limite: {bpm} > {limits['bpm_max']}"
        save_alert(pet_id, "BPM_ALTO", bpm, message)
        if active_type != "BPM_ALTO":
            email_settings = get_email_settings(pet_id)
            if background_tasks:
                background_tasks.add_task(
                    send_alert_email,
                    pet_id,
                    "BPM_ALTO",
                    bpm,
                    message,
                    email_settings,
                )
                print(f"📨 E-mail de taquicardia enfileirado para {pet_id}")
            else:
                send_alert_email(pet_id, "BPM_ALTO", bpm, message, email_settings)
        else:
            print(f"ℹ️  Alerta BPM_ALTO já ativo para {pet_id}; sem novo e-mail")
        set_alert_state(pet_id, "BPM_ALTO")
        return True

    if bpm < limits["bpm_min"]:
        message = f"BPM abaixo do limite: {bpm} < {limits['bpm_min']}"
        save_alert(pet_id, "BPM_BAIXO", bpm, message)
        if active_type != "BPM_BAIXO":
            email_settings = get_email_settings(pet_id)
            if background_tasks:
                background_tasks.add_task(
                    send_alert_email,
                    pet_id,
                    "BPM_BAIXO",
                    bpm,
                    message,
                    email_settings,
                )
                print(f"📨 E-mail de bradicardia enfileirado para {pet_id}")
            else:
                send_alert_email(pet_id, "BPM_BAIXO", bpm, message, email_settings)
        else:
            print(f"ℹ️  Alerta BPM_BAIXO já ativo para {pet_id}; sem novo e-mail")
        set_alert_state(pet_id, "BPM_BAIXO")
        return True

    if active_type is not None:
        print(f"✅ BPM normalizado para {pet_id}; estado de alerta limpo")
        set_alert_state(pet_id, None)

    return False

# ================== ROTAS ==================

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/")
async def root():
    return {
        "service": "PetMonitor API",
        "status": "online",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/petmonitor/latest")
async def petmonitor_latest():
    if not ADAFRUIT_USERNAME or not ADAFRUIT_IO_KEY:
        return {
            "error": True,
            "message": "Variaveis ADAFRUIT_IO_USERNAME e ADAFRUIT_IO_KEY precisam estar configuradas.",
            "source": "adafruit_io",
        }

    feed_values = {}
    errors = {}
    updated_at_values = []

    for feed_key in PETMONITOR_FEEDS:
        try:
            result = get_feed_last_value(feed_key)
            feed_values[feed_key] = result.get("value")
            if result.get("created_at"):
                updated_at_values.append(result["created_at"])
        except (requests.exceptions.RequestException, ValueError) as exc:
            errors[feed_key] = f"Falha ao buscar feed '{feed_key}': {exc}"

    response = {
        "bpm": parse_int(feed_values.get("bpm")),
        "ir": parse_int(feed_values.get("ir")),
        "status": parse_status(feed_values.get("status")),
        "updated_at": max(updated_at_values) if updated_at_values else datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "source": "adafruit_io",
    }

    if errors:
        response["error"] = True
        response["message"] = "Um ou mais feeds nao puderam ser lidos."
        response["errors"] = errors

    return response


@app.post("/monitor/seed", status_code=201)
async def receive_seed_data(data: BPMReading, background_tasks: BackgroundTasks):
    p_id = data.pet_id if data.pet_id else "pet_001"
    background_tasks.add_task(save_bpm, p_id, data.bpm, data.status_coleira)
    alerta_disparado = check_bpm_alert(p_id, data.bpm, background_tasks)
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
async def get_pet_analysis(pet_id: str, limit: int = 50, lang: str = "pt"):
    history = get_pet_history(pet_id, limit)
    if not history:
        raise HTTPException(status_code=404, detail="Sem dados para análise")
    
    report = analyze_bpm_history(history, lang)
    
    return {
        "pet_id": pet_id,
        "analise_ia": report.get("analysis", ""),
        "relatorio": report,
        "status": "sucesso"
    }

@app.get("/settings/limits/{pet_id}")
async def get_alert_limits_route(pet_id: str):
    return {"pet_id": pet_id, **get_alert_limits(pet_id)}

@app.get("/settings/email-alerts/{pet_id}")
async def get_email_alert_settings_route(pet_id: str):
    return {"pet_id": pet_id, **get_email_settings(pet_id)}

@app.post("/settings/email-alerts/{pet_id}")
async def update_email_alert_settings_route(pet_id: str, settings: EmailAlertSettings):
    success = update_email_settings(
        pet_id,
        settings.enabled,
        settings.tutor_email,
        settings.vet_email,
        settings.tutor_nome,
        settings.vet_nome,
        settings.pet_nome,
    )

    if not success:
        raise HTTPException(status_code=500, detail="Erro ao salvar configuração de e-mail")

    return {"status": "sucesso", "pet_id": pet_id, "enabled": settings.enabled}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
