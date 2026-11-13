# SafeCareerPK

**Spot fake job postings before they cost you money, time, or safety.**

SafeCareerPK is a web app that helps job seekers in Pakistan evaluate job postings. It combines a rule engine tuned to local scam patterns, AI tone analysis, live domain verification, and two crowdsourced reporting layers, then explains each verdict in plain language.

Built for the **Alibaba Cloud AI Hackathon Pakistan 2026** (Open Innovation track).

![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black)
![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google&logoColor=white)

---

## Why this exists

Job scams in Pakistan follow recognizable patterns: upfront "registration" fees, fake certification platforms, interviews at private homes, and work that is delivered but never paid for. Generic scam checkers miss these local patterns. SafeCareerPK is built around them.

## Features

| Feature | What it does |
|---|---|
| **Posting Scanner** | Scores a posting by checking for fee requests, urgency language, unrealistic salaries, generic contact patterns, and 21 interview-safety red flags. |
| **Screenshot scanning (OCR)** | Reads postings shared as images (for example on WhatsApp). Runs fully offline, with no external CDN dependency. |
| **AI tone analysis** | Uses Google Gemini to catch carefully worded scams that avoid obvious keywords. Optional: the app works without it. |
| **Legitimacy Check** | Live DNS verification of email domains, known scam and legitimate platform lists, and a "Positive Signals" section showing genuine evidence in a posting's favor. |
| **Community Trust** | Crowdsourced, live-updating trust scores for hiring platforms and companies. |
| **Wage-Theft Log** | A shared record for the "real work, no payment" failure mode. |
| **Resume Advice** | Static tips written for the Pakistani job market, plus AI-generated suggestions tailored to a job title or field. |

## How scoring works

Each posting passes through layered checks, and the final risk score combines them:

1. **Rule engine:** keyword and pattern checks for fees, urgency, salary, contact method, and interview safety.
2. **AI layer (optional):** Gemini reviews tone and phrasing for subtle manipulation.
3. **Legitimacy layer:** DNS lookup and platform lists. This layer is only included in the average when it actually had something to evaluate (for example, when the posting contains an email address), so an empty check never dilutes a confident high-risk result.

Results are grouped into **High Risk**, **Caution**, and **Low Risk**, each shown with the reasons behind it.

## Tech stack

- **Frontend:** React, Vite, Recharts
- **Backend:** Node.js, Express
- **AI:** Google Gemini API (`@google/genai`)
- **OCR:** offline, bundled with the app

## Project structure

```
SafeCareerPK/
├── backend/
│   ├── server.js            # Express server and routes
│   ├── ruleEngine.js        # Rule-based scam detection
│   ├── aiAnalysis.js        # AI tone analysis
│   ├── legitimacyCheck.js   # DNS and platform verification
│   ├── ocr.js               # Screenshot text extraction
│   ├── communityTrust.js    # Crowdsourced trust scores
│   ├── wageTheft.js         # Wage-theft log
│   ├── resumeAdvice.js      # Resume tips (static + AI)
│   └── env.js               # Environment configuration
└── frontend/                # React + Vite app
```

## Getting started

### Prerequisites
- Node.js 18 or later
- A Google Gemini API key (optional, only needed for the AI features): get one from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the repository
```bash
git clone https://github.com/humaaslam46/SafeCareerPK.git
cd SafeCareerPK
```

### 2. Start the backend
```bash
cd backend
npm install
```

Create a `backend/.env` file:
```
GEMINI_API_KEY=your_key_here
```

Then run:
```bash
npm start
```
The API runs at `http://localhost:5000`.

### 3. Start the frontend
In a second terminal:
```bash
cd frontend
npm install
npm run dev
```
The app runs at `http://localhost:5173`.

> **Note:** The `.env` file is ignored by Git. Never commit your API key.

## Using the app

The interface has four tabs: **Posting Scanner**, **Community Trust**, **Wage-Theft Log**, and **Resume Advice**.

### Sample postings to try

**High risk**
> Urgent hiring females required, no investment, work from home. Please pay registration fee of Rs 2000 to confirm your seat. Contact us only on WhatsApp. Interview will be held at my house, come alone.

**Low risk** (use a real domain, since a made-up one is correctly flagged as unresolvable)
> We are hiring a Junior Frontend Developer, Lahore. Salary: PKR 60,000-80,000 based on experience. Please email your CV to careers@microsoft.com. Interview will be conducted at our office in DHA Phase 5.

**Caution** (mixed signals)
> Urgent hiring! No experience needed, apply today only. Please send your CV to careers@microsoft.com.

## Known limitations

- **In-memory storage:** Community Trust and the Wage-Theft Log reset when the server restarts. This was a deliberate hackathon-scope choice. The path to production is to replace the in-memory arrays with a database such as MongoDB.
- **AI features need a key:** without `GEMINI_API_KEY`, the rule engine, legitimacy check, OCR, and static resume tips still work. Only the AI tone analysis and personalized resume tips are disabled.

## Roadmap

- Persistent storage for community reports
- User accounts and report moderation
- Urdu-language interface and postings
- Browser extension for scanning postings in place

## Design

All verdicts and trust scores share one visual motif, an official stamp (*mohar*), echoing the authenticity-verification culture familiar in Pakistan and keeping the app consistent across screens.

## Contributing

Issues and pull requests are welcome. If you've encountered a scam pattern that the rule engine misses, opening an issue with an anonymized example is especially helpful.

## License

See the [LICENSE](LICENSE) file for details.

## Author

**Huma Aslam**
GitHub: [@humaaslam46](https://github.com/humaaslam46)
