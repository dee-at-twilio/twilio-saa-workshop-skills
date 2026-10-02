"""Fetch a TaskRouter Task.

GET /v1/Workspaces/{workspace_sid}/Tasks/{task_sid} returns the task's
current state, attributes JSON, assignment status, age, and routing data.
"""
import os

import requests


auth = (os.environ["TWILIO_ACCOUNT_SID"], os.environ["TWILIO_AUTH_TOKEN"])
workspace_sid = os.environ["FLEX_APP_WORKSPACE_SID"]


def fetch_task(task_sid: str) -> dict:
    url = f"https://taskrouter.twilio.com/v1/Workspaces/{workspace_sid}/Tasks/{task_sid}"
    resp = requests.get(url, auth=auth, timeout=10)
    resp.raise_for_status()
    return resp.json()
