from database import init_db, save_bpm, save_alert, update_alert_limits
from datetime import datetime, timedelta

# Inicializar banco
init_db()

# Salvar alguns BPMs
save_bpm("pet_001", 85, "online")
save_bpm("pet_001", 95, "online")
save_bpm("pet_001", 145, "online")  # Taquicardia
save_bpm("pet_001", 55, "online")   # Bradicardia

# Salvar alertas de teste
save_alert("pet_001", "BPM_ALTO", 145, "BPM acima do limite: 145 > 140")
save_alert("pet_001", "BPM_BAIXO", 55, "BPM abaixo do limite: 55 < 60")

# Configurar limites
update_alert_limits("pet_001", 60, 140)

print("✅ Alertas de teste adicionados ao banco!")
