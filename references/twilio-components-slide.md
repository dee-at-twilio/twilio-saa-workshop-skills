# Twilio components slide reference

Read this before drafting a Twilio components slide. The slide is optional — only add it when the user explicitly asks for a system diagram alongside the workshop. When present, it sits between Prerequisites and Use cases & journeys, taking eyebrow number 02 (and shifting the rest by one: Prereq = 01, Twilio components = 02, Journeys = 03, Agenda = 04, Outcomes = 05, Implementation = 06).

**Named "Twilio components", not "Architecture", deliberately.** The diagram shows which Twilio products the workshop will wire together — Conversation Orchestrator, Memory, Intelligence, ConversationRelay. It is NOT the customer's own system architecture. Customer-side architecture diagrams (if any) are a distinct deliverable, often built *during* the workshop, and belong on their own slide (or in their own doc).

## Start from the partial

A canonical, working Paper-style Twilio components slide lives at **`templates/twilio-components-slide.html`** — the same SVG that shipped in the Intuit workshop (`/Users/dnaidu/workshops/intuit/workshop/index.html`), with customer-specific wording replaced by `{{PLACEHOLDER}}` tokens. **Copy it into the deck first**, then adapt — do not hand-roll a fresh SVG. The partial has already passed the numeric verification gate below for its default three-chip (SMS / Voice / WhatsApp) layout; if you add or drop a chip, re-run the gate for the chip row only.

The surrounding `.components-panel` / `.components-label` / `.components-recap` CSS is already in `templates/agenda-template.html`; no extra styles needed when inserting the partial.

## What the diagram teaches

**How a Twilio conversational agent is composed** — the generic pattern, not the customer's use case. Do NOT put customer-domain actors on the diagram ("Distressed Customer", "Patient", "Merchant") — render the caller as **User**, and label the boxes with Twilio product names.

**The diagram shows Twilio products only.** The four boxes are Twilio products: **Conversation Orchestrator**, **Conversation Memory**, **Conversation Intelligence**, and (as a Voice-only annotation) **ConversationRelay**. The application the customer builds is NOT a box on this diagram — it is the surrounding context that consumes these Twilio products. If a "your integration app" wrapper is drawn at all, it is a faint dotted outline around the four Twilio-product boxes with a plain label like "Your integration app" — never labeled "Orchestrator", never rendered as a solid product-styled box.

**Do not conflate Conversation Orchestrator with the customer's application.** Per [Twilio's docs](https://www.twilio.com/docs/conversations/orchestrator), **Conversation Orchestrator is a Twilio product** — the foundational data layer that observes traffic from a Twilio account, links it to customer profiles, and makes it available for AI agents and analytics. It is NOT "the app the customer builds", NOT a role, NOT a synonym for TAC, and NOT the layer that hosts the LLM tool implementations. If a distinction between "Twilio Conversation Orchestrator" and "the customer's app that uses it" is needed in the narrative, call the customer's side **"your integration app"** or **"your application"**.

## Visual style — flat editorial, not colored header bars

**Neat, flat, Paper-editorial.** The pattern comes from `workshops/intuit/chat-identifier-demo-app/jobID_presentation/index.html` — a single wide SVG built from cream boxes with soft palette-tinted borders, one inline `<style>` block defining typography and box classes, minimal arrows, and no colored header bars, no per-box icon clusters, no channel-icon shelves inside boxes. If the diagram starts looking like an infographic — bright banded box tops, cartoon icons for LLM/NLU/Logic, gradient tiles — it's wrong. Rewrite it flat.

**Do NOT copy the "Conversational AI System Architecture" reference image aesthetic** (dark navy header bars, channel icons packed inside a "CONVERSATION RELAY" tile, floating "AI/LLM/NLU/Logic" icons inside "INTELLIGENCE"). That image is a marketing-style infographic — it doesn't fit the Paper theme and it also carries a Twilio-semantic error (ConversationRelay does not manage all channels; cross-channel capture is done by Conversation Orchestrator).

### Boxes

- Rounded rectangles (`rx="6"`), 1.4px border, cream-tinted fill (`rgba(<palette>,0.06–0.10)`), palette-colored stroke.
- One class per Twilio product — `.box-orch` (terracotta, Conversation Orchestrator), `.box-mem` (dusty-blue, Conversation Memory), `.box-intel` (violet, Conversation Intelligence), plus a plain `.box` for the ConversationRelay Voice-only annotation and any channel chips (cream + light border).
- No header bar. Title sits inside the box in Fraunces at 16px, left-aligned near the top-left corner with a small y-offset from the box top; a mono-typed subtitle sits directly beneath it in palette-tinted mono.
- **Every product box's title must exactly match Twilio's product name** — "Conversation Orchestrator", "Conversation Memory", "Conversation Intelligence", "ConversationRelay". Do not shorten to "Orchestrator" / "Memory" / "Intelligence" as the box title (short forms are fine inside prose after the box is already labeled with the full product name).

### Typography inside the SVG

Declare in an inline `<style>` block at the top of the SVG so overrides are one place:
- `.a-h` — Fraunces 16px, box title
- `.a-b` — Plex Sans 13px, body
- `.a-m` — Plex Mono 11px, endpoint / annotation
- `.a-s` — Plex Mono 10.5px italic faint, meta subtext
- `.a-tt` / `.a-tb` / `.a-tv` — Plex Mono 10.5px in terracotta / dusty-blue / violet, for palette-tinted annotations near arrows or inside the matching-role box

### Arrows

Thin (1.6px), palette-colored, always tied to the destination box's role color, with a compact mono label above (`.a-t*`). Two arrows for a bidirectional relationship, not one double-headed line. Reserve dashed arrows for context/retrieval when it clarifies the direction of information flow.

### Layout — Conversation Orchestrator at the front, Memory + Intelligence downstream

Per Twilio's docs, Conversation Orchestrator is the foundational data layer; Memory and Intelligence build on the data Orchestrator captures. The diagram reflects that flow: User enters via a Twilio number, Conversation Orchestrator sits at the front (largest box), Memory + Intelligence stack to the right as downstream products.

Concrete layout at `viewBox="0 0 1240 420"`:
- User (small circle or label) in the top-left corner.
- Twilio number box near the top (roughly `x=205, y=30, w=160, h=66`) — the entry point for SMS and Voice traffic.
- **Conversation Orchestrator** box occupying the left half (roughly `x=40, y=170, w=460, h=220`), with:
  - Title "Conversation Orchestrator", subtitle "captures + links conversations across channels" or similar.
  - A row of channel chips (`.box` — SMS / Voice / Web) inside the box.
  - One or two mono annotations naming the Twilio product powering each channel: "Voice: ConversationRelay (STT/TTS + LLM turn loop)", "SMS: Programmable Messaging / Conversations".
- **Conversation Memory** box on the right, top half (roughly `x=590, y=170, w=610, h=100`) — title "Conversation Memory", subtitle "profile + history across sessions", endpoint `memory.twilio.com/v1`.
- **Conversation Intelligence** box on the right, bottom half (roughly `x=590, y=300, w=610, h=100`) — title "Conversation Intelligence", subtitle "operators over the transcript", endpoint `intelligence.twilio.com/v3`.
- Arrows: User → Twilio number → Conversation Orchestrator (terracotta); Conversation Orchestrator ↔ Memory (dusty-blue, "hydrate" / "context"); Conversation Orchestrator ↔ Intelligence (violet, "analyse" / "result").
- Optional: a faint dotted outer wrapper around all four Twilio-product boxes labeled quietly as "Your integration app". Do NOT draw the customer's app as a solid product-styled box; do NOT label it "Orchestrator". If the wrapper adds visual clutter, drop it — the caption can carry the point in one sentence.

**Never put "CONVERSATION RELAY" as the channels-container box.** ConversationRelay is a Voice-only product. It appears in the diagram (if at all) as an annotation next to the Voice channel chip, or as a tag inside the Conversation Orchestrator's body.

**Never label the Conversation Orchestrator box "Orchestrator · TAC" or anything that implies TAC is the same layer.** If TAC needs a mention on the diagram, it goes as an `.a-s` faint tag outside the Conversation Orchestrator box, e.g. "TAC (Twilio Agent Connect) is a Python SDK for integrating with these products."

## Diagram cleanliness — numeric verification gate

**Scope.** These rules apply to the hand-rolled SVG Twilio-components diagram only. Sequence diagrams are Mermaid and this section does not apply to them.

**Text on top of a shape is always a bug — even a short label, even for one draft.** Before you consider the diagram "done", walk every `<text>` element against every `<rect>` and every `<line>`: label bboxes must sit inside their intended container with ≥8px inset, or in the gap between boxes with ≥6px clear space on both sides, or outside the SVG entirely. "Mentally walking it" does not work — soft checks have lost to real bugs repeatedly (Intuit chat-identifier deck Sep 2026; Twilio Connect Blueprint arch diagram Oct 2026). Replace mental checks with the numeric gate below.

### Mandatory verification pass

After drafting the SVG and before moving on to the surrounding slide content, produce this artifact. **Enumerate every element — do not sample.** Every `<text>` element in the SVG, no exceptions, including box titles, subtitles, footnotes, arrow labels, and floating annotations.

```
Coordinates:
  boxes:
    Name         x, y, w, h
    <one line per <rect>>

  arrows:
    Name         (x1,y1) -> (x2,y2)   source_box   dest_box
    <one line per <line> with marker-end>

  labels:
    text         x, y, anchor, font/size   width_estimate   bbox_left..bbox_right   container_box (or "gap")
    <one line per <text> — INCLUDING box titles, subtitles, footnotes,
     arrow labels, and floating annotations. No exceptions.>

Checks (must all be YES for every element enumerated):
  1. For every label with container_box=X: bbox is fully inside X, with ≥8px
     inset on all four sides of X. If the label's bbox width exceeds X's width
     minus 16px, the label MUST be shortened — do not widen X to save the label.
  2. For every label with container_box=gap: bbox is disjoint from every box in
     the diagram (not intersecting, not touching).
  3. Every arrow's LINE ENDPOINT is at least 6px from the destination box's edge.
  4. Every arrow's LINE ORIGIN is at the source box's edge (±1px), not floating
     in the gap. If the origin can't attach to a box edge, the arrow is wrong.
  5. Every arrow line, projected as a segment, does not cross any third box it
     isn't connecting.
  6. Bidirectional pairs: the two labels are on opposite sides of their arrows
     and separated by at least (font-size) vertically.
  7. Chips inside a container are ≥8px inside the container on all four sides.
  8. Titles/subtitles inside a box are stacked with ≥ (font-size × 1.2) between
     baselines and ≥8px from the box's bottom edge.
  9. Every text element's bbox is fully inside the SVG viewBox with ≥8px padding.
```

**Do the audit as running code, not eyeballing.** Read every `<text>` element out of the SVG source, compute the bbox using the width table below, and check against every `<rect>`. If any check fails, go back and fix the geometry before writing the caption, recap list, or next slide.

### Marker geometry — 6px cushion, not 3px

The deck's arrow markers are `<marker viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">` with triangle `M0,0 L10,5 L0,10`. Given `refX=9` inside a `markerWidth=6` marker, the triangle's tip sits ~1px past the line endpoint and the arrowhead's perpendicular half-width is ~3px. A 3px cushion puts the visible tip on top of the box border. **Line endpoint ≥ 6px from destination edge** gives ~5px of visible clear space.

### Label-width gate — compute before you write, not after

Applies to every `<text>` element — box titles, subtitles inside boxes, footnotes, floating annotations, everything.

Per-character width estimates (deliberately ~15% over theoretical em-width — prior tighter numbers passed audit while renders had overflow):
- Plex Mono at 10.5px: **7.0px per character**
- Plex Mono at 11px: **7.5px per character**
- Plex Sans at 13px: **8.0px per character**
- Fraunces at 16px: **10.0px per character**

Middle-dot glyphs (` · `) count as regular characters.

Compute `label_width = char_count × per_char`. For `text-anchor="middle"`, bbox is `[label_x − label_width/2, label_x + label_width/2]`.

- **Label inside a container box:** `label_width ≤ container.width − 16` (8px inset each side). If it exceeds, shorten the label — never widen the container.
- **Label in a gap between two boxes:** confirm `label_x − label_width/2 ≥ left_box.right_edge + 6` AND `label_x + label_width/2 ≤ right_box.left_edge − 6`.

Prefer 4–8 character labels for arrow annotations: `inbound`, `read`/`write`, `hydrate`/`context`, `analyse`/`result`, `send`/`recv`, `turn in`/`reply out`. For subtitles inside boxes, a 160px-wide box fits about 20 characters of Plex Mono 11px — no more.

### Worked examples

**Gap label overflow (Intuit deck):** `calls / texts` at 12 chars × 7px = 84px wide, `text-anchor="middle"` at `x=174`, bbox `x=132..216`. The Twilio number box's left edge is at `x=205`. The label overlapped the box by 11px. Fix: change the label to `inbound` (7 chars × 7px = 49px, bbox 149.5..198.5, clear of the box at 205).

**Subtitle inside a too-narrow box (Intuit deck):** `inbound SMS · Voice webhook` at 27 chars × 7.5px = 202px, `text-anchor="middle"` at `x=285` inside a Twilio-number box spanning `x=205..365` (160px wide). Bbox `x=184..386`, overflowing both edges. Fix: shorten to `SMS · Voice webhook` (19 chars × 7.5px = 142px, bbox 214..356).

**Arrow-origin rule (Intuit deck):** the `reply out` arrow ran from `(510, 167)` up to `(510, 100)`, but the Orchestrator's right edge is at `x=500`. The arrow's origin was 10px to the right of the box it was leaving. Fix: move both x-coordinates onto the Orchestrator's top edge (x=490 for up-arrow, x=470 for down-arrow).

**Rule:** when a natural label would overlap, shorten the label — do not truncate the gap. Prefer 4–8 character labels.

**No decorative background flourishes.** No circuit-line patterns, corner marks, faint watermark labels, or "TWILIO CONVERSATIONAL AGENT" diagram-corner titles. The `.diagram-label` outside the SVG carries the caption role; inside the SVG, only structural elements.

**Never invent a component that isn't a real Twilio product.** No "Intel" box, no customer-flavored analytics box — the third box is Conversation Intelligence. Do not put External Systems, live-agent desktops, or the customer's data warehouse on this diagram.

## CSS for the surrounding panel

Already in `templates/agenda-template.html` — the `.components-panel`, `.components-label`, and `.components-recap` rules ship with the base deck. Nothing to add if you insert `templates/twilio-components-slide.html` into a deck started from the base template.

For Mermaid sequence diagrams, the `.diagram-panel` / `.diagram-label` / `.diagram-caption` triple is a separate concern — see SKILL.md §Sequence diagrams.

The SVG is fully self-contained (its own `<defs>` markers + inline `<style>` for `.a-*` / `.box*` / `.flow-*`). Nothing outside the SVG needs to know its internal classes.
