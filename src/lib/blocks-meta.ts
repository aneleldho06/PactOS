import {
  Zap, ArrowRight, Repeat, Split, Timer, Filter, ShieldCheck, Lock, Undo2,
} from "lucide-react";
import type { BlockType } from "./types";

export const BLOCK_META: Record<BlockType, {
  label: string;
  description: string;
  icon: typeof Zap;
  color: string;
}> = {
  WHEN:    { label: "WHEN",    description: "Trigger the flow",        icon: Zap,          color: "var(--chart-1)" },
  THEN:    { label: "THEN",    description: "Run an action",           icon: ArrowRight,   color: "var(--chart-1)" },
  CONVERT: { label: "CONVERT", description: "Exchange currency",       icon: Repeat,       color: "var(--chart-2)" },
  SPLIT:   { label: "SPLIT",   description: "Distribute funds",        icon: Split,        color: "var(--chart-4)" },
  WAIT:    { label: "WAIT",    description: "Delay execution",         icon: Timer,        color: "var(--chart-3)" },
  IF:      { label: "IF",      description: "Add a condition",         icon: Filter,       color: "var(--chart-3)" },
  APPROVE: { label: "APPROVE", description: "Require approval",        icon: ShieldCheck,  color: "var(--chart-2)" },
  ESCROW:  { label: "ESCROW",  description: "Lock funds until met",    icon: Lock,         color: "var(--chart-4)" },
  RETURN:  { label: "RETURN",  description: "Return unclaimed funds",  icon: Undo2,        color: "var(--chart-5)" },
};