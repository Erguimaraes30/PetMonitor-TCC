import sqlite3
from datetime import datetime
from typing import List, Dict, Any
import os

DATABASE_PATH = os.getenv("DATABASE_PATH", "pet_monitor.db")

def init_db():
    """
    Inicializa o banco de dados com as tabelas necessárias.
    """
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Tabela de Pets
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pets (
            pet_id TEXT PRIMARY KEY,
            nome TEXT NOT NULL,
            especie TEXT,
            raca TEXT,
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Tabela de Histórico de BPM
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bpm_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pet_id TEXT NOT NULL,
            bpm INTEGER NOT NULL,
            status_coleira TEXT DEFAULT 'online',
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (pet_id) REFERENCES pets(pet_id)
        )
    """)
    
    # Tabela de Alertas
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS alertas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pet_id TEXT NOT NULL,
            tipo_alerta TEXT,
            bpm_registrado INTEGER,
            mensagem TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolvido INTEGER DEFAULT 0,
            FOREIGN KEY (pet_id) REFERENCES pets(pet_id)
        )
    """)
    
    # Tabela de Limites de Alerta por Pet
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS alert_limits (
            pet_id TEXT PRIMARY KEY,
            bpm_min INTEGER DEFAULT 60,
            bpm_max INTEGER DEFAULT 140,
            atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (pet_id) REFERENCES pets(pet_id)
        )
    """)
    
    conn.commit()
    conn.close()
    print("✅ Banco de dados inicializado!")


def save_bpm(pet_id: str, bpm: int, status_coleira: str = "online") -> bool:
    """
    Salva uma leitura de BPM no histórico.
    """
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO bpm_history (pet_id, bpm, status_coleira, timestamp)
            VALUES (?, ?, ?, ?)
        """, (pet_id, bpm, status_coleira, datetime.now().isoformat()))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Erro ao salvar BPM: {e}")
        return False


def get_pet_history(pet_id: str, limit: int = 20) -> List[Dict[str, Any]]:
    """
    Retorna o histórico de BPMs de um pet.
    """
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT bpm, timestamp, status_coleira FROM bpm_history
            WHERE pet_id = ?
            ORDER BY timestamp DESC LIMIT ?
        """, (pet_id, limit))
        rows = cursor.fetchall()
        conn.close()
        
        return [
            {
                "bpm": r[0],
                "timestamp": r[1],
                "status_coleira": r[2]
            } for r in rows
        ]
    except Exception as e:
        print(f"❌ Erro ao buscar histórico: {e}")
        return []


def save_alert(pet_id: str, tipo_alerta: str, bpm: int, mensagem: str) -> bool:
    """
    Salva um alerta no banco de dados.
    """
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO alertas (pet_id, tipo_alerta, bpm_registrado, mensagem, timestamp)
            VALUES (?, ?, ?, ?, ?)
        """, (pet_id, tipo_alerta, bpm, mensagem, datetime.now().isoformat()))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Erro ao salvar alerta: {e}")
        return False


def get_alert_limits(pet_id: str) -> Dict[str, int]:
    """
    Retorna os limites de alerta de um pet.
    """
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT bpm_min, bpm_max FROM alert_limits
            WHERE pet_id = ?
        """, (pet_id,))
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return {"bpm_min": result[0], "bpm_max": result[1]}
        else:
            # Retorna valores padrão se não existir
            return {"bpm_min": 60, "bpm_max": 140}
    except Exception as e:
        print(f"❌ Erro ao buscar limites: {e}")
        return {"bpm_min": 60, "bpm_max": 140}


def update_alert_limits(pet_id: str, bpm_min: int, bpm_max: int) -> bool:
    """
    Atualiza os limites de alerta de um pet.
    """
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO alert_limits (pet_id, bpm_min, bpm_max, atualizado_em)
            VALUES (?, ?, ?, ?)
        """, (pet_id, bpm_min, bpm_max, datetime.now().isoformat()))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Erro ao atualizar limites: {e}")
        return False
def get_alerts(pet_id: str, limit: int = 20) -> List[Dict[str, Any]]:
    """
    Retorna a lista de alertas registrados para um pet.
    """
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        # Usamos o row_factory para retornar dicionários em vez de tuplas
        conn.row_factory = sqlite3.Row 
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, tipo_alerta, bpm_registrado as bpm, mensagem, timestamp, resolvido 
            FROM alertas
            WHERE pet_id = ?
            ORDER BY timestamp DESC LIMIT ?
        """, (pet_id, limit))
        rows = cursor.fetchall()
        conn.close()
        
        # Converte cada linha em um dicionário real
        return [dict(row) for row in rows]
    except Exception as e:
        print(f"❌ Erro ao buscar alertas no banco: {e}")
        return []