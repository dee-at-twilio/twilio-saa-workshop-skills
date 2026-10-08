# TypeScript snippets

Self-contained TypeScript snippets. The `conversationrelay-*`, `relay-*`,
`warm-transfer-*`, and `post-call-*` files cover the WebSocket-server /
agent-runtime side; the `tac-*`, `conversations-*`, `flex-*`, `taskrouter-*`,
`ci-*`, `memory-*`, and `voice-insights-*` files cover the outbound /
REST-client side (mirrors of the Python set).

**Before writing a new snippet for an implementation step, scan this index.**
If a match exists, copy the file into the code panel verbatim (or with the
minimal diff needed). Only write a new snippet when nothing matches.

Match by **product + action**, not by phrasing of the step description.

## Shared env-var contract

Every snippet reads from `process.env` using these names:

| Variable | Used by |
|---|---|
| `TWILIO_ACCOUNT_SID` | all |
| `TWILIO_AUTH_TOKEN` | all |
| `TWILIO_PHONE_NUMBER` | voice/SMS senders |
| `TWILIO_VOICE_PUBLIC_DOMAIN` | ConversationRelay webhook host |
| `TWILIO_CONVERSATION_CONFIGURATION_ID` | ConversationRelay model/prompt binding |
| `TWILIO_CINTEL_ID` | Conversation Intelligence config |
| `RELAY_WS_URL` | ConversationRelay inbound-WebSocket URL (used by `relay-voice-endpoint.ts`) |
| `FLEX_APP_WORKSPACE_SID` | Flex / TaskRouter |
| `FLEX_APP_WORKFLOW_SID` | Flex outbound routing |
| `FLEX_APP_QUEUE_SID` | Flex outbound routing |
| `FLEX_APP_WORKER_SID` | Flex outbound routing |

TAC snippets additionally read whatever `TACConfig.fromEnv()` reads
(TAC-specific env vars documented in the `twilio-agent-connect` package).

Snippets assert required vars at import time with `process.env.X!` so a
missing variable fails fast when the module loads.

## Index

### ConversationRelay — WebSocket server & TwiML

- [`relay-voice-endpoint.ts`](relay-voice-endpoint.ts) — inbound voice TwiML endpoint returning `<Connect><ConversationRelay>` (baseline)
- [`relay-flux-config.ts`](relay-flux-config.ts) — Deepgram Flux + `partialPrompts` + `deepgramSmartFormat` configuration for structured intake
- [`relay-message-handler.ts`](relay-message-handler.ts) — WebSocket handler reading `setup` / `prompt` / `interrupt` / `dtmf` messages
- [`relay-send-agent-response.ts`](relay-send-agent-response.ts) — wrap a reply in the `text` message shape, with streaming via non-`last` chunks
- [`relay-play-prompt.ts`](relay-play-prompt.ts) — deliver stable pre-rendered prompts via the `play` message
- [`relay-filler-ack.ts`](relay-filler-ack.ts) — short filler `text` sent immediately on `prompt` while the LLM/tool call runs
- [`relay-silence-timer.ts`](relay-silence-timer.ts) — per-call silence re-prompt timer, cleared by any inbound event
- [`relay-interrupt-cancel.ts`](relay-interrupt-cancel.ts) — abort in-flight LLM/tool promise on caller barge-in
- [`relay-dtmf-buffer.ts`](relay-dtmf-buffer.ts) — DTMF fallback for structured intake fields
- [`relay-intake-contract.ts`](relay-intake-contract.ts) — LLM system-prompt contract for field order, repeat-back, correction, single-tool-call rules
- [`relay-tool-bridge.ts`](relay-tool-bridge.ts) — route named LLM tool calls to the customer's existing tool implementations

### ConversationRelay — outbound / Insights

- [`conversationrelay-outbound-with-amd.ts`](conversationrelay-outbound-with-amd.ts) — `calls.create({twiml, record: true, asyncAmd: 'true'})` with Connect→ConversationRelay inline TwiML
- [`conversationrelay-insights-events.ts`](conversationrelay-insights-events.ts) — `GET /v1/Voice/Calls/{callSid}/Events` with the full CR event-name set + latency summarizer

### TAC (Twilio Agent Connect, TypeScript SDK — `twilio-agent-connect` on npm)

- [`tac-outbound-sms.ts`](tac-outbound-sms.ts) — `SMSChannel` + `initiateOutboundConversation({ to, message })` with `TACServer.start()` before send
- [`tac-outbound-voice.ts`](tac-outbound-voice.ts) — `VoiceChannel` + `initiateOutboundConversation({ to, twimlOptions: { welcomeGreeting } })`

### Conversations

- [`conversations-create-with-sms-participant.ts`](conversations-create-with-sms-participant.ts) — create conversation + add SMS participant via `messagingBindingAddress`, with "number already in active conversation" regex fallback
- [`conversations-v2-list-and-fetch.ts`](conversations-v2-list-and-fetch.ts) — list + fetch v2 conversations via the Node SDK (`client.conversations.v2.conversations`)
- [`conversations-v2-list-communications.ts`](conversations-v2-list-communications.ts) — list communications on a v2 conversation, with optional `channelId` filter

### Warm transfer

- [`warm-transfer-bridge.ts`](warm-transfer-bridge.ts) — Conference-based bridge of caller + human agent, with handoff context on the agent leg
- [`warm-transfer-handoff-context.ts`](warm-transfer-handoff-context.ts) — build the context payload riding via `<Dial><Client><Parameter>` (native-mechanism pattern)

### Flex / TaskRouter

- [`flex-interaction-create.ts`](flex-interaction-create.ts) — `client.flexApi.v1.interaction.create(...)` for agent-initiated outbound, routing to a specific worker
- [`taskrouter-fetch-task.ts`](taskrouter-fetch-task.ts) — fetch a single task from a workspace
- [`taskrouter-lookup-worker-attributes.ts`](taskrouter-lookup-worker-attributes.ts) — resolve a worker's attributes JSON from a `friendlyName`

### Conversation Intelligence

- [`ci-create-custom-operator.ts`](ci-create-custom-operator.ts) — `POST /v3/ControlPlane/Operators` with displayName, prompt, outputFormat (TEXT/CLASSIFICATION/JSON), optional parameters/outputSchema/trainingExamples, and `context.memory.enabled`
- [`ci-attach-operator-to-config.ts`](ci-attach-operator-to-config.ts) — attach a rule binding operator → trigger → webhook action via `PUT /v3/ControlPlane/Configurations/{id}` with the merged rules list
- [`post-call-batch-trigger.ts`](post-call-batch-trigger.ts) — call-status webhook enqueueing a keyed batch job on `completed` instead of running analysis inline

### Conversation Memory

- [`memory-list-stores.ts`](memory-list-stores.ts) — `GET /v1/ControlPlane/Stores` with per-ID detail fallback
- [`memory-profile-lookup-by-phone.ts`](memory-profile-lookup-by-phone.ts) — `POST /v1/Stores/{storeId}/Profiles/Lookup` with `{ idType: 'phone', value }`
- [`memory-get-traits.ts`](memory-get-traits.ts) — `GET /v1/Stores/{storeId}/Profiles/{profileId}/Traits`, grouped by `traitGroup`
- [`memory-recall.ts`](memory-recall.ts) — `POST /Recall` with observations/summaries/communications limits, optional query / conversationId / date range / relevanceThreshold

### Voice Insights

- [`voice-insights-summaries.ts`](voice-insights-summaries.ts) — paginated `GET /v1/Voice/Summaries` with `direction=outbound_api` + date window, following `next_page_url`

## Adding a new snippet

1. Name it `{product}-{action}.ts`, lowercase-kebab.
2. Top-of-file comment: what it does + any gotcha a reader needs to know.
3. Imports first, then env reads (`process.env.X!` to fail fast).
4. One exported function per snippet when possible; the function name describes the action.
5. Add a one-line entry to this README under the right product group.
