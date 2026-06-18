import os
import smtplib
from email.message import EmailMessage
from typing import Dict, List, Optional

import requests


def _recipients(settings: Dict) -> List[str]:
    emails = [settings.get("tutor_email"), settings.get("vet_email")]
    return sorted({email.strip() for email in emails if email and email.strip()})


def _alert_label(alert_type: str) -> str:
    return "Taquicardia" if alert_type == "BPM_ALTO" else "Bradicardia"


def _ai_section(ai_report: Optional[Dict]) -> str:
    if not ai_report:
        return ""

    lines = []
    summary = ai_report.get("summary")
    analysis = ai_report.get("analysis")
    recommendation = ai_report.get("recommendation")

    if summary:
        lines.append(f"Resumo da IA: {summary}")
    if analysis:
        lines.append(f"Analise: {analysis}")
    if recommendation:
        lines.append(f"Recomendacao: {recommendation}")

    if not lines:
        return ""

    return "\n\nInterpretacao inteligente:\n" + "\n".join(lines)


def _build_email_content(
    pet_id: str,
    alert_type: str,
    bpm: int,
    message: str,
    settings: Dict,
    ai_report: Optional[Dict],
) -> Dict[str, str]:
    pet_name = settings.get("pet_nome") or pet_id
    tutor_name = settings.get("tutor_nome") or "Tutor"
    vet_name = settings.get("vet_nome") or "Veterinario"
    subject_type = _alert_label(alert_type)
    ai_text = _ai_section(ai_report)

    return {
        "subject": f"Alerta PetMonitor: {subject_type} em {pet_name}",
        "body": (
            f"Ola, {tutor_name}.\n\n"
            f"O PetMonitor detectou um alerta de saude em {pet_name}.\n\n"
            f"Pet: {pet_name}\n"
            f"BPM registrado: {bpm}\n"
            f"Tipo: {subject_type}\n"
            f"Mensagem: {message}\n"
            f"Veterinario cadastrado: {vet_name}"
            f"{ai_text}\n\n"
            f"Este e-mail e um apoio de monitoramento e nao substitui avaliacao veterinaria.\n"
            f"Verifique o app para acompanhar o historico e os alertas recentes."
        ),
    }


def _send_with_resend(recipients: List[str], subject: str, body: str) -> bool:
    api_key = os.getenv("RESEND_API_KEY")
    if not api_key:
        return False

    sender = os.getenv("RESEND_FROM") or os.getenv("SMTP_FROM") or os.getenv("SMTP_USER")
    if not sender:
        print("RESEND_API_KEY configurado, mas RESEND_FROM/SMTP_FROM nao foi configurado.")
        return False

    try:
        response = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "from": sender,
                "to": recipients,
                "subject": subject,
                "text": body,
            },
            timeout=10,
        )
        if 200 <= response.status_code < 300:
            print(f"E-mail de alerta enviado via Resend para {', '.join(recipients)}")
            return True

        print(f"Erro ao enviar e-mail via Resend: HTTP {response.status_code} - {response.text[:300]}")
        return False
    except Exception as exc:
        print(f"Erro ao enviar e-mail via Resend: {exc}")
        return False


def _send_with_smtp(recipients: List[str], subject: str, body: str) -> bool:
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_from = os.getenv("SMTP_FROM", smtp_user or "")
    use_tls = os.getenv("SMTP_TLS", "true").lower() != "false"
    use_ssl = os.getenv("SMTP_SSL", "false").lower() == "true" or smtp_port == 465

    if not smtp_host or not smtp_from:
        print("SMTP_HOST/SMTP_FROM nao configurados. E-mail de alerta nao enviado.")
        return False

    email = EmailMessage()
    email["Subject"] = subject
    email["From"] = smtp_from
    email["To"] = ", ".join(recipients)
    email.set_content(body)

    try:
        smtp_class = smtplib.SMTP_SSL if use_ssl else smtplib.SMTP
        with smtp_class(smtp_host, smtp_port, timeout=10) as server:
            if use_tls and not use_ssl:
                server.starttls()
            if smtp_user and smtp_password:
                server.login(smtp_user, smtp_password)
            server.send_message(email)
        print(f"E-mail de alerta enviado via SMTP para {', '.join(recipients)}")
        return True
    except OSError as exc:
        print(
            "Erro de rede ao enviar e-mail via SMTP. "
            "O ambiente provavelmente nao consegue acessar o host/porta SMTP. "
            f"host={smtp_host} port={smtp_port} ssl={use_ssl} tls={use_tls} erro={exc}"
        )
        return False
    except Exception as exc:
        print(f"Erro ao enviar e-mail via SMTP: {exc}")
        return False


def send_alert_email(
    pet_id: str,
    alert_type: str,
    bpm: int,
    message: str,
    settings: Dict,
    ai_report: Optional[Dict] = None,
) -> bool:
    if not settings.get("enabled"):
        print(f"E-mail de alerta desativado para {pet_id}.")
        return False

    recipients = _recipients(settings)
    if not recipients:
        print("Alertas por e-mail ativados, mas nenhum destinatario foi configurado.")
        return False

    content = _build_email_content(pet_id, alert_type, bpm, message, settings, ai_report)

    if _send_with_resend(recipients, content["subject"], content["body"]):
        return True

    return _send_with_smtp(recipients, content["subject"], content["body"])
