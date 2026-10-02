# Python snippets

Self-contained Python snippets stripped from the sierra-test API reference repo.
**Before writing a new snippet for an implementation step, scan this index.**
If a match exists, copy the file into the code panel verbatim (or with the
minimal diff needed for the customer's situation). Only write a new snippet
when nothing in the index matches.

Match by **product + action** (what the step is doing), not by phrasing of the
step description.

## Shared env-var contract

Every snippet reads from `os.environ` using these names:

| Variable | Used by |
|---|---|
| `TWILIO_ACCOUNT_SID` | all |
| `TWILIO_AUTH_TOKEN` | all |
| `TWILIO_PHONE_NUMBER` | voice/SMS senders |
| `TWILIO_VOICE_PUBLIC_DOMAIN` | ConversationRelay webhook host |
| `TWILIO_CONVERSATION_CONFIGURATION_ID` | ConversationRelay model/prompt binding |
| `TWILIO_CINTEL_ID` | Conversation Intelligence config |
| `ELEVENLABS_VOICE_ID` | ConversationRelay TTS |
| `FLEX_APP_WORKSPACE_SID` | Flex / TaskRouter |
| `FLEX_APP_WORKFLOW_SID` | Flex outbound routing |
| `FLEX_APP_QUEUE_SID` | Flex outbound routing |
| `FLEX_APP_WORKER_SID` | Flex outbound routing |

Snippets assume these are set at import time via `os.environ[...]` so a
missing variable fails fast. For a workshop deck, keep them as `os.environ`
reads — attendees pull from a `.env` file during setup.

## Index

### ConversationRelay

- [`conversationrelay-twiml-basic.py`](conversationrelay-twiml-basic.py) — `<Connect><ConversationRelay>` TwiML with ElevenLabs voice + Deepgram `nova-3-general` STT + `conversation_configuration` SID
- [`conversationrelay-twiml-with-parameters.py`](conversationrelay-twiml-with-parameters.py) — `<Parameter>` children to ship `session_id` / `role` / caller metadata into the `setup` WebSocket message (the native-mechanism pattern)
- [`conversationrelay-outbound-with-amd.py`](conversationrelay-outbound-with-amd.py) — `calls.create(twiml=..., record="true")` with async Answering Machine Detection + ConversationRelay
- [`conversationrelay-insights-events.py`](conversationrelay-insights-events.py) — `GET /v1/Voice/Calls/{callSid}/Events` with the full CR event-name set (`prompt_sent`, `first_token_received`, `stt_latency`, `tts_latency`, speech boundaries) + latency summarizer

### TAC (Twilio Agent Connect, Python SDK)

- [`tac-outbound-sms.py`](tac-outbound-sms.py) — `SMSChannel(..., memory_mode="always")` + `initiate_outbound_conversation(InitiateMessagingConversationOptions)`
- [`tac-outbound-voice.py`](tac-outbound-voice.py) — `VoiceChannel` + `InitiateVoiceConversationOptions(websocket_url, welcome_greeting, action_url)` — reference for `action_url` = post-session callback, not initial-TwiML endpoint

### Conversations

- [`conversations-create-with-sms-participant.py`](conversations-create-with-sms-participant.py) — create conversation + add SMS participant via `messaging_binding_address`, with "number already in active conversation" regex fallback
- [`conversations-v2-list-and-fetch.py`](conversations-v2-list-and-fetch.py) — list `GET /v2/Conversations` with status filter + fetch single conversation with participants
- [`conversations-v2-list-communications.py`](conversations-v2-list-communications.py) — `GET /v2/Conversations/{id}/Communications` with optional `channelId` filter

### Flex / TaskRouter

- [`flex-interaction-create.py`](flex-interaction-create.py) — `client.flex_api.v1.interaction.create(...)` for agent-initiated outbound, routing to a specific worker with task attributes
- [`taskrouter-fetch-task.py`](taskrouter-fetch-task.py) — `GET /v1/Workspaces/{workspaceSid}/Tasks/{taskSid}`
- [`taskrouter-lookup-worker-attributes.py`](taskrouter-lookup-worker-attributes.py) — resolve a worker's attributes JSON (name, skills) from a `friendly_name`

### Conversation Intelligence

- [`ci-create-custom-operator.py`](ci-create-custom-operator.py) — `POST /v3/ControlPlane/Operators` with `displayName`, `prompt`, `outputFormat` (TEXT/CLASSIFICATION/JSON), optional parameters, outputSchema, trainingExamples, and `context.memory.enabled` to expose memory tools
- [`ci-attach-operator-to-config.py`](ci-attach-operator-to-config.py) — attach a rule binding the operator to a trigger (`COMMUNICATION`/`CONVERSATION_END`/`CONVERSATION_INACTIVE`) + webhook action, using the DELETE + POST workaround for the "PUT silently deactivates" quirk

### Conversation Memory

- [`memory-list-stores.py`](memory-list-stores.py) — `GET /v1/ControlPlane/Stores` with per-ID detail fallback
- [`memory-profile-lookup-by-phone.py`](memory-profile-lookup-by-phone.py) — `POST /v1/Stores/{storeId}/Profiles/Lookup` with `{idType: "phone", value: ...}`
- [`memory-get-traits.py`](memory-get-traits.py) — `GET /v1/Stores/{storeId}/Profiles/{profileId}/Traits`, grouped by `traitGroup`
- [`memory-recall.py`](memory-recall.py) — `POST /v1/Stores/{storeId}/Profiles/{profileId}/Recall` returning observations/summaries/communications with independent limits + optional query/conversationId

### Voice Insights

- [`voice-insights-summaries.py`](voice-insights-summaries.py) — paginated `GET /v1/Voice/Summaries` with `direction=outbound_api` + date window, following `next_page_url`

## Adding a new snippet

1. Name it `{product}-{action}.py`, lowercase-kebab (match the existing convention).
2. Top-of-file docstring: what it does + any gotcha a reader needs to know.
3. Imports first, then env reads (fail fast with `os.environ[...]`, not `.get()`).
4. One function per snippet when possible; the function name describes the action.
5. Add a one-line entry to this README under the right product group.
