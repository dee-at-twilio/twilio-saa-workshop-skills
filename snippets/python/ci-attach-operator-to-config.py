"""Attach a Language Operator to an Intelligence Configuration.

PUT on a Configuration silently creates an inactive version — so the
reliable path is DELETE + POST to recreate the config with the merged
rules. The new config ID is different; update any external references
(e.g. Conversation Orchestrator intelligenceConfigurationIds) to point
at it.

A rule binds an operator to a trigger (COMMUNICATION with throttle,
CONVERSATION_END, or CONVERSATION_INACTIVE) and posts results to a
webhook action.
"""
import os

import requests


INTEL_BASE = "https://intelligence.twilio.com/v3"
auth = (os.environ["TWILIO_ACCOUNT_SID"], os.environ["TWILIO_AUTH_TOKEN"])
headers = {"Content-Type": "application/json"}


def _strip_rule_ids(rule: dict) -> dict:
    """Rule IDs are server-generated; passing existing ones back on create is rejected."""
    return {k: v for k, v in rule.items() if k != "id"}


def attach_operator_rule(
    config_id: str,
    operator_id: str,
    webhook_url: str,
    trigger_on: str = "COMMUNICATION",
    throttle: int = 1,
) -> dict:
    get_resp = requests.get(
        f"{INTEL_BASE}/ControlPlane/Configurations/{config_id}",
        auth=auth,
        headers=headers,
    )
    get_resp.raise_for_status()
    current = get_resp.json()

    trigger: dict = {"on": trigger_on}
    if trigger_on == "COMMUNICATION" and throttle > 1:
        trigger["parameters"] = {"count": int(throttle)}

    new_rule = {
        "operators": [{"id": operator_id}],
        "triggers": [trigger],
        "actions": [{"type": "WEBHOOK", "method": "POST", "url": webhook_url}],
    }
    rules = current.get("rules", []) + [new_rule]

    del_resp = requests.delete(
        f"{INTEL_BASE}/ControlPlane/Configurations/{config_id}",
        auth=auth,
        headers=headers,
    )
    if del_resp.status_code >= 300 and del_resp.status_code != 404:
        del_resp.raise_for_status()

    create_body = {
        "displayName": current.get("displayName", "Config"),
        "description": current.get("description"),
        "rules": [_strip_rule_ids(r) for r in rules],
    }
    create_resp = requests.post(
        f"{INTEL_BASE}/ControlPlane/Configurations",
        auth=auth,
        headers=headers,
        json={k: v for k, v in create_body.items() if v is not None},
    )
    create_resp.raise_for_status()
    return create_resp.json()
