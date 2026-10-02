"""Resolve a Conversation Memory profile ID from an E.164 phone number.

POST /v1/Stores/{storeId}/Profiles/Lookup normalizes the phone number
and returns matching profile IDs. The response normalizedValue is useful
for display/logging. A caller may match multiple profiles; the first is
the usual pick, but callers should decide.
"""
import os

import requests


MEMORY_BASE = "https://memory.twilio.com/v1"
auth = (os.environ["TWILIO_ACCOUNT_SID"], os.environ["TWILIO_AUTH_TOKEN"])
headers = {"Content-Type": "application/json"}


def lookup_profile_by_phone(store_id: str, phone: str) -> dict:
    """Returns {"profiles": [...], "normalizedValue": "+..."}."""
    resp = requests.post(
        f"{MEMORY_BASE}/Stores/{store_id}/Profiles/Lookup",
        auth=auth,
        headers=headers,
        json={"idType": "phone", "value": phone},
    )
    resp.raise_for_status()
    return resp.json()
