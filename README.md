<div align="center">

<!-- Banner placeholder — replace with your actual banner image -->
<!-- ![PactOS Banner](./public/banner.png) -->

# PactOS
<img width="500" height="500" alt="pactOS_bg_remove" src="https://github.com/user-attachments/assets/7f044b13-5582-4797-a8d9-64167a0b5314" />


### The Execution Layer for Financial Intent on Stellar

**A payment should enact the agreement attached to it — not merely change a balance.**

[![Stellar](https://img.shields.io/badge/Stellar-Soroban-08B5E5?style=flat-square&logo=stellar&logoColor=white)](https://stellar.org)
[![Rust](https://img.shields.io/badge/Rust-Contracts-DEA584?style=flat-square&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Full--Stack-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Alpha-orange?style=flat-square)](#-current-status)

</div>


---

## 📖 Table of Contents

- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Why Stellar](#-why-stellar)
- [Core Features](#-core-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Smart Contracts](#-smart-contracts)
- [Backend](#-backend)
- [Frontend](#-frontend)
- [Wallet Authentication Flow](#-wallet-authentication-flow)
- [Agreement Engine](#-agreement-engine)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Local Development](#-local-development)
- [Building & Deploying Contracts](#-building--deploying-contracts)
- [Screenshots](#-screenshots)
- [Demo](#-demo)
- [Current Status](#-current-status)
- [Roadmap](#-roadmap)
- [Security Notes](#-security-notes)
- [Contributing](#-contributing)
- [License](#-license)
- [Team](#-team)

---

## 🚨 The Problem

Traditional financial agreements rely on trust, intermediaries, and manual enforcement. Whether it's a freelancer payment schedule, a revenue-sharing arrangement, or a multi-party escrow — the execution of financial terms is disconnected from the terms themselves.

**The result:** disputes, delays, opaque enforcement, and counterparty risk.

Existing blockchain solutions either require writing custom smart contracts for every agreement, or they lack the composability to handle real-world financial logic like conditional transfers, milestone-based escrow, and multi-party approvals.

---

## 💡 The Solution

**PactOS** is an on-chain execution layer that binds financial intent directly to settlement. It introduces:

- **Agreements** — immutable, versioned financial primitives stored on-chain
- **Agreement Definition Language (ADL)** — a constrained, deterministic instruction set for expressing financial logic without writing arbitrary smart contract code
- **Agreement Runtime Engine** — an on-chain coordinator that executes bounded ADL programs and delegates settlement to audited financial primitives
- **Non-custodial control plane** — a backend that indexes chain facts, manages metadata, and relays signed transactions without ever holding funds or keys

> PactOS doesn't replace smart contracts — it makes them **composable, auditable, and safe** for financial agreements.

---

## 🌟 Why Stellar

| Property | Why it matters for PactOS |
|---|---|
| **Sub-second finality** | Agreement settlements confirm in 3–5 seconds |
| **Near-zero fees** | Micro-transactions and multi-party splits are economically viable |
| **Soroban smart contracts** | Rust-native, Wasm-compiled contracts with explicit authorization |
| **Native asset support** | No wrapping required — any Stellar asset can be escrowed or distributed |
| **Battle-tested network** | 8+ years of production reliability, institutional adoption |
| **Built-in compliance primitives** | Clawback, freeze, and authorization flags for regulated use cases |

---

## ⚙️ Core Features

| Feature | Status | Description |
|---|:---:|---|
| Agreement Registry | ✅ Implemented | On-chain identity, ownership, and lifecycle management for agreements |
| Agreement Runtime | ✅ Implemented | Bounded ADL program installation and deterministic execution |
| Escrow Module | ✅ Implemented | Custodial milestone escrow with lock, release, and time-based refund |
| Distribution Module | ✅ Implemented | Atomic basis-point settlement with dust handling |
| Permission Module | ✅ Implemented | Role-based access control with threshold approvals |
| Treasury Module | ✅ Implemented | Protocol fee configuration, collection, and withdrawal |
| Audit Module | ✅ Implemented | Immutable execution receipt recording |
| Wallet Authentication | ✅ Implemented | Non-custodial Freighter login with challenge-response signatures |
| Backend Control Plane | ✅ Implemented | NestJS API with auth, agreements, templates, notifications, event indexing |
| Frontend Application | ✅ Implemented | TanStack Start dashboard with builder, analytics, templates, settings |
| Testnet Deployment | ✅ Implemented | All 7 contracts deployed and verified on Stellar Testnet |
| Soroban Unit Tests | 🔲 Planned | Comprehensive test coverage for all contract modules |
| Rich Agreement Read Model | 🔲 Planned | Full agreement data (blocks, recipients, activity) exposed via API |
| Agreement Orchestration | 🔲 Planned | Off-chain transaction builder for runtime settlement opcodes |
| Activity & Analytics Endpoints | 🔲 Planned | Backend APIs to replace frontend mock data |
| Production Deployment | 🔲 Planned | Mainnet contracts, managed admin keys, production infrastructure |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          BROWSER (Client)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────────┐ │
│  │  TanStack     │  │  Zustand     │  │  Freighter Wallet         │ │
│  │  Start App    │  │  State       │  │  (User-owned keys)        │ │
│  └──────┬───────┘  └──────────────┘  └────────────┬──────────────┘ │
│         │                                          │                │
│         │  REST API                                │  Sign locally  │
└─────────┼──────────────────────────────────────────┼────────────────┘
          │                                          │
          ▼                                          ▼
┌─────────────────────────────────┐    ┌─────────────────────────────┐
│     BACKEND (NestJS)            │    │    STELLAR NETWORK           │
│  ┌───────────┐ ┌─────────────┐  │    │  ┌───────────────────────┐  │
│  │ Auth      │ │ Agreements  │  │    │  │  Soroban Contracts    │  │
│  │ Service   │ │ Service     │  │    │  │  ┌─────────────────┐  │  │
│  └───────────┘ └─────────────┘  │    │  │  │ Registry        │  │  │
│  ┌───────────┐ ┌─────────────┐  │    │  │  │ Runtime         │  │  │
│  │ Blockchain│ │ Event       │  │    │  │  │ Escrow          │  │  │
│  │ Service   │ │ Indexer     │  │    │  │  │ Distribution    │  │  │
│  └───────────┘ └─────────────┘  │    │  │  │ Permission      │  │  │
│  ┌───────────┐ ┌─────────────┐  │    │  │  │ Treasury        │  │  │
│  │ Templates │ │ Notifications│  │    │  │  │ Audit           │  │  │
│  │ Service   │ │ Service     │  │    │  │  └─────────────────┘  │  │
│  └───────────┘ └─────────────┘  │    │  └───────────────────────┘  │
│                                 │    │                             │
│  ┌─────────────────────────────┐│    └─────────────────────────────┘
│  │  PostgreSQL  │  Redis       ││
│  └──────────────┴──────────────┘│
└─────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  TRUST MODEL                                                        │
│                                                                     │
│  Contracts  →  Own funds, enforce rules, emit canonical facts       │
│  Backend    →  Index, schedule, notify, relay (never authorize)     │
│  Client     →  Display intent, collect signatures (never custody)   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center"><strong>Layer</strong></td>
<td><strong>Technology</strong></td>
</tr>
<tr>
<td>Smart Contracts</td>
<td>Rust, Soroban SDK 26, <code>no_std</code>, <code>wasm32v1-none</code></td>
</tr>
<tr>
<td>Backend</td>
<td>NestJS 11, Prisma 6, PostgreSQL 16, Redis 7, BullMQ, JWT (jose)</td>
</tr>
<tr>
<td>Frontend</td>
<td>TanStack Start, TanStack Router, React 19, Tailwind CSS 4, Zustand, Radix UI, Recharts, Motion</td>
</tr>
<tr>
<td>Blockchain</td>
<td>Stellar SDK 14, Freighter API 6, Soroban RPC</td>
</tr>
<tr>
<td>DevOps</td>
<td>Docker Compose, GitHub Actions, Cloudflare (Nitro), Stellar CLI</td>
</tr>
<tr>
<td>Tooling</td>
<td>TypeScript 5.8, Vite 8, ESLint, Prettier, Cargo</td>
</tr>
</table>

---

## 📁 Project Structure

```
pactos-v1/
├── contracts/                    # Soroban smart contract workspace
│   ├── pactos-shared/            # Shared types, errors, and domain models
│   ├── agreement-registry/       # Agreement identity and lifecycle
│   ├── agreement-runtime/        # ADL program installation and execution
│   ├── escrow-module/            # Custodial milestone escrow
│   ├── distribution-module/      # Atomic basis-point settlement
│   ├── permission-module/        # Role-based access and approvals
│   ├── treasury-module/          # Protocol fee management
│   └── audit-module/             # Immutable execution receipts
│
├── backend/                      # NestJS control plane
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/             # Wallet challenge authentication
│   │   │   ├── agreements/       # Agreement metadata CRUD
│   │   │   ├── blockchain/       # Soroban RPC client and helpers
│   │   │   ├── events/           # Event indexer with durable cursors
│   │   │   ├── templates/        # Agreement template management
│   │   │   ├── notifications/    # User notification delivery
│   │   │   └── health/           # Health check endpoint
│   │   └── platform/             # Prisma service
│   ├── prisma/
│   │   └── schema.prisma         # Database schema (14 models, 6 enums)
│   └── docker-compose.yml        # PostgreSQL + Redis
│
├── src/                          # TanStack Start frontend
│   ├── routes/                   # File-based routes (dashboard, builder, etc.)
│   ├── components/               # UI components (layout, agreements, builder, etc.)
│   ├── hooks/                    # Custom React hooks
│   └── lib/                      # API client, wallet auth, stores, types, utils
│
├── docs/                         # Architecture and contract documentation
├── scripts/                      # Deployment and utility scripts
└── PROJECT_STATUS.md             # Detailed implementation status
```

---

## 📜 Smart Contracts

PactOS uses a **modular contract architecture** — each financial primitive is an independently deployable Soroban contract with a focused responsibility.

### Contract Overview

| Contract | Crate | Responsibility | Key Methods |
|---|---|---|---|
| **Agreement Registry** | `agreement-registry` | Agreement identity, ownership, lifecycle transitions | `register`, `get`, `transition`, `update_hashes` |
| **Agreement Runtime** | `agreement-runtime` | ADL program storage and deterministic execution | `install_program`, `execute`, `execution_nonce` |
| **Escrow** | `escrow-module` | Custodial asset holding with time-based refund | `lock`, `release`, `refund`, `get` |
| **Distribution** | `distribution-module` | Atomic multi-recipient basis-point splits | `distribute` |
| **Permission** | `permission-module` | Role grants, revocations, and threshold approvals | `grant_role`, `revoke_role`, `set_threshold`, `grant_approval` |
| **Treasury** | `treasury-module` | Protocol fee configuration and collection | `initialize`, `set_fee_bps`, `collect`, `withdraw` |
| **Audit** | `audit-module` | Immutable execution receipt recording | `record`, `sequence` |
| **Shared** | `pactos-shared` | Common types, errors, and domain models | — |

### Agreement Lifecycle

```
Draft → Deployed → Funded → Active → Executing → Completed → Archived
  │         │         │        │          │
  └──► Cancelled      └──► Paused ◄──────┘
                              │
                         Cancelled
```

### Design Principles

- **`no_std` Rust** — minimal Wasm footprint with `opt-level = "z"` and LTO
- **Bounded programs** — ADL limited to 64 instructions, forward-only control flow
- **Hash references** — only 32-byte commitments stored on-chain; large metadata stays off-chain
- **Checked arithmetic** — all math uses `checked_add`, `checked_mul`, `checked_div`
- **Explicit authorization** — every mutating call requires `Address::require_auth()`
- **Reentrancy protection** — temporary storage locks per execution

### Deployed on Stellar Testnet

All seven contracts are deployed and verified on **Stellar Testnet** (`Test SDF Network ; September 2015`):

| Contract | Contract ID |
|---|---|
| Agreement Registry | `CCH2PHPRG2E5TQZEBTCSKXALOHME75LEYTKB5GUTDA3TO22TQZ5QSLZD` |
| Agreement Runtime | `CDF2BKUBBVWIEFG22EM537GKDDDL2IIVVJ3UXDIJT2YUUHJBZFID6TNF` |
| Distribution | `CCOAGQMRVTQIW3Q33EMEOM7F2MEYUKKZ52YDWJE7IV6ATHUPXGCNGQI4` |
| Escrow | `CBDKPKPGHP5AYFSZP7D3A5366IJKPT2XL26H7QROGLGP6TPNVVDK6RDQ` |
| Permission | `CAFTFBEQQS2BESE64546QCZHY2NANXDTPTXACHWL5GM5DFXXVWLVANZN` |
| Treasury | `CDYZGCP3SENRCJ2Q2XX5EBHGXGP7KSS2JQI446TBMZ45XKB7E3QBNORB` |
| Audit | `CB5BY65ZU4L2Z4J3XRWNDS5BGUODVOYT2EPVCTNDIQXCMBS2C4I22QM4` |

> **Admin address:** `GDJIXGE27JVFU6QX2I2G52E6BYN44K7LAPJIHSVMJV2OGU6XMDYBPBTP`

---

## 🔧 Backend

The backend is a **non-custodial control plane** built with NestJS. It verifies wallet signatures, manages agreement metadata, indexes on-chain events, and relays signed transactions — but it **never holds funds or private keys**.

### Modules

| Module | Purpose |
|---|---|
| **Auth** | Wallet challenge-response authentication with JWT session management |
| **Agreements** | Agreement metadata CRUD with participant tracking |
| **Blockchain** | Soroban RPC client — health, simulation, signed-XDR submission, event retrieval, ScVal decoding |
| **Events** | Idempotent event indexer with durable cursor checkpoints and transactional outbox |
| **Templates** | Agreement template management with category filtering |
| **Notifications** | User notification delivery and read-status tracking |
| **Health** | Service health check endpoint |

### Event Pipeline

```
Soroban RPC getEvents
  → Durable ListenerCheckpoint
  → Deduplicated InboxReceipt
  → ContractEvent projection
  → Transactional OutboxEvent
  → Notification / Analytics consumers
```

This design tolerates **at-least-once delivery**. Transaction/event coordinates are unique, and projections are rebuilt from Stellar evidence after any outage.

### API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/v1/auth/challenge` | Request a wallet login challenge |
| `POST` | `/v1/auth/verify` | Verify a signed challenge and issue JWT |
| `GET` | `/v1/agreements` | List agreements with cursor pagination |
| `POST` | `/v1/agreements` | Create a new agreement |
| `GET` | `/v1/agreements/:id` | Get agreement details |
| `GET` | `/v1/templates` | List templates with optional category filter |
| `POST` | `/v1/templates` | Create a new template |
| `GET` | `/v1/notifications/:userId` | List user notifications |
| `PATCH` | `/v1/notifications/:id/read` | Mark notification as read |
| `GET` | `/v1/health` | Service health check |
| `GET` | `/docs` | Swagger API documentation |

---

## 🖥️ Frontend

The frontend is a **TanStack Start** application with file-based routing, built for a modern, responsive dashboard experience.

### Pages

| Route | Description |
|---|---|
| `/` | Marketing landing page |
| `/dashboard` | Overview with stats, recent agreements, and activity feed |
| `/agreements` | Agreement list with status filtering |
| `/agreements/:id` | Agreement detail view |
| `/builder` | Visual agreement builder with drag-and-drop blocks |
| `/templates` | Template gallery with category browsing |
| `/analytics` | Charts and metrics dashboard |
| `/activity` | Activity timeline |
| `/settings` | User preferences and theme |

### Key Libraries

- **TanStack Router** — type-safe file-based routing
- **Zustand** — lightweight state management (UI theme, session, builder state)
- **Radix UI** — accessible component primitives
- **Tailwind CSS 4** — utility-first styling with dark mode
- **Recharts** — data visualization
- **Motion** — animations
- **Freighter API** — Stellar wallet integration

---

## 🔐 Wallet Authentication Flow

PactOS uses a **non-custodial challenge-response** authentication flow. The browser never receives or stores a secret key.

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Browser  │         │  Backend  │         │ Freighter │
└─────┬────┘         └─────┬────┘         └─────┬────┘
      │                     │                     │
      │  1. requestAccess() │                     │
      │──────────────────────────────────────────►│
      │  ◄── wallet address ──────────────────────│
      │                     │                     │
      │  2. POST /v1/auth/challenge               │
      │────────────────────►│                     │
      │  ◄── nonce + message│                     │
      │                     │                     │
      │  3. signMessage(message)                  │
      │──────────────────────────────────────────►│
      │  ◄── signed message ──────────────────────│
      │                     │                     │
      │  4. POST /v1/auth/verify                  │
      │  { walletAddress, nonce, signature }      │
      │────────────────────►│                     │
      │                     │  5. Verify signature │
      │                     │     with public key  │
      │                     │  6. Issue JWT        │
      │  ◄── accessToken + refreshToken ──────────│
      │                     │                     │
      │  7. Store session in Zustand (persisted)  │
      │                     │                     │
```

**Security properties:**
- ✅ Private keys never leave the wallet
- ✅ Challenge nonces are single-use and time-limited (5 min)
- ✅ Signatures are verified server-side using the wallet's public key
- ✅ JWT tokens are short-lived (15 min access, 30 day refresh)
- ✅ Refresh token hashes stored in database (never the raw token)

---

## 🧠 Agreement Engine

The Agreement Engine is the core innovation of PactOS. It separates **financial intent** (what should happen) from **financial execution** (how it happens).

### Agreement Definition Language (ADL)

ADL is a constrained, deterministic instruction set compiled into bounded on-chain programs:

| Opcode | Purpose |
|---|---|
| `When` | Trigger condition |
| `If` | Conditional branch |
| `Wait` | Time-based delay |
| `Transfer` | Direct token transfer |
| `Split` | Multi-recipient basis-point distribution |
| `Escrow` | Lock funds in custodial escrow |
| `Approve` | Require threshold approval |
| `Return` | Return funds to sender |
| `Notify` | Emit notification event |
| `End` | Program termination |

### How It Works

1. **Author** — User creates an agreement using the visual builder or templates
2. **Compile** — ADL blocks are compiled into a bounded instruction program (max 64 steps)
3. **Register** — Agreement identity and metadata are committed on-chain via the Registry
4. **Install** — The compiled ADL program is installed in the Runtime contract
5. **Fund** — Assets are locked in the Escrow contract
6. **Execute** — The Runtime executes deterministic control-flow steps; settlement opcodes are delegated to Distribution/Escrow
7. **Record** — Execution receipts are immutably recorded in the Audit contract

### Key Design Decisions

- **Contracts decide, backend relays** — the backend can never authorize a transfer
- **Programs are bounded** — no loops, max 64 instructions, forward-only control flow
- **Settlement is atomic** — Soroban transaction rollback ensures all-or-nothing execution
- **Metadata is off-chain** — only 32-byte hash commitments stored on-chain

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| [Node.js](https://nodejs.org/) | ≥ 20 | Frontend and backend runtime |
| [Bun](https://bun.sh/) | ≥ 1.0 | Frontend package manager (optional) |
| [Rust](https://www.rust-lang.org/tools/install) | ≥ 1.75 | Smart contract compilation |
| [Stellar CLI](https://soroban.stellar.org/docs/getting-started/setup) | ≥ 27 | Contract build and deployment |
| [Docker](https://docs.docker.com/get-docker/) | ≥ 24 | PostgreSQL and Redis |
| [Freighter](https://freighter.app/) | Latest | Stellar wallet browser extension |

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Pixel-Titians/pactos-v1.git
cd pactos-v1

# 2. Install frontend dependencies
bun install          # or npm install

# 3. Set up environment variables
cp .env.example .env
cp backend/.env.example backend/.env

# 4. Start database services
cd backend && docker compose up -d && cd ..

# 5. Set up the backend
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev          # Starts on http://localhost:3001
cd ..

# 6. Start the frontend
bun dev              # Starts on http://localhost:5173
```

---

## 🔑 Environment Variables

### Frontend (`.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_BACKEND_URL` | Backend API base URL | `http://localhost:3001` |
| `VITE_STELLAR_NETWORK_PASSPHRASE` | Stellar network passphrase | `Test SDF Network ; September 2015` |

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3001` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://pactos:pactos@localhost:5432/pactos` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_ACCESS_SECRET` | JWT access token secret (min 32 chars) | `your-access-secret` |
| `JWT_REFRESH_SECRET` | JWT refresh token secret (min 32 chars) | `your-refresh-secret` |
| `JWT_ACCESS_TTL` | Access token lifetime | `15m` |
| `JWT_REFRESH_TTL` | Refresh token lifetime | `30d` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000,http://localhost:5173` |
| `STELLAR_NETWORK` | Stellar network | `testnet` |
| `STELLAR_NETWORK_PASSPHRASE` | Network passphrase | `Test SDF Network ; September 2015` |
| `STELLAR_RPC_URL` | Soroban RPC endpoint | `https://soroban-testnet.stellar.org` |
| `STELLAR_HORIZON_URL` | Horizon API endpoint | `https://horizon-testnet.stellar.org` |
| `PACTOS_REGISTRY_CONTRACT_ID` | Registry contract address | `CCH2PHPRG...` |
| `PACTOS_RUNTIME_CONTRACT_ID` | Runtime contract address | `CDF2BKUBB...` |
| `PACTOS_DISTRIBUTION_CONTRACT_ID` | Distribution contract address | `CCOAGQMRV...` |
| `PACTOS_ESCROW_CONTRACT_ID` | Escrow contract address | `CBDKPKPGH...` |
| `PACTOS_PERMISSION_CONTRACT_ID` | Permission contract address | `CAFTFBEQQ...` |
| `PACTOS_TREASURY_CONTRACT_ID` | Treasury contract address | `CDYZGCP3S...` |
| `PACTOS_AUDIT_CONTRACT_ID` | Audit contract address | `CB5BY65ZU...` |

> ⚠️ **Never commit real secret keys.** Use a locally managed Stellar CLI identity for deployment.

---

## 💻 Local Development

### Running the Frontend

```bash
# From the project root
bun dev              # or: npm run dev
# → http://localhost:5173
```

### Running the Backend

```bash
cd backend

# Start PostgreSQL and Redis
docker compose up -d

# Install dependencies and set up the database
npm install
npm run prisma:generate
npm run prisma:migrate

# Start the development server
npm run dev
# → http://localhost:3001
# → Swagger docs at http://localhost:3001/docs
# → Health check at http://localhost:3001/v1/health
```

### Building Soroban Contracts

```bash
# From the project root

# Check all contracts compile
cargo check --workspace

# Run tests
cargo test

# Build optimized Wasm artifacts
stellar contract build

# Artifacts are in: target/wasm32v1-none/release/*.wasm
```

### Deploying to Testnet

```bash
# 1. Configure a funded Stellar CLI identity
stellar keys generate pactos-deployer --network testnet
stellar keys fund pactos-deployer --network testnet

# 2. Set environment variables
export STELLAR_SOURCE_ACCOUNT=pactos-deployer
export STELLAR_NETWORK=testnet

# 3. Deploy all contracts
bash scripts/deploy-testnet.sh

# 4. Initialize each contract (run manually after deploy)
# The script deploys; initialization requires the admin address.
# See docs/soroban-contracts.md for initialization commands.
```

---

## 📸 Screenshots

<!-- Replace these placeholders with actual screenshots -->

| Dashboard | Agreement Builder |
|:---:|:---:|
| ![Dashboard](./docs/screenshots/dashboard.png) | ![Builder](./docs/screenshots/builder.png) |
| *Overview with stats and recent agreements* | *Visual drag-and-drop agreement builder* |

| Templates | Analytics |
|:---:|:---:|
| ![Templates](./docs/screenshots/templates.png) | ![Analytics](./docs/screenshots/analytics.png) |
| *Pre-built agreement templates* | *Charts and metrics dashboard* |

> 📝 **Note:** Screenshots will be added as the UI is finalized. The current implementation includes fully functional dashboard, builder, templates, analytics, activity, and settings views.

---

## 🎬 Demo

<!-- Replace with actual demo video -->

[![PactOS Demo](https://img.shields.io/badge/▶_Watch_Demo-Coming_Soon-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](#)

> 📝 **Note:** A video walkthrough of the full agreement lifecycle — from creation to on-chain settlement — will be recorded and linked here.

---

## 📊 Current Status

PactOS is in **active alpha development**. Here is an honest assessment of what exists today:

### ✅ Implemented & Verified

- **7 Soroban contracts** compiled, deployed, and verified on Stellar Testnet
- **Non-custodial wallet authentication** via Freighter challenge-response
- **Backend control plane** with auth, agreements, templates, notifications, event indexing
- **Frontend application** with dashboard, builder, templates, analytics, activity, settings
- **Event pipeline** with durable cursors, deduplication, and PostgreSQL projections
- **Signed transaction submission** validated end-to-end on Testnet
- **Prisma schema** with 14 models and 6 enums, fully validated

### 🔶 Intentional Limitations

- **Agreement/dashboard views use mock data** — the current API exposes only on-chain commitments and participant wallets, not the rich read-model fields (name, description, blocks, recipients) needed by the existing UI cards
- **Activity, analytics, and transaction simulation endpoints** are not yet implemented
- **No Soroban unit/integration tests** — contract logic is verified via `cargo check` and manual Testnet interaction
- **Admin key is a single CLI identity** — production requires multisig/managed key infrastructure

### 🔲 Planned

- Soroban contract test suite
- Rich agreement read-model API endpoints
- Off-chain orchestration transaction builder
- Activity and analytics backend APIs
- Mainnet deployment with production key management

---

## 🗺️ Roadmap

| Phase | Milestone | Status |
|---|---|:---:|
| **Phase 1** | Soroban contract workspace and shared types | ✅ Done |
| **Phase 2** | Contract deployment to Testnet with initialization | ✅ Done |
| **Phase 3** | Backend control plane with auth and event indexing | ✅ Done |
| **Phase 4** | Frontend application with wallet integration | ✅ Done |
| **Phase 5** | End-to-end Testnet validation | ✅ Done |
| **Phase 6** | Soroban contract test suite | 🔲 Next |
| **Phase 7** | Rich read-model API and frontend data binding | 🔲 Planned |
| **Phase 8** | Agreement orchestration engine | 🔲 Planned |
| **Phase 9** | Security audit and mainnet preparation | 🔲 Planned |
| **Phase 10** | Mainnet deployment | 🔲 Planned |

---

## 🔒 Security Notes

> ⚠️ **PactOS is in alpha. Do not use with real assets on mainnet.**

- Every mutating contract call requires explicit `Address::require_auth()`
- Admin operations require the initialized admin address
- State transitions are allow-listed; invalid transitions are rejected
- ADL programs are bounded (max 64 instructions) and forward-only
- Basis-point splits must total exactly 10,000; all arithmetic is checked
- Soroban transaction rollback makes settlement atomic
- The backend never holds or creates wallet keys
- Refresh tokens are stored as SHA-256 hashes, never in plaintext
- Auth challenges are single-use and time-limited (5 minutes)
- Contract code has **no upgrade entrypoint** — upgrades require controlled redeployment

**Before production deployment:**
- [ ] Independent security audit of all Soroban contracts
- [ ] Multisig or managed key infrastructure for admin addresses
- [ ] Rate limiting and abuse prevention for public endpoints
- [ ] Penetration testing of backend API
- [ ] Formal verification of critical contract paths

---

## 🤝 Contributing

PactOS is open-source and contributions are welcome. Here's how to get involved:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feat/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feat/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code patterns and naming conventions
- Run `cargo check --workspace` before committing contract changes
- Run `npm run build` in both root and `backend/` before submitting
- Use conventional commits (`feat:`, `fix:`, `docs:`, `chore:`)
- Add tests for new contract functionality
- Update `PROJECT_STATUS.md` when completing significant work

### Areas Where Help Is Needed

- 🧪 Soroban contract unit and integration tests
- 📡 Rich agreement read-model API endpoints
- 🎨 Frontend data binding to real backend APIs
- 📚 Documentation improvements
- 🔍 Security review and feedback

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 👥 Team

Built by **Pixel Titans** — a team passionate about making financial agreements programmable, transparent, and trustless.

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-Pixel--Titians-181717?style=flat-square&logo=github)](https://github.com/Pixel-Titians)

</div>

---

<div align="center">

**Built with ❤️ on Stellar**

[![Stellar](https://img.shields.io/badge/Stellar-Testnet-08B5E5?style=flat-square&logo=stellar&logoColor=white)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Soroban-Smart_Contracts-08B5E5?style=flat-square)](https://soroban.stellar.org/)

</div>
