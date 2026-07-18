# PactOS Soroban Contracts

## Scope and deployment boundary

The contract workspace implements the finalized PactOS smart-contract modules. It uses Soroban SDK 26, Rust `no_std`, explicit errors, bounded programs, and hash references for large agreement metadata. Deployments must be independently security-audited before custodying production assets.

## Contracts and public methods

| Contract | Public methods |
| --- | --- |
| Agreement Registry | `initialize`, `register`, `get`, `transition`, `update_hashes` |
| Agreement Runtime | `initialize`, `install_program`, `execute`, `execution_nonce` |
| Distribution | `distribute` |
| Escrow | `initialize`, `lock`, `release`, `refund`, `get` |
| Permission | `initialize`, `grant_role`, `revoke_role`, `set_threshold`, `grant_approval`, `has_role`, `approvals_met` |
| Treasury | `initialize`, `set_fee_bps`, `collect`, `withdraw`, `fee_bps` |
| Audit | `initialize`, `record`, `sequence` |

## Storage decisions

- Agreement records are persistent and contain only IDs, addresses, timestamps, status, version, and 32-byte metadata/rule commitments.
- ADL programs are bounded to 64 instructions. Each instruction holds an opcode, next instruction, and 32-byte operand commitment.
- Approval entries are persistent and agreement/action/approver scoped; audit storage only maintains a compact monotonically increasing receipt sequence. Full history is indexed from events.
- Reentrancy locks are temporary storage, minimizing state rent for per-transaction protection.

## Lifecycle

```mermaid
stateDiagram-v2
  Draft --> Deployed
  Draft --> Cancelled
  Deployed --> Funded
  Deployed --> Paused
  Funded --> Active
  Funded --> Cancelled
  Active --> Executing
  Active --> Paused
  Active --> Completed
  Executing --> Active
  Executing --> Paused
  Executing --> Completed
  Paused --> Active
  Paused --> Cancelled
  Completed --> Archived
  Cancelled --> Archived
```

## Events

Contract events use compact stable symbols: `agrc`, `agru`, `agrs`, `execstart`, `adl_step`, `exec_done`, `payout`, `esclock`, `escrel`, `escrefund`, `approval`, `feecoll`, and `audit_rec`. Indexers map symbols to the product event names in the architecture.

## Security notes

- Every mutating user operation requires `Address::require_auth`; admin operations require the initialized admin.
- State transitions are allow-listed, programs are bounded/forward-only, splits must total 10,000 bps, and all arithmetic uses checked operations.
- Soroban transaction rollback makes distribution and escrow settlements atomic.
- Admin keys should be multisig/managed off-chain. Contract code has no upgrade entrypoint; upgrades require a controlled redeployment/migration process.

## Testnet workflow

1. Install the current Stellar CLI and configure a funded Testnet source identity.
2. Copy `.env.example` to your untracked environment file and export its values.
3. Run `cargo test`, then `stellar contract build`.
4. Run `scripts/deploy-testnet.sh`; initialize each deployed contract using its alias and the configured admin address.

Never put production secret keys in environment files, source control, or frontend code.

## Stellar Testnet deployment (2026-07-18)

- Network: Stellar Testnet (`Test SDF Network ; September 2015`); deployer/admin: `pactos-deployer` / `GDJIXGE27JVFU6QX2I2G52E6BYN44K7LAPJIHSVMJV2OGU6XMDYBPBTP`.
- Deployed: Registry `CCH2PHPRG2E5TQZEBTCSKXALOHME75LEYTKB5GUTDA3TO22TQZ5QSLZD`; Runtime `CDF2BKUBBVWIEFG22EM537GKDDDL2IIVVJ3UXDIJT2YUUHJBZFID6TNF`; Distribution `CCOAGQMRVTQIW3Q33EMEOM7F2MEYUKKZ52YDWJE7IV6ATHUPXGCNGQI4`; Escrow `CBDKPKPGHP5AYFSZP7D3A5366IJKPT2XL26H7QROGLGP6TPNVVDK6RDQ`; Permission `CAFTFBEQQS2BESE64546QCZHY2NANXDTPTXACHWL5GM5DFXXVWLVANZN`; Treasury `CDYZGCP3SENRCJ2Q2XX5EBHGXGP7KSS2JQI446TBMZ45XKB7E3QBNORB`; Audit `CB5BY65ZU4L2Z4J3XRWNDS5BGUODVOYT2EPVCTNDIQXCMBS2C4I22QM4`.
- Initialized: Registry, Runtime, Escrow, Permission, Audit, and Treasury. Distribution has no initializer.
- Verified read calls: Runtime `execution_nonce` returned `0`; Permission `has_role` returned `false`; Audit `sequence` returned `0`. Registry and Escrow `get` correctly returned their `NotFound` contract error for an all-zero unknown ID. Distribution exposes no read-only entry point; its deployed interface was inspected through Stellar CLI.
- Treasury verification: initialized by `pactos-deployer` with `fee_bps = 0`; the deployed `fee_bps` read returned `0` without error. Initialization transaction: `f7c39cd05b285d0a7f95abd303720ce328cd9d8e8a237020c0257962ab5564d3`.
- Backend integration verification: Testnet RPC was healthy, all seven configured IDs loaded, Treasury reads simulated, and a prepared signed Treasury transaction submitted through the backend reached `SUCCESS` (`f477613f060895144aacc8a96cb1b4a38777e2c5c7bdbb4c2c32096d9b149494`). Its `feecfg` event decoded to `0` and was stored exactly once by the durable indexer.
