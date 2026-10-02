"""Fetch all traits on a Conversation Memory profile, grouped by traitGroup.

GET /v1/Stores/{storeId}/Profiles/{profileId}/Traits returns a flat list;
traits carry a traitGroup field so callers typically fold them into
{group: {name: value}} for display or for passing into an LLM system
prompt.
"""
import os

import requests


MEMORY_BASE = "https://memory.twilio.com/v1"
auth = (os.environ["TWILIO_ACCOUNT_SID"], os.environ["TWILIO_AUTH_TOKEN"])
headers = {"Content-Type": "application/json"}


def get_traits_grouped(store_id: str, profile_id: str) -> dict[str, dict]:
    resp = requests.get(
        f"{MEMORY_BASE}/Stores/{store_id}/Profiles/{profile_id}/Traits",
        auth=auth,
        headers=headers,
        params={"pageSize": 200},
    )
    resp.raise_for_status()

    grouped: dict[str, dict] = {}
    for t in resp.json().get("items", []):
        grouped.setdefault(t.get("traitGroup", "default"), {})[t["name"]] = t.get("value")
    return grouped
