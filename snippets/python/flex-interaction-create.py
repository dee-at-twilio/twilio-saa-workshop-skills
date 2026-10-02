"""Create a Flex Interaction routed to a specific worker.

Used for agent-initiated outbound: once a Conversations channel exists for
the customer, wrap it in a Flex Interaction that targets a specific worker
via (workspace_sid, workflow_sid, queue_sid, worker_sid). The task's
attributes carry customer context onto the agent's desktop.
"""
import os

from twilio.rest import Client


client = Client(os.environ["TWILIO_ACCOUNT_SID"], os.environ["TWILIO_AUTH_TOKEN"])

workspace_sid = os.environ["FLEX_APP_WORKSPACE_SID"]
workflow_sid = os.environ["FLEX_APP_WORKFLOW_SID"]
queue_sid = os.environ["FLEX_APP_QUEUE_SID"]
worker_sid = os.environ["FLEX_APP_WORKER_SID"]


def create_outbound_sms_interaction(
    conversation_sid: str,
    customer_name: str,
    customer_address: str,
    from_number: str,
) -> dict:
    interaction = client.flex_api.v1.interaction.create(
        channel={
            "type": "sms",
            "initiated_by": "agent",
            "properties": {"media_channel_sid": conversation_sid},
        },
        routing={
            "properties": {
                "workspace_sid": workspace_sid,
                "workflow_sid": workflow_sid,
                "queue_sid": queue_sid,
                "worker_sid": worker_sid,
                "task_channel_unique_name": "chat",
                "media_channel_sid": conversation_sid,
                "attributes": {
                    "customerName": customer_name,
                    "from": from_number,
                    "direction": "outbound",
                    "customerAddress": customer_address,
                    "twilioNumber": from_number,
                },
            }
        },
    )
    return interaction.routing["properties"]
