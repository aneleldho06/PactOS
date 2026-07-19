import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface Props {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
  icon: LucideIcon;
  spark?: { v: number }[];
}

export function StatCard({ label, value, delta, positive = true, icon: Icon, spark }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-2xl border-[3px] border-foreground bg-card p-5 shadow-elegant"
    >
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="mt-3 font-display text-3xl tabular-nums">{value}</div>
      {delta && (
        <div className={`mt-1 text-xs font-medium ${positive ? "text-success" : "text-destructive"}`}>
          {delta}
        </div>
      )}
      {spark && (
        <div className="absolute inset-x-0 bottom-0 h-10 opacity-70">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`sp-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="var(--primary)" strokeWidth={1.6} fill={`url(#sp-${label})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}