# PactOS Control Plane

NestJS backend for authentication, agreement metadata, read models, Soroban event indexing, and notifications. It is deliberately non-custodial: wallets sign transactions, and financial decisions remain on-chain.

## Local development

1. Copy `.env.example` to `.env` and set secrets/contract IDs.
2. Run `docker compose up -d`.
3. Run `npm install`, `npm run prisma:generate`, then `npm run prisma:migrate`.
4. Run `npm run dev`; Swagger is available at `/docs` and health at `/v1/health`.

## Event pipeline

`getEvents` RPC → durable `ListenerCheckpoint` → deduplicated `InboxReceipt` → `ContractEvent` projection → transactional `OutboxEvent` → notification/analytics consumers.

This design tolerates at-least-once delivery. Transaction/event coordinates are unique, and the backend must rebuild projections from Stellar evidence after an outage.

## Stellar Testnet integration

The backend reads `STELLAR_RPC_URL` and all seven `PACTOS_*_CONTRACT_ID` values from configuration. Startup validates every contract ID. The RPC client has health, simulation, signed-XDR submission, transaction lookup, event retrieval, and ScVal decoding helpers; it does not hold or create wallet keys.

`getEvents` uses two contract filters because Stellar Testnet permits at most five contract IDs per filter. It stores the RPC pagination cursor after each successful page and deduplicates with the RPC event ID before writing the `ContractEvent` and `OutboxEvent` projections.

Validated on 2026-07-18: healthy Testnet RPC, seven loaded IDs, Treasury read simulation, signed transaction submission reaching `SUCCESS`, decoded `feecfg = 0` events, durable PostgreSQL projections, and an immediate replay poll with no duplicate rows.
