import { cn } from "@/lib/utils";
import type { AgreementStatus } from "@/lib/types";
import { CheckCircle2, Clock, PauseCircle, Zap, FileEdit } from "lucide-react";

const MAP: Record<AgreementStatus, { label: string; className: string; Icon: typeof Zap }> = {
  active:    { label: "Active",              className: "bg-success/10 text-success ring-success/20",       Icon: Zap },
  completed: { label: "Completed",           className: "bg-success/10 text-success ring-success/20",       Icon: CheckCircle2 },
  waiting:   { label: "Waiting for Deposit", className: "bg-warning/10 text-warning ring-warning/20",       Icon: Clock },
  paused:    { label: "Paused",              className: "bg-muted text-muted-foreground ring-border",       Icon: PauseCircle },
  draft:     { label: "Draft",               className: "bg-muted text-muted-foreground ring-border",       Icon: FileEdit },
};

export function StatusPill({ status, className }: { status: AgreementStatus; className?: string }) {
  const s = MAP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        s.className,
        className,
      )}
    >
      <s.Icon className="h-3 w-3" />
      {s.label}
    </span>
  );
}