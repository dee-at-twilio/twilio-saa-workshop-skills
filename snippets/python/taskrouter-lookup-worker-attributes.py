"""Look up a TaskRouter Worker's attributes by friendly_name.

Common when a Conversations participant has an identity string (e.g. an
agent's email) and you need the human-readable name or skills set stored
in the Worker's attributes JSON.
"""
import json
import os

from twilio.rest import Client


client = Client(os.environ["TWILIO_ACCOUNT_SID"], os.environ["TWILIO_AUTH_TOKEN"])
workspace_sid = os.environ["FLEX_APP_WORKSPACE_SID"]


def get_worker_attributes_by_friendly_name(friendly_name: str) -> dict | None:
    workers = client.taskrouter.v1.workspaces(workspace_sid).workers.list(
        friendly_name=friendly_name
    )
    if not workers:
        return None
    return json.loads(workers[0].attributes)
