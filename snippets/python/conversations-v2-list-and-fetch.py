"""List and fetch Conversations via the v2 API.

GET /v2/Conversations with optional status filter (ACTIVE/INACTIVE/CLOSED),
and GET /v2/Conversations/{id} to retrieve configuration + participants.
"""
import os

import requests


BASE_URL = "https://conversations.twilio.com/v2/Conversations"
auth = (os.environ["TWILIO_ACCOUNT_SID"], os.environ["TWILIO_AUTH_TOKEN"])


def list_conversations(status: str | None = None, limit: int = 20) -> list[dict]:
    params = {"limit": limit}
    if status:
        params["status"] = status
    resp = requests.get(BASE_URL, auth=auth, params=params, timeout=10)
    resp.raise_for_status()
    return resp.json().get("conversations", [])


def fetch_conversation(conversation_id: str) -> dict:
    resp = requests.get(f"{BASE_URL}/{conversation_id}", auth=auth, timeout=10)
    resp.raise_for_status()
    return resp.json()
