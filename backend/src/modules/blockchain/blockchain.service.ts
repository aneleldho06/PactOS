import { BadGatewayException, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { StrKey, scValToNative, xdr } from "@stellar/stellar-sdk";

export type PactosContracts = Record<
  "registry" | "runtime" | "distribution" | "escrow" | "permission" | "treasury" | "audit",
  string
>;

export type RpcContractEvent = {
  id: string;
  ledger: number;
  txHash: string;
  transactionIndex: number;
  operationIndex: number;
  contractId: string;
  topic: string[];
  value: string;
};

export type DecodedContractEvent = Omit<RpcContractEvent, "topic" | "value"> & {
  eventIndex: number;
  topic: unknown[];
  value: unknown;
};

type RpcEventPage = {
  events: RpcContractEvent[];
  latestLedger: number;
  oldestLedger: number;
  cursor: string;
};
type LatestLedger = { sequence: number };

@Injectable()
export class BlockchainService {
  readonly contracts: PactosContracts;
  private readonly rpcUrl: string;

  constructor(private readonly config: ConfigService) {
    this.rpcUrl = this.config.getOrThrow<string>("STELLAR_RPC_URL");
    this.contracts = {
      registry: this.contractId("PACTOS_REGISTRY_CONTRACT_ID"),
      runtime: this.contractId("PACTOS_RUNTIME_CONTRACT_ID"),
      distribution: this.contractId("PACTOS_DISTRIBUTION_CONTRACT_ID"),
      escrow: this.contractId("PACTOS_ESCROW_CONTRACT_ID"),
      permission: this.contractId("PACTOS_PERMISSION_CONTRACT_ID"),
      treasury: this.contractId("PACTOS_TREASURY_CONTRACT_ID"),
      audit: this.contractId("PACTOS_AUDIT_CONTRACT_ID"),
    };
  }

  async health() {
    return this.rpc<{ status: string }>("getHealth");
  }
  async latestLedger() {
    return this.rpc<LatestLedger>("getLatestLedger");
  }

  // XDR is produced and signed by the caller's wallet; the backend remains non-custodial.
  async simulate(transactionXdr: string) {
    return this.rpc("simulateTransaction", { transaction: this.transactionXdr(transactionXdr) });
  }
  async submit(transactionXdr: string) {
    return this.rpc("sendTransaction", { transaction: this.transactionXdr(transactionXdr) });
  }
  async transaction(hash: string) {
    return this.rpc("getTransaction", { hash });
  }

  async events(cursor?: string): Promise<RpcEventPage> {
    // Stellar RPC limits a single event filter to five contract IDs.
    const ids = Object.values(this.contracts);
    const filters = Array.from({ length: Math.ceil(ids.length / 5) }, (_, index) => ({
      type: "contract",
      contractIds: ids.slice(index * 5, index * 5 + 5),
    }));
    if (cursor)
      return this.rpc<RpcEventPage>("getEvents", { pagination: { cursor, limit: 100 }, filters });

    // The initial checkpoint intentionally starts at the current ledger. It avoids a
    // retention-window replay while every subsequent page is cursor-based.
    const { sequence } = await this.latestLedger();
    return this.rpc<RpcEventPage>("getEvents", {
      startLedger: sequence,
      pagination: { limit: 100 },
      filters,
    });
  }

  decodeEvent(event: RpcContractEvent): DecodedContractEvent {
    const eventIndex = this.eventIndex(event.id);
    return {
      ...event,
      eventIndex,
      topic: event.topic.map((item) => this.scVal(item)),
      value: this.scVal(event.value),
    };
  }

  async rpc<T>(method: string, params: unknown = {}): Promise<T> {
    let response: Response;
    try {
      response = await fetch(this.rpcUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: crypto.randomUUID(), method, params }),
        signal: AbortSignal.timeout(15_000),
      });
    } catch (cause) {
      throw new ServiceUnavailableException({
        message: "Stellar RPC unavailable",
        method,
        cause: this.message(cause),
      });
    }

    let payload: { result?: T; error?: { code?: number; message?: string; data?: unknown } };
    try {
      payload = (await response.json()) as typeof payload;
    } catch {
      throw new BadGatewayException({
        message: "Stellar RPC returned invalid JSON",
        method,
        status: response.status,
      });
    }
    if (!response.ok || payload.error || payload.result === undefined) {
      throw new BadGatewayException({
        message: payload.error?.message ?? "Stellar RPC request failed",
        method,
        status: response.status,
        rpcCode: payload.error?.code,
        rpcData: payload.error?.data,
      });
    }
    return payload.result;
  }

  private contractId(key: string): string {
    const value = this.config.getOrThrow<string>(key);
    if (!StrKey.isValidContract(value))
      throw new Error(`${key} must be a valid Stellar contract ID`);
    return value;
  }

  private transactionXdr(value: string): string {
    if (!value || typeof value !== "string")
      throw new BadGatewayException("A signed transaction XDR is required");
    return value;
  }

  private eventIndex(id: string): number {
    const match = /-(\d+)$/.exec(id);
    if (!match) throw new BadGatewayException(`Stellar RPC event has an invalid id: ${id}`);
    return Number(match[1]);
  }

  private scVal(value: string): unknown {
    try {
      return this.jsonSafe(scValToNative(xdr.ScVal.fromXDR(value, "base64")));
    } catch {
      throw new BadGatewayException("Stellar RPC returned an invalid event ScVal");
    }
  }

  private jsonSafe(value: unknown): unknown {
    if (typeof value === "bigint") return value.toString();
    if (Array.isArray(value)) return value.map((item) => this.jsonSafe(item));
    if (value && typeof value === "object") {
      if ("toString" in value && Object.keys(value).length === 0) return String(value);
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, this.jsonSafe(item)]),
      );
    }
    return value;
  }

  private message(cause: unknown) {
    return cause instanceof Error ? cause.message : "unknown transport error";
  }
}
