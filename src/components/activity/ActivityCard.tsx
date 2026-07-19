import type { ActivityEvent } from "@/lib/types";
import { relTime } from "@/lib/format";
import { ArrowDownToLine, ArrowUpFromLine, Repeat, Undo2, Zap, Settings2 } from "lucide-react";
import { motion } from "motion/react";

const KIND_MAP = {
  execution:  { Icon: Zap,             color: "text-primary bg-primary/10" },
  deposit:    { Icon: ArrowDownToLine, color: "text-success bg-success/10" },
  payout:     { Icon: ArrowUpFromLine, color: "text-primary bg-primary/10" },
  return:     { Icon: Undo2,           color: "text-warning bg-warning/10" },
  conversion: { Icon: Repeat,          color: "text-info bg-info/10" },
  system:     { Icon: Settings2,       color: "text-muted-foreground bg-muted" },
} as const;

export function ActivityCard({ e }: { e: ActivityEvent }) {
  const cfg = KIND_MAP[e.kind];
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border-[3px] border-foreground bg-card px-4 py-3 shadow-elegant hover:shadow-glow transition"
    >
      <div className={`grid h-9 w-9 place-items-center rounded-xl ${cfg.color}`}>
        <cfg.Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold">{e.title}</div>
        <div className="truncate text-xs text-muted-foreground">{e.subtitle}</div>
      </div>
      <div className="text-right">
        {e.amount && <div className="font-medium tabular-nums">{e.amount}</div>}
        <div className="text-xs text-muted-foreground">{relTime(e.time)}</div>
      </div>
    </motion.div>
  );
}