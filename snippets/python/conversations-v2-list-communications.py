"""List all communications on a Conversation.

GET /v2/Conversations/{id}/Communications returns every message/call across
channels linked to that conversation. Optional channelId narrows to one
channel. Response items include author (channel + address), content
(TEXT or other types), recipients, and occurredAt.
"""
import os

import requests


BASE_URL = "https://conversations.twilio.com/v2/Conversations"
auth = (os.environ["TWILIO_ACCOUNT_SID"], os.environ["TWILIO_AUTH_TOKEN"])


def list_communications(
    conversation_id: str,
    channel_id: str | None = None,
    page_size: int = 50,
) -> list[dict]:
    url = f"{BASE_URL}/{conversation_id}/Communications"
    params = {"pageSize": page_size}
    if channel_id:
        params["channelId"] = channel_id
    resp = requests.get(url, auth=auth, params=params, timeout=10)
    resp.raise_for_status()
    return resp.json().get("communications", [])
