import argparse
import os
from pathlib import Path

from dotenv import load_dotenv

from services.email_svc import send_alert_email


def _env_flag(name: str) -> str:
    return "ok" if os.getenv(name) else "missing"


def main() -> int:
    env_path = Path(__file__).with_name(".env")
    load_dotenv(env_path)

    parser = argparse.ArgumentParser(description="Envia um e-mail de teste do PetMonitor.")
    parser.add_argument("--to", required=True, help="E-mail destinatario do teste.")
    parser.add_argument("--pet-id", default="pet_001", help="ID do pet usado no assunto.")
    parser.add_argument("--pet-name", default="Pet de Teste", help="Nome do pet usado no corpo.")
    parser.add_argument("--bpm", type=int, default=155, help="BPM usado no alerta de teste.")
    parser.add_argument(
        "--alert-type",
        choices=["BPM_ALTO", "BPM_BAIXO"],
        default="BPM_ALTO",
        help="Tipo do alerta de teste.",
    )
    parser.add_argument(
        "--show-config",
        action="store_true",
        help="Mostra quais variaveis de envio foram encontradas.",
    )
    args = parser.parse_args()

    if args.show_config:
        print("Configuracao detectada:")
        print(f"  RESEND_API_KEY: {_env_flag('RESEND_API_KEY')}")
        print(f"  RESEND_FROM: {_env_flag('RESEND_FROM')}")
        print(f"  SMTP_HOST: {_env_flag('SMTP_HOST')}")
        print(f"  SMTP_PORT: {os.getenv('SMTP_PORT', '587')}")
        print(f"  SMTP_USER: {_env_flag('SMTP_USER')}")
        print(f"  SMTP_PASSWORD: {_env_flag('SMTP_PASSWORD')}")
        print(f"  SMTP_FROM: {_env_flag('SMTP_FROM')}")
        print(f"  SMTP_TLS: {os.getenv('SMTP_TLS', 'true')}")
        print(f"  SMTP_SSL: {os.getenv('SMTP_SSL', 'false')}")

    settings = {
        "enabled": True,
        "tutor_email": args.to,
        "vet_email": "",
        "pet_nome": args.pet_name,
        "tutor_nome": "Tutor",
        "vet_nome": "Veterinario",
    }
    ai_report = {
        "summary": "Teste de envio do PetMonitor.",
        "analysis": "Este e-mail confirma se o backend consegue sair para o provedor de e-mail.",
        "recommendation": "Se este teste falhar com erro de rede SMTP, configure RESEND_API_KEY e RESEND_FROM.",
    }

    sent = send_alert_email(
        args.pet_id,
        args.alert_type,
        args.bpm,
        "Teste manual de envio de alerta por e-mail.",
        settings,
        ai_report,
    )

    if sent:
        print("Resultado: e-mail enviado.")
        return 0

    print("Resultado: e-mail nao enviado. Veja a mensagem de erro acima.")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
