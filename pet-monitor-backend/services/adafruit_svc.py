"""
Serviço de integração com Adafruit IO.
Responsável por enviar dados para os feeds do Adafruit quando o hardware estiver pronto.
"""
import os
import requests
from typing import Optional

ADAFRUIT_USERNAME = os.getenv("ADAFRUIT_IO_USERNAME")
ADAFRUIT_API_KEY = os.getenv("ADAFRUIT_IO_KEY")
ADAFRUIT_BASE_URL = f"https://io.adafruit.com/api/v2/{ADAFRUIT_USERNAME}"


def publish_bpm_to_adafruit(feed_key: str, value: int) -> bool:
    """
    Publica um valor de BPM para um feed do Adafruit IO.
    
    Args:
        feed_key: Chave do feed (ex: 'pet-monitor-bpm')
        value: Valor do BPM a ser enviado
    
    Returns:
        True se enviado com sucesso, False caso contrário
    """
    if not ADAFRUIT_API_KEY:
        print("⚠️  Adafruit API key não configurada. Pulando publicação.")
        return False
    
    try:
        url = f"{ADAFRUIT_BASE_URL}/feeds/{feed_key}/data"
        headers = {"X-AIO-Key": ADAFRUIT_API_KEY}
        payload = {"value": value}
        
        response = requests.post(url, json=payload, headers=headers, timeout=5)
        
        if response.status_code == 201:
            print(f"✅ BPM {value} enviado para Adafruit feed '{feed_key}'")
            return True
        else:
            print(f"⚠️  Erro ao enviar para Adafruit: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro na integração Adafruit: {e}")
        return False


def get_adafruit_data(feed_key: str, limit: int = 10) -> Optional[list]:
    """
    Recupera dados históricos de um feed do Adafruit.
    
    Args:
        feed_key: Chave do feed
        limit: Número de registros a recuperar
    
    Returns:
        Lista de dados ou None se erro
    """
    if not ADAFRUIT_API_KEY:
        print("⚠️  Adafruit API key não configurada.")
        return None
    
    try:
        url = f"{ADAFRUIT_BASE_URL}/feeds/{feed_key}/data"
        headers = {"X-AIO-Key": ADAFRUIT_API_KEY}
        params = {"limit": limit}
        
        response = requests.get(url, headers=headers, params=params, timeout=5)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"⚠️  Erro ao buscar dados: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Erro ao recuperar dados do Adafruit: {e}")
        return None
