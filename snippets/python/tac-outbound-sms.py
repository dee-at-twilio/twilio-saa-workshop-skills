"""Outbound SMS via Twilio Agent Connect.

SMSChannel with memory_mode="always" hydrates the conversation against the
customer's Memory profile on every turn. initiate_outbound_conversation is
async — drive from sync code with asyncio.run.
"""
import asyncio

from tac import TAC, TACConfig
from tac.channels.sms import SMSChannel, SMSChannelConfig
from tac.models.outbound import InitiateMessagingConversationOptions


def send_outbound_sms(to: str, message: str) -> str:
    tac = TAC(config=TACConfig.from_env())
    sms_channel = SMSChannel(tac, config=SMSChannelConfig(memory_mode="always"))

    result = asyncio.run(
        sms_channel.initiate_outbound_conversation(
            InitiateMessagingConversationOptions(to=to, message=message)
        )
    )
    return result.conversation_id
