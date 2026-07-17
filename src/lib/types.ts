export type Currency = "USD" | "INR" | "EUR" | "USDC" | "XLM" | "GBP";

export type AgreementStatus = "active" | "completed" | "waiting" | "paused" | "draft";

export interface Recipient {
  id: string;
  name: string;
  role: string;
  share: number; // percent
  avatarColor: string; // token key or hex
  currency: Currency;
}

export type BlockType =
  | "WHEN"
  | "THEN"
  | "CONVERT"
  | "SPLIT"
  | "WAIT"
  | "IF"
  | "APPROVE"
  | "ESCROW"
  | "RETURN";

export interface Block {
  id: string;
  type: BlockType;
  title: string;
  subtitle?: string;
  config?: Record<string, unknown>;
}

export interface Agreement {
  id: string;
  emoji: string;
  name: string;
  description: string;
  status: AgreementStatus;
  cadence: string; // "Monthly" | "One-time" | ...
  monthlyBudget?: number;
  currency: Currency;
  nextRun?: string; // ISO date
  createdAt: string;
  progress?: number; // 0-100
  recipients: Recipient[];
  blocks: Block[];
}

export interface ActivityEvent {
  id: string;
  kind: "execution" | "deposit" | "payout" | "return" | "conversion" | "system";
  title: string;
  subtitle: string;
  amount?: string;
  status: "completed" | "pending" | "failed";
  time: string; // ISO
  agreementId?: string;
}

export interface TemplateDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: string;
  accent: string; // css var name or hex
  blocks: Block[];
}