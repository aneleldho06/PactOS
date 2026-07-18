import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Plus, Wallet, Activity, TrendingUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/agreements/StatCard";
import { AgreementCard } from "@/components/agreements/AgreementCard";
import { ActivityCard } from "@/components/activity/ActivityCard";
import { useSessionStore } from "@/lib/stores";
import { api } from "@/lib/api";
import type { Agreement, ActivityEvent } from "@/lib/types";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

interface DashboardData {
  activeAgreements: { value: string; delta: string };
  volume30d: { value: string; delta: string };
  totalRecipients: { value: string; delta: string };
  executionSuccess: { value: string; delta: string };
  spark: { v: number }[];
  recentAgreements: Agreement[];
  recentActivity: ActivityEvent[];
}

function DashboardPage() {
  const walletAddress = useSessionStore((state) => state.walletAddress);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.dashboard.get<DashboardData>({
          walletAddress: walletAddress || undefined,
        });
        if (active) {
          setData(res);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || "Failed to load dashboard statistics.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();
    return () => {
      active = false;
    };
  }, [walletAddress]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 animate-pulse">
        <div className="h-10 w-48 rounded bg-muted"></div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted"></div>
          ))}
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="h-8 w-32 rounded bg-muted"></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-44 rounded-2xl bg-muted"></div>
              <div className="h-44 rounded-2xl bg-muted"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-8 w-32 rounded bg-muted"></div>
            <div className="space-y-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl bg-muted"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl text-destructive">Failed to load dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-6">
          Retry
        </Button>
      </div>
    );
  }

  const d = data!;
  const displayName = walletAddress
    ? walletAddress.substring(0, 6) + "..." + walletAddress.substring(walletAddress.length - 4)
    : "Guest";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Welcome back</div>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl">Hey, {displayName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's what your money is doing today.</p>
        </div>
        <Button asChild size="lg" className="rounded-full">
          <Link to="/builder"><Plus className="h-4 w-4" />Create Agreement</Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Agreements" value={d.activeAgreements.value} delta={d.activeAgreements.delta} icon={Activity} spark={d.spark} />
        <StatCard label="Volume (30d)" value={d.volume30d.value} delta={d.volume30d.delta} icon={TrendingUp} spark={d.spark} />
        <StatCard label="Total Recipients" value={d.totalRecipients.value} delta={d.totalRecipients.delta} icon={Wallet} spark={d.spark} />
        <StatCard label="Execution success" value={d.executionSuccess.value} delta={d.executionSuccess.delta} icon={CheckCircle2} spark={d.spark} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-2xl">Your agreements</h2>
            <Link to="/agreements" className="text-sm text-muted-foreground hover:text-foreground">View all →</Link>
          </div>
          {d.recentAgreements.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
              No agreements created yet.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {d.recentAgreements.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <AgreementCard a={a} />
                </motion.div>
              ))}
            </div>
          )}
        </section>
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-2xl">Live activity</h2>
            <Link to="/activity" className="text-sm text-muted-foreground hover:text-foreground">All →</Link>
          </div>
          <div className="space-y-2.5">
            {d.recentActivity.length === 0 ? (
              <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
                No recent activity.
              </div>
            ) : (
              d.recentActivity.map((e) => <ActivityCard key={e.id} e={e} />)
            )}
          </div>
        </section>
      </div>
    </div>
  );
}