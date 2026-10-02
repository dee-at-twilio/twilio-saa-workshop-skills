"""Recall observations, summaries, and communications for a Memory profile.

POST /v1/Stores/{storeId}/Profiles/{profileId}/Recall returns three
parallel lists, each with its own limit. Passing a query runs a semantic
search; leaving it blank returns most-recent order. A conversationId
scopes recall to that one conversation.
"""
import os

import requests


MEMORY_BASE = "https://memory.twilio.com/v1"
auth = (os.environ["TWILIO_ACCOUNT_SID"], os.environ["TWILIO_AUTH_TOKEN"])
headers = {"Content-Type": "application/json"}


def recall(
    store_id: str,
    profile_id: str,
    query: str | None = None,
    conversation_id: str | None = None,
    observations_limit: int = 10,
    summaries_limit: int = 5,
    communications_limit: int = 5,
) -> dict:
    """Returns {"observations": [...], "summaries": [...], "communications": [...]}."""
    body: dict = {
        "observationsLimit": observations_limit,
        "summariesLimit": summaries_limit,
        "communicationsLimit": communications_limit,
    }
    if query:
        body["query"] = query
    if conversation_id:
        body["conversationId"] = conversation_id

    resp = requests.post(
        f"{MEMORY_BASE}/Stores/{store_id}/Profiles/{profile_id}/Recall",
        auth=auth,
        headers=headers,
        json=body,
    )
    resp.raise_for_status()
    return resp.json()
