"""Create a custom Conversation Intelligence Language Operator.

POST /v3/ControlPlane/Operators defines a reusable analysis task run
against captured conversations. outputFormat is TEXT, CLASSIFICATION, or
JSON (JSON requires an outputSchema). Setting context.memory.enabled
exposes the memory tools to the operator — the prompt must then instruct
the LLM to call them.
"""
import os

import requests


INTEL_BASE = "https://intelligence.twilio.com/v3"
auth = (os.environ["TWILIO_ACCOUNT_SID"], os.environ["TWILIO_AUTH_TOKEN"])
headers = {"Content-Type": "application/json"}


def create_operator(
    display_name: str,
    prompt: str,
    output_format: str = "TEXT",
    description: str | None = None,
    parameters: dict | None = None,
    output_schema: dict | None = None,
    training_examples: list[dict] | None = None,
    memory_enabled: bool = False,
) -> dict:
    body: dict = {
        "displayName": display_name,
        "prompt": prompt,
        "outputFormat": output_format,
    }
    if description:
        body["description"] = description
    if parameters is not None:
        body["parameters"] = parameters
    if output_format == "JSON" and output_schema is not None:
        body["outputSchema"] = output_schema
    if training_examples is not None:
        body["trainingExamples"] = training_examples
    if memory_enabled:
        body["context"] = {"memory": {"enabled": True}}

    resp = requests.post(
        f"{INTEL_BASE}/ControlPlane/Operators",
        auth=auth,
        headers=headers,
        json=body,
    )
    resp.raise_for_status()
    return resp.json()
