"""Fetch ConversationRelay runtime events from Voice Insights.

GET /v1/Voice/Calls/{callSid}/Events returns the full event stream for the
call; CR-specific event names cover prompt_sent, token-received, STT/TTS
latency, and speech-boundary markers. Useful for post-call turn-by-turn
inspection and latency dashboards.
"""
import os

import requests


auth = (os.environ["TWILIO_ACCOUNT_SID"], os.environ["TWILIO_AUTH_TOKEN"])

CR_EVENT_NAMES = {
    "prompt_sent",
    "first_token_received",
    "final_token_received",
    "stt_latency",
    "tts_latency",
    "start_of_customer_speech",
    "end_of_customer_speech",
    "start_of_agent_speech",
    "end_of_agent_speech",
    "interrupt",
    "configurations",
    "call_wrap_up",
}


def fetch_cr_events(call_sid: str) -> list[dict]:
    url = f"https://insights.twilio.com/v1/Voice/Calls/{call_sid}/Events"
    resp = requests.get(url, auth=auth, timeout=10)
    if resp.status_code != 200:
        return []
    return [e for e in resp.json().get("events", []) if e.get("name") in CR_EVENT_NAMES]


def summarize_latencies(events: list[dict]) -> dict:
    def _latencies(name: str) -> list[int]:
        vals = [
            e.get("event_data", {}).get("latency_ms") or e.get("latency_ms")
            for e in events
            if e.get("name") == name
        ]
        return [v for v in vals if v is not None]

    stt = _latencies("stt_latency")
    tts = _latencies("tts_latency")
    return {
        "avg_stt_ms": sum(stt) / len(stt) if stt else 0,
        "avg_tts_ms": sum(tts) / len(tts) if tts else 0,
        "stt_samples": len(stt),
        "tts_samples": len(tts),
    }
