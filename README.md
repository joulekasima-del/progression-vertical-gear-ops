# Progression Vertical Operations System

Operations system for Progression Vertical Climbing Gym.

## Stack

- **Frontend:** HTML, CSS, JavaScript (hosted on GitHub Pages)
- **Backend/API:** Google Apps Script
- **Database:** Google Sheets
- **Weekly Report:** Slack Incoming Webhook

## Apps

1. **Gear Inspection** — Daily gear inspection by category
2. **Gear Check-Out & Return** — Course gear and outdoor rental tracking

## Folder Structure

```text
index.html              → Home page / app launcher
shared/                 → Shared config, API helper, and styles
gear-inspection/        → Gear Inspection web app
gear-checkout-return/   → Gear Check-Out & Return web app
print/                  → Printable Outdoor Rental Agreement
apps-script/            → Google Apps Script backend (reference copies)
docs/                   → Setup guides, tracker, schema, and testing docs
```

## Agent Workflow Docs

Use these files as the source of truth when working with Codex as the project agent:

- `docs/build_tracker.html` — step-by-step build tracker and ready-to-copy prompts
- `docs/project_introduction.md` — full system context and operating rules
- `docs/database_schema.md` — Google Sheets tabs, columns, and database rules
- `docs/testing_checklist.md` — staff workflow tests and deployment checks

## Setup

See the `docs/` folder for step-by-step setup guides.

