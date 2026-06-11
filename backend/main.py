import os
from datetime import datetime, timezone

import requests
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

ADAFRUIT_USERNAME = os.getenv("ADAFRUIT_USERNAME")
ADAFRUIT_IO_KEY = os.getenv("ADAFRUIT_IO_KEY")
ADAFRUIT_BASE_URL = "https://io.adafruit.com/api/v2"
FEEDS = ("bpm", "ir", "status")

app = FastAPI(title="PetMonitor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


@app.get("/")
def root():
    return {
        "service": "PetMonitor API",
        "status": "online",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/petmonitor/latest")
def petmonitor_latest():
    if not ADAFRUIT_USERNAME or not ADAFRUIT_IO_KEY:
        return {
            "error": True,
            "message": "Variaveis ADAFRUIT_USERNAME e ADAFRUIT_IO_KEY precisam estar configuradas.",
            "source": "adafruit_io",
        }

    feed_values = {}
    errors = {}
    updated_at_values = []

    for feed_key in FEEDS:
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
