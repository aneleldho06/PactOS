# Project Status

- **Current phase:** Testnet deployment identity prepared; contract deployment pending
- **Last updated:** 2026-07-17 23:39 IST

## Completed

- TanStack Start + React application scaffolded with file-based routes.
- Built marketing, dashboard, agreements, builder, templates, analytics, activity, and settings views.
- Added reusable UI components, agreement/block domain types, mock data, and client-side Zustand stores.
- Added production build configuration targeting Cloudflare-compatible Nitro output.
- Added a modular Rust/Soroban workspace for PactOS: registry, runtime, distribution, escrow, permissions, treasury, audit, and shared domain types.
- Added optimized `wasm32v1-none` release configuration, Testnet deployment script, environment template, and contract developer documentation.
- Verified all contract crates with `cargo check --workspace` and generated optimized Wasm artifacts with `stellar contract build`.
- Added NestJS control-plane scaffold under `backend/` with wallet challenge authentication, agreement metadata APIs, Stellar RPC wrappers, idempotent event indexing, templates, notifications, health checks, Prisma schema, Docker Compose, and CI workflow.
- Normalized every Prisma schema model and enum declaration; Prisma formatting, validation, and client generation now succeed.
- Aligned template JSON request validation with Prisma `InputJsonObject`; backend TypeScript build now succeeds.
- Created the dedicated Stellar Testnet CLI identity `pactos-deployer`, funded it, and configured it as the initial PactOS admin for MVP deployment.

## Files created or modified

- Application source: `src/` (routes, components, styles, domain helpers/stores)
- Build/configuration: `package.json`, `vite.config.ts`, `src/server.ts`
- Project snapshot: `PROJECT_STATUS.md`
- Soroban workspace: `Cargo.toml`, `Cargo.lock`, `contracts/**`
- Contract docs/deployment: `docs/soroban-contracts.md`, `scripts/deploy-testnet.sh`, `.env.example`
- Local deployment configuration: `.env` (ignored; contains no secret key)
- Backend: `backend/**`, `.github/workflows/backend.yml`

## Architecture decisions

- **ADR-001:** Use TanStack Start with TanStack Router file-based routing for the app shell and pages.
- **ADR-002:** Keep prototype data local in `src/lib/mock.ts`; no backend, wallet, or database integration yet.
- **ADR-003:** Use Zustand for builder/UI state; persist only the UI theme in browser storage.
- **ADR-004:** Model agreement flows as ordered, typed blocks (`WHEN`, `THEN`, `SPLIT`, etc.).
- **ADR-005:** Keep each Soroban responsibility in an independently deployable contract crate; use `pactos-shared` for stable, serializable cross-module types.
- **ADR-006:** Store only compact agreement/program commitments on-chain; retain metadata and ADL operands off-chain by 32-byte hashes.
- **ADR-007:** Use standard Soroban token contracts for asset settlement; transfers are atomic with the invoking transaction.
- **ADR-008:** Backend is a non-custodial control plane: it verifies wallet login signatures, simulates/submits wallet-signed XDR, and indexes chain facts without financial decision authority.
- **ADR-009:** Soroban events are indexed at-least-once using durable cursor checkpoints and inbox receipts; projected effects are deduplicated by transaction/event coordinates.

## Public interfaces

- Domain contracts in `src/lib/types.ts`: `Agreement`, `Recipient`, `Block`, `ActivityEvent`, `TemplateDef`.
- Builder store in `src/lib/stores.ts`: block add/remove/move/update, template load, and reset operations.
- No network APIs, smart-contract interfaces, or external events are implemented.
- Soroban contract interfaces are documented in `docs/soroban-contracts.md`; public methods include lifecycle management, ADL program installation/execution, settlement, escrow, approvals, fees, and audit receipts.
- Backend endpoints: `POST /v1/auth/challenge`, `POST /v1/auth/verify`, `GET|POST /v1/agreements`, `GET /v1/agreements/:id`, `GET|POST /v1/templates`, `GET|PATCH /v1/notifications/:id`, `GET /v1/health`, and Swagger at `/docs`.

## Remaining work

- Add Soroban unit/integration/negative tests for every contract, including token-auth, expiry, and multi-party approval scenarios.
- Migrate legacy event publication to typed `#[contractevent]` definitions, as recommended by the current SDK.
- Define the trusted off-chain orchestration transaction that fulfills runtime settlement-opcode commitments atomically with distribution/escrow calls.
- Configure a funded Testnet deployer/admin and initialize/deploy contracts through the supplied script.
- Connect the existing frontend to deployed contract IDs and a transaction-signing flow.
- Create and apply the initial Prisma migration against a clean PostgreSQL instance, then resolve TypeScript/build validation findings.
- Add BullMQ processors for listener polling, outbox dispatch, retry/DLQ, analytics aggregation, and notification delivery.
- Add backend unit/integration/API tests and Testnet RPC integration tests.

## Implementation notes and known debt

- The Builder’s **Save** button is presently visual only; **Test run** opens a local modal.
- Mock data drives the current UI, so changes do not persist beyond current client state (except theme preference).
- Build reports a non-blocking Vite notice: `vite-tsconfig-paths` can be replaced by Vite’s native `resolve.tsconfigPaths` option.
- No test script is configured.
- The official Stellar `smart-contracts` skill was installed from `stellar/stellar-dev-skill` after the initial implementation; apply it to the next contract review/refinement task.
- Contract events currently use the SDK-compatible compact event API and build with deprecation warnings; typed events remain a follow-up.
- This source has not undergone an independent security audit and must not custody production assets until audited.
- Prisma generation requires `DATABASE_URL`; use the documented local Compose connection string or an environment-specific database URL.
- Testnet deployer identity is ready: `pactos-deployer` resolves to `GDJIXGE27JVFU6QX2I2G52E6BYN44K7LAPJIHSVMJV2OGU6XMDYBPBTP`; Horizon confirmed the account exists with 10,000 native Testnet XLM. No contracts have been deployed.
- Testnet deployment attempt stopped before transaction submission: the local deployment environment sets `STELLAR_RPC_URL` but omits `STELLAR_NETWORK_PASSPHRASE`; Stellar CLI requires it when an RPC URL is explicitly configured. No PactOS contract IDs were created.

## Next recommended task

- Add `STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015` to the local deployment environment, then retry deployment using `pactos-deployer` as both deployer and initial admin.

## Build/test status

- `npm run build` — passed on 2026-07-17 (prior frontend validation).
- `cargo check --workspace` — passed on 2026-07-17 (Soroban SDK 26.1.0); legacy event API deprecation warnings remain.
- `stellar contract build` — passed on 2026-07-17; all seven deployable Wasm artifacts are below the 64 KB contract limit.
- `cargo test --workspace --no-run` — passed on 2026-07-17; test harness compiles, but authored contract test cases are still required.
- `npx prisma format` — passed on 2026-07-17.
- `npx prisma validate` — passed on 2026-07-17 with the documented local `DATABASE_URL`.
- `npx prisma generate` — passed on 2026-07-17 (Prisma Client 6.19.3).
- `npm run build` (backend) — passed on 2026-07-17.
