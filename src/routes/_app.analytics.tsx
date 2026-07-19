import { createFileRoute } from "@tanstack/react-router";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { StatCard } from "@/components/agreements/StatCard";
import { monthlyVolume, currencyDistribution, successRateSeries } from "@/lib/mock";
import { Activity, TrendingUp, Wallet, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_app/analytics")({
  component: AnalyticsPage,
});

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function AnalyticsPage() {
  const spark = monthlyVolume.slice(-8).map((d) => ({ v: d.v }));
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl sm:text-4xl">Analytics</h1>
      <p className="mt-1 text-sm text-muted-foreground">Insights into your programmable financial flows.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Volume" value="$94.3k" delta="+22%" icon={TrendingUp} spark={spark} />
        <StatCard label="Executions" value="1,284" delta="+12%" icon={Activity} spark={spark} />
        <StatCard label="Recipients" value="182" delta="+8" icon={Wallet} spark={spark} />
        <StatCard label="Success Rate" value="99.8%" delta="+0.2%" icon={CheckCircle2} spark={spark} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border-[3px] border-foreground bg-card p-6 shadow-elegant">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Monthly volume</div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyVolume}>
                <defs>
                  <linearGradient id="vol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="v" stroke="var(--primary)" strokeWidth={2} fill="url(#vol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border-[3px] border-foreground bg-card p-6 shadow-elegant">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Currency mix</div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={currencyDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {currencyDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border-[3px] border-foreground bg-card p-6 shadow-elegant">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Execution success</div>
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={successRateSeries}>
              <defs>
                <linearGradient id="sr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--success)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--success)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis domain={[95, 100]} stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
              <Area type="monotone" dataKey="rate" stroke="var(--success)" strokeWidth={2} fill="url(#sr)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}