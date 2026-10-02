"""Outbound voice call via Twilio Agent Connect.

VoiceChannel with memory_mode="always" hydrates the Memory profile.
websocket_url is the endpoint ConversationRelay connects to for the
STT/TTS + LLM turn loop. action_url is the POST-SESSION callback — Twilio
POSTs to it AFTER the <Connect> verb ends, with SessionStatus and
HandoffData — it is NOT the endpoint that returns the initial TwiML.
"""
import asyncio
import os

from tac import TAC, TACConfig
from tac.channels.voice import VoiceChannel, VoiceChannelConfig
from tac.models.outbound import InitiateVoiceConversationOptions


public_domain = os.environ["TWILIO_VOICE_PUBLIC_DOMAIN"]


def place_outbound_call(to: str, welcome_greeting: str) -> str:
    tac = TAC(config=TACConfig.from_env())
    voice_channel = VoiceChannel(tac, config=VoiceChannelConfig(memory_mode="always"))

    opts = InitiateVoiceConversationOptions(
        to=to,
        websocket_url=f"wss://{public_domain}/ws",
        welcome_greeting=welcome_greeting,
        action_url=f"https://{public_domain}/conversation-relay-callback",
    )
    result = asyncio.run(voice_channel.initiate_outbound_conversation(opts))
    return result.call_sid
