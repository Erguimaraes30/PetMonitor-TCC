import os
import smtplib
from email.message import EmailMessage
from typing import Dict, List


def _recipients(settings: Dict) -> List[str]:
    emails = [settings.get("tutor_email"), settings.get("vet_email")]
    return sorted({email.strip() for email in emails if email and email.strip()})


def send_alert_email(pet_id: str, alert_type: str, bpm: int, message: str, settings: Dict) -> bool:
    if not settings.get("enabled"):
        return False

    recipients = _recipients(settings)
    if not recipients:
        print("⚠️  Alertas por e-mail ativados, mas nenhum destinatário foi configurado.")
        return False

    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_from = os.getenv("SMTP_FROM", smtp_user or "")
    use_tls = os.getenv("SMTP_TLS", "true").lower() != "false"

    if not smtp_host or not smtp_from:
        print("⚠️  SMTP_HOST/SMTP_FROM não configurados. E-mail de alerta não enviado.")
        return False

    pet_name = settings.get("pet_nome") or pet_id
    subject_type = "Taquicardia" if alert_type == "BPM_ALTO" else "Bradicardia"

    email = EmailMessage()
    email["Subject"] = f"Alerta PetMonitor: {subject_type} em {pet_name}"
    email["From"] = smtp_from
    email["To"] = ", ".join(recipients)
    email.set_content(
        f"Alerta de saúde detectado pelo PetMonitor.\n\n"
        f"Pet: {pet_name}\n"
        f"BPM registrado: {bpm}\n"
        f"Tipo: {subject_type}\n"
        f"Mensagem: {message}\n\n"
        f"Verifique o app para acompanhar o histórico e os alertas recentes."
    )

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
            if use_tls:
                server.starttls()
            if smtp_user and smtp_password:
                server.login(smtp_user, smtp_password)
            server.send_message(email)
        print(f"✅ E-mail de alerta enviado para {', '.join(recipients)}")
        return True
    except Exception as e:
        print(f"❌ Erro ao enviar e-mail de alerta: {e}")
        return False
