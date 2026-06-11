import os
from typing import Dict, List, Optional

import requests

LLM_API_KEY = os.getenv("LLM_API_KEY")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")


def normalize_language(language: str = "pt") -> str:
    return "en" if str(language).lower().startswith("en") else "pt"


def analyze_bpm_history(bpm_data: List[Dict], language: str = "pt") -> Dict:
    lang = normalize_language(language)

    if not bpm_data or len(bpm_data) < 5:
        return insufficient_data_report(len(bpm_data or []), lang)

    bpms = [int(d.get("bpm", 0)) for d in bpm_data if d.get("bpm") is not None]
    if len(bpms) < 5:
        return insufficient_data_report(len(bpms), lang)

    avg_bpm = round(sum(bpms) / len(bpms))
    max_bpm = max(bpms)
    min_bpm = min(bpms)
    latest_bpm = bpms[0]
    amplitude = max_bpm - min_bpm

    recent_slice = bpms[: min(5, len(bpms))]
    older_slice = bpms[min(5, len(bpms)):] or bpms
    recent_avg = sum(recent_slice) / len(recent_slice)
    older_avg = sum(older_slice) / len(older_slice)
    trend_key = classify_trend(recent_avg, older_avg)
    stability_key = classify_stability(amplitude)
    risk_key = classify_risk(avg_bpm, max_bpm, min_bpm, amplitude)
    activity_key = classify_activity(avg_bpm, max_bpm, amplitude, trend_key)

    local = local_content(lang, {
        "avg_bpm": avg_bpm,
        "max_bpm": max_bpm,
        "min_bpm": min_bpm,
        "latest_bpm": latest_bpm,
        "amplitude": amplitude,
        "trend_key": trend_key,
        "stability_key": stability_key,
        "risk_key": risk_key,
        "activity_key": activity_key,
        "total": len(bpms),
    })

    ai_text = request_llm_analysis(lang, local) or local["analysis"]

    return {
        "analysis": ai_text,
        "summary": local["summary"],
        "recommendation": local["recommendation"],
        "risk_level": risk_key,
        "activity_state": activity_key,
        "trend": trend_key,
        "stability": stability_key,
        "bpm_medio": avg_bpm,
        "bpm_min": min_bpm,
        "bpm_max": max_bpm,
        "bpm_atual": latest_bpm,
        "variabilidade": amplitude,
        "total_leituras": len(bpms),
        "language": lang,
    }


def classify_trend(recent_avg: float, older_avg: float) -> str:
    if recent_avg > older_avg + 5:
        return "rising"
    if recent_avg < older_avg - 5:
        return "falling"
    return "stable"


def classify_stability(amplitude: int) -> str:
    if amplitude <= 18:
        return "high"
    if amplitude <= 45:
        return "medium"
    return "low"


def classify_risk(avg_bpm: int, max_bpm: int, min_bpm: int, amplitude: int) -> str:
    if max_bpm >= 160 or min_bpm <= 50:
        return "high"
    if max_bpm >= 140 or min_bpm <= 60 or amplitude > 50:
        return "attention"
    return "normal"


def classify_activity(avg_bpm: int, max_bpm: int, amplitude: int, trend_key: str) -> str:
    if max_bpm >= 145 and trend_key == "rising":
        return "stress_or_exercise"
    if avg_bpm < 80 and amplitude <= 18:
        return "resting"
    if amplitude > 45:
        return "alternating"
    return "routine"


def insufficient_data_report(total: int, lang: str) -> Dict:
    if lang == "en":
        return {
            "analysis": "There are not enough readings yet for a reliable behavior analysis.",
            "summary": "Waiting for more heart-rate samples.",
            "recommendation": "Keep the collar connected for a few more minutes and refresh this screen.",
            "risk_level": "unknown",
            "activity_state": "unknown",
            "trend": "unknown",
            "stability": "unknown",
            "bpm_medio": 0,
            "bpm_min": 0,
            "bpm_max": 0,
            "bpm_atual": 0,
            "variabilidade": 0,
            "total_leituras": total,
            "language": lang,
        }

    return {
        "analysis": "Ainda nao ha leituras suficientes para uma analise comportamental confiavel.",
        "summary": "Aguardando mais amostras de frequencia cardiaca.",
        "recommendation": "Mantenha a coleira conectada por mais alguns minutos e atualize esta tela.",
        "risk_level": "unknown",
        "activity_state": "unknown",
        "trend": "unknown",
        "stability": "unknown",
        "bpm_medio": 0,
        "bpm_min": 0,
        "bpm_max": 0,
        "bpm_atual": 0,
        "variabilidade": 0,
        "total_leituras": total,
        "language": lang,
    }


def local_content(lang: str, metrics: Dict) -> Dict[str, str]:
    avg_bpm = metrics["avg_bpm"]
    max_bpm = metrics["max_bpm"]
    min_bpm = metrics["min_bpm"]
    amplitude = metrics["amplitude"]
    trend_key = metrics["trend_key"]
    stability_key = metrics["stability_key"]
    risk_key = metrics["risk_key"]
    activity_key = metrics["activity_key"]
    total = metrics["total"]

    if lang == "en":
        trend_label = {"rising": "rising", "falling": "falling", "stable": "stable"}[trend_key]
        stability_label = {"high": "high", "medium": "moderate", "low": "low"}[stability_key]

        if risk_key == "high":
            recommendation = "Check your pet now. If the high or low BPM persists at rest, contact a veterinarian."
        elif risk_key == "attention":
            recommendation = "Observe hydration, heat, recent activity and behavior over the next few minutes."
        else:
            recommendation = "Keep monitoring. The current pattern is compatible with a routine indoor period."

        activity_summary = {
            "resting": "The pattern suggests a calm resting period.",
            "alternating": "The pattern suggests alternating activity and short pauses.",
            "stress_or_exercise": "The pattern may indicate exercise, heat, excitement or stress.",
            "routine": "The pattern looks compatible with normal daily activity.",
        }[activity_key]

        return {
            "summary": f"{activity_summary} Stability is {stability_label}, with a {trend_label} recent trend.",
            "analysis": (
                f"Across {total} readings, the average was {avg_bpm} BPM, ranging from {min_bpm} to {max_bpm}. "
                f"The {amplitude} BPM variation indicates {stability_label} stability and a {trend_label} recent trend."
            ),
            "recommendation": recommendation,
        }

    trend_label = {"rising": "subindo", "falling": "descendo", "stable": "estavel"}[trend_key]
    stability_label = {"high": "alta", "medium": "moderada", "low": "baixa"}[stability_key]

    if risk_key == "high":
        recommendation = "Verifique seu pet agora. Se o BPM alto ou baixo persistir em repouso, procure um veterinario."
    elif risk_key == "attention":
        recommendation = "Observe hidratacao, calor, atividade recente e comportamento nos proximos minutos."
    else:
        recommendation = "Continue monitorando. O padrao atual combina com um periodo domestico de rotina."

    activity_summary = {
        "resting": "O padrao sugere um periodo calmo de repouso.",
        "alternating": "O padrao sugere alternancia entre atividade e pausas curtas.",
        "stress_or_exercise": "O padrao pode indicar exercicio, calor, excitacao ou estresse.",
        "routine": "O padrao parece compativel com atividade diaria normal.",
    }[activity_key]

    return {
        "summary": f"{activity_summary} A estabilidade esta {stability_label}, com tendencia recente {trend_label}.",
        "analysis": (
            f"Em {total} leituras, a media foi {avg_bpm} BPM, variando de {min_bpm} a {max_bpm}. "
            f"A oscilacao de {amplitude} BPM indica estabilidade {stability_label} e tendencia recente {trend_label}."
        ),
        "recommendation": recommendation,
    }


def request_llm_analysis(lang: str, local: Dict[str, str]) -> Optional[str]:
    if not LLM_API_KEY:
        return None

    if lang == "en":
        system = "You are a careful pet health monitoring assistant. You do not diagnose."
        prompt = (
            "Rewrite the following pet heart-rate analysis in clear English for a tutor. "
            "Keep it under 55 words, mention it is not a diagnosis, and preserve the recommendation.\n\n"
            f"Analysis: {local['analysis']}\nRecommendation: {local['recommendation']}"
        )
    else:
        system = "Voce e um assistente cuidadoso de monitoramento de saude pet. Voce nao diagnostica."
        prompt = (
            "Reescreva a analise cardiaca abaixo em portugues claro para um tutor. "
            "Use no maximo 55 palavras, mencione que nao e diagnostico e preserve a recomendacao.\n\n"
            f"Analise: {local['analysis']}\nRecomendacao: {local['recommendation']}"
        )

    try:
        headers = {"Authorization": f"Bearer {LLM_API_KEY}"}
        payload = {
            "model": LLM_MODEL,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.35,
            "max_tokens": 140,
        }
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            json=payload,
            headers=headers,
            timeout=12,
        )

        if response.status_code == 200:
            return response.json()["choices"][0]["message"]["content"].strip()
    except Exception as exc:
        print(f"Erro IA: {exc}")

    return None
