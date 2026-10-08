# Twilio API reference — vendored call-shape snapshots

These files are vendored copies of `pages/*.py` from the SAA team's internal
Streamlit "Twilio API Explorer" (upstream repo: `sierra-test`). They are the
canonical reference for current Twilio API call shapes used across workshops.

**Vendored, not live.** Refresh this directory when the upstream repo gains
new pages or when a Twilio API shape it demonstrates changes. If you don't
have access to `sierra-test`, verify shapes against `mcp__twilio-docs__twilio__retrieve`
and the product skills instead — this directory is a shortcut, not a hard
dependency.

## When to read which file

| File | Products / API shapes |
|---|---|
| `conversation_relay.py` | ConversationRelay — TwiML `<Connect><ConversationRelay>`, WebSocket message shapes (`setup`, `prompt`, `interrupt`, `text`, `play`, `end`), tool-call messages |
| `actions.py` | TAC outbound Voice + SMS — `TAC`, `TACConfig`, `VoiceChannel`, `SMSChannel`, `InitiateVoiceConversationOptions`, `InitiateMessagingConversationOptions`, `action_url` wiring |
| `conversations.py` | Conversations REST — create conversation, add participants (SMS / WhatsApp / Chat), send messages |
| `channels.py` | Multi-channel setup — binding senders to a Conversations service |
| `ci_memory.py` | Conversation Intelligence + Memory — `/v3` CI services, operators, transcripts; `/v1` Memory profiles, traits, Recall |
| `cr_insights.py` | Voice / CR Insights — `/v1/Voice/Summaries`, `/v1/Voice/Calls/{sid}/Events`, CR-specific event names |
| `flex_sdk.py` | Flex + TaskRouter — Workers, Task Queues, Workflows, Reservations |

## How to use when writing a snippet

1. Open the relevant file.
2. Copy imports, env-var names, and the Twilio call shape **verbatim**.
3. Strip Streamlit UI wrapping (`st.*`) and the instrumentation helpers
   (`record_request`, `inspector`). Keep the Twilio calls unchanged.
4. Do NOT invent Twilio surface that isn't in these files. If a page doesn't
   demonstrate the API you need, verify it against the product skill +
   `mcp__twilio-docs__twilio__retrieve` before drafting.
