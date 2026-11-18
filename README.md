# Provo (Proofwork) — Frontend

**Provo** protects daily pay for skilled artisans and turns settled work days into a verifiable **Profile Score** and work-history report for lenders.

Employers fund jobs upfront into protected Paga escrow accounts, workers mark each day done (via web or USSD `*123#`), employers or site supervisors confirm completion (with optional proof photos), and confirmed days pay out automatically while building the worker's tamper-evident ledger.

---

## Repositories

This project is split across two repositories:

| Service | Repository | Description |
| --- | --- | --- |
| **Frontend (this repo)** | [Team-Blueprint/proofwork-frontend](https://github.com/Team-Blueprint/proofwork-frontend) | React + Vite web application, USSD simulator, and interactive docs |
| **Backend API** | [Team-Blueprint/proofwork-backend](https://github.com/Team-Blueprint/proofwork-backend) | REST API, Paga escrow integration, USSD/SMS webhooks, and signed snapshot ledger |

---

## Key Features & Routes

- **Worker Dashboard (`/worker`, `/worker/jobs`, `/worker/settings`, `/worker/consent`, `/worker/share-link`)**
  - View **Provo Score**, **Total Earned**, **Pending Pay**, and **Paid days**
  - Mark daily milestones done and track 24-hour auto-release windows
  - Withdraw available earnings via PIN-verified **Worker Withdrawal** modal to linked or external Nigerian bank accounts
  - Generate NDPA-compliant consent links to share verified reports with lenders
- **Employer Dashboard (`/employer`, `/employer/jobs`)**
  - Financial summary strip: **Total Paid Out**, **Locked in Paga**, and **Awaiting Funding**
  - Create jobs, generate dedicated Paga NUBAN funding accounts, and confirm or dispute reported days
  - Inspect proof photos uploaded by site supervisors
- **Supervisor Verification (`/supervisor`, `/supervisor/verify`)**
  - Direct verification portal for site foremen to confirm work done, attach site proof photos, or raise disputes
- **USSD Simulator (`/ussd`)**
  - Interactive `*123#` feature-phone flow connected to the backend USSD endpoints for offline/low-bandwidth check-ins and payouts
- **Lender Report (`/report/:token`)**
  - Verified **Profile Score**, masked employer work history, outcome filter (`All`, `Client`, `Supervisor`, `Auto`), signed ledger snapshot, and PDF export
- **Docs (`/docs`)**
  - In-app API reference, architecture diagram, and integration guides

---

## Tech Stack

- **Framework**: React 19, TypeScript, Vite 8
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4 + custom design tokens (`src/design/proofwork-tokens.css`)
- **Icons**: `reicon-react`
- **Package Manager**: `bun`

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- Running instance of the [Provo Backend](https://github.com/Team-Blueprint/proofwork-backend) (or use mock mode for standalone UI testing)

### Installation

```bash
bun install
```

### Environment Variables

Create a `.env` file in the root of `frontend/` if you want to point to a custom backend URL or enable mock mode:

```env
# Base URL for the Proofwork backend API (defaults to /api)
VITE_API_BASE_URL=http://localhost:8000/api

# Set to "true" to run with local in-browser mock data instead of the live backend
VITE_USE_MOCK=false
```

### Scripts

```bash
# Start development server
bun run dev

# Type-check and build for production
bun run build

# Run linter
bun run lint

# Preview production build
bun run preview
```
