"""Fetch outbound_api call summaries from Voice Insights, paginated.

GET /v1/Voice/Summaries with direction=outbound_api and a time window.
next_page_url already has all params embedded, so follow it with empty
params. Each summary includes call_sid, to/from (as objects with
phone_number/carrier), duration, call_state, start_time.
"""
import os
from datetime import datetime

import requests


SUMMARIES_URL = "https://insights.twilio.com/v1/Voice/Summaries"
auth = (os.environ["TWILIO_ACCOUNT_SID"], os.environ["TWILIO_AUTH_TOKEN"])


def fetch_outbound_summaries(start_dt: datetime, end_dt: datetime) -> list[dict]:
    calls: list[dict] = []
    params: dict = {
        "startTime": start_dt.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "endTime": end_dt.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "direction": "outbound_api",
        "pageSize": 1000,
    }
    url: str | None = SUMMARIES_URL
    while url:
        resp = requests.get(url, auth=auth, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        calls.extend(data.get("call_summaries", []))
        url = data.get("meta", {}).get("next_page_url")
        params = {}
    return calls
