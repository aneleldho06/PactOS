import { motion } from "motion/react";
import { Check, Circle, Zap, Repeat, Split, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface TimelineItem {
  id: string;
  title: string;
  subtitle?: string;
  time?: string;
  status: "done" | "current" | "pending";
  icon?: LucideIcon;
}

const ICONS: Record<string, LucideIcon> = { Zap, Repeat, Split, ShieldCheck };

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative space-y-4 pl-2">
      {items.map((it, i) => {
        const Icon = it.icon ?? (it.status === "done" ? Check : Circle);
        const isLast = i === items.length - 1;
        return (
          <motion.li
            key={it.id}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className="relative pl-10"
          >
            {!isLast && (
              <span className="absolute left-[15px] top-8 h-[calc(100%+8px)] w-px bg-border" aria-hidden />
            )}
            <span
              className={`absolute left-0 top-0 grid h-8 w-8 place-items-center rounded-full ring-4 ring-background
                ${it.status === "done" ? "bg-success text-success-foreground" :
                   it.status === "current" ? "bg-primary text-primary-foreground" :
                   "bg-muted text-muted-foreground"}`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="rounded-xl border-[3px] border-foreground bg-card px-4 py-3 shadow-elegant">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{it.title}</div>
                  {it.subtitle && (
                    <div className="truncate text-xs text-muted-foreground">{it.subtitle}</div>
                  )}
                </div>
                {it.time && (
                  <div className="shrink-0 text-xs text-muted-foreground">{it.time}</div>
                )}
              </div>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
export { ICONS as TIMELINE_ICONS };