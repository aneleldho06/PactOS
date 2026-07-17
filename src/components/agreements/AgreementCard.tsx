import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { Agreement } from "@/lib/types";
import { StatusPill } from "./StatusPill";
import { ProgressRing } from "./ProgressRing";
import { RecipientAvatars } from "./RecipientAvatars";
import { money, countdown } from "@/lib/format";

export function AgreementCard({ a }: { a: Agreement }) {
  const next = countdown(a.nextRun);
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-elegant hover:shadow-glow"
    >
      <Link to="/agreements/$id" params={{ id: a.id }} className="absolute inset-0" aria-label={a.name} />
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-lg">
            {a.emoji}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[15px] font-semibold">{a.name}</div>
            <div className="mt-0.5 flex items-center gap-2">
              <StatusPill status={a.status} />
              <span className="text-xs text-muted-foreground">{a.cadence}</span>
            </div>
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0 space-y-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {a.status === "waiting" ? "Expected" : "Monthly budget"}
            </div>
            <div className="mt-1 font-display text-2xl tabular-nums">
              {a.monthlyBudget ? money(a.monthlyBudget, a.currency) : "—"}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RecipientAvatars recipients={a.recipients} />
            <span className="text-xs text-muted-foreground">
              {a.recipients.length} recipient{a.recipients.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <ProgressRing value={a.progress ?? 0} />
          {next && a.status === "active" && (
            <div className="text-[11px] text-muted-foreground">
              Runs in <span className="font-medium text-foreground">{next}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}