# Job Scam Shield — Complete Build (Days 1–5)

A working prototype for the Alibaba Cloud AI Hackathon Pakistan 2026,
Open Innovation track. Detects job scam patterns specific to Pakistan —
fee extraction, fake certification platforms, unsafe interview
arrangements, and wage theft — using a layered rule engine + AI +
legitimacy verification system, plus two crowdsourced reporting layers.

## IMPORTANT — a bug fixed on the final pass

During final regression testing, a real scoring bug was found and
fixed: when a posting had no email address to check, the legitimacy
layer's "neutral, nothing to check" result of 0 was being averaged in
as if it were positive evidence of safety — which was quietly pulling
down confident high-risk scores (a clear scam post scored 83 instead of
100). Fixed in `server.js` / `legitimacyCheck.js`: the legitimacy score
is now only included in the final average when it actually had
something to evaluate (`checked: true`). Confirmed fixed by re-running
the full regression suite — see test results in this project's build
history if you want to verify again yourself.

## Feature summary

1. **Rule-based scam detection** — fee requests, urgency language,
   unrealistic salary, generic contact patterns, and 21 interview-safety
   patterns (the project's core safety differentiator).
2. **OCR screenshot scanning** — fully offline (no external CDN
   dependency, fixed specifically to avoid a live-demo failure risk).
3. **Genuine AI tone-analysis layer** (Claude API) — catches
   carefully-worded scams that dodge obvious keywords. Requires your own
   `ANTHROPIC_API_KEY` (see below); app works fully without it.
4. **Legitimacy Check** — real, live DNS domain verification, known
   scam/legitimate platform lists, and a "Positive Signals" section that
   shows genuine evidence in a posting's favor, not just red flags.
5. **Community Trust Layer** — crowdsourced, live-updating platform
   trust scores. Fully functional, not a mockup.
6. **Wage-Theft Log** — a shared record for the "real work, no payment"
   failure mode. Also fully functional.

## How to run it

### 1. Backend
```
cd backend
npm install
npm start
```
Runs at http://localhost:5000

### 2. Frontend (separate terminal)
```
cd frontend
npm install
npm run dev
```
Runs at http://localhost:5173 — three tabs: Posting Scanner, Community
Trust, Wage-Theft Log.

## Enabling the AI layer

1. Get a key from https://console.anthropic.com
2. In `backend/`, create `.env`:
   ```
   ANTHROPIC_API_KEY=your-key-here
   ```
3. `npm install dotenv`, then add `require("dotenv").config();` as the
   first line of `server.js`.

Do this well before your actual demo, not the night before — you want
to see real AI output at least once ahead of time.

## Demo script

See **`JobScamShield_Demo_Script.docx`** — the full Day 5 deliverable:
a timed walkthrough (opening hook → live demo sequence → technical
explanation → responsible-AI close), an anticipated judge Q&A table,
and a pre-demo checklist.

## Verified test posts

**High Risk:**
> Urgent hiring females required, no investment, work from home. Please
> pay registration fee of Rs 2000 to confirm your seat. Contact us only
> on WhatsApp. Interview will be held at my house, come alone.

**Low Risk (use a real domain like microsoft.com, not a made-up one —
a fake domain will correctly get flagged as unresolvable):**
> We are hiring a Junior Frontend Developer, Lahore. Salary: PKR
> 60,000-80,000 based on experience. Please email your CV to
> careers@microsoft.com. Interview will be conducted at our office in
> DHA Phase 5.

**Caution (mixed signals):**
> Urgent hiring! No experience needed, apply today only. Please send
> your CV to careers@microsoft.com.

## Architecture note

Community Trust and Wage-Theft currently use in-memory storage (resets
on server restart) rather than a database — a deliberate hackathon-scope
choice. Worth saying so plainly if asked; the path to production is
straightforward (swap the in-memory arrays for MongoDB collections).

## Design language

Every screen shares the same "official stamp/mohar" visual motif for
verdicts and trust scores — meant to echo the authenticity-verification
culture familiar in Pakistan, and to make the whole app read as one
coherent system.
