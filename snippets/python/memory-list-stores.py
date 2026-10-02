"""List all Conversation Memory stores on the account.

GET /v1/ControlPlane/Stores returns the store list. In some responses
stores arrive as bare ID strings instead of objects; fetch the detail
page for each one in that case so the caller always sees uniform dicts.
"""
import os

import requests


MEMORY_BASE = "https://memory.twilio.com/v1"
auth = (os.environ["TWILIO_ACCOUNT_SID"], os.environ["TWILIO_AUTH_TOKEN"])
headers = {"Content-Type": "application/json"}


def list_stores() -> list[dict]:
    resp = requests.get(
        f"{MEMORY_BASE}/ControlPlane/Stores",
        auth=auth,
        headers=headers,
        params={"pageSize": 50},
    )
    resp.raise_for_status()

    stores: list[dict] = []
    for s in resp.json().get("stores", []):
        if isinstance(s, dict):
            stores.append(s)
            continue
        detail = requests.get(
            f"{MEMORY_BASE}/ControlPlane/Stores/{s}",
            auth=auth,
            headers=headers,
        )
        stores.append(detail.json() if detail.ok else {"id": s})
    return stores
