import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { StatusPill } from "@/components/agreements/StatusPill";
import { ProgressRing } from "@/components/agreements/ProgressRing";
import { Timeline } from "@/components/agreements/Timeline";
import { RecipientAvatars } from "@/components/agreements/RecipientAvatars";
import { ActivityCard } from "@/components/activity/ActivityCard";
import { ExecutionModal } from "@/components/execution/ExecutionModal";
import { money } from "@/lib/format";
import type { Agreement, Block, ActivityEvent } from "@/lib/types";

export const Route = createFileRoute("/_app/agreements/$id")({
  loader: async ({ params }) => {
    try {
      return await api.agreements.get<Agreement>(params.id);
    } catch {
      throw notFound();
    }
  },
  component: AgreementDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="font-display text-3xl">Agreement not found</h1>
      <Link to="/agreements" className="mt-4 inline-block text-primary">Back to agreements</Link>
    </div>
  ),
});

function AgreementDetail() {
  const a = Route.useLoaderData() as Agreement;
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchEvents = async () => {
      try {
        setEventsLoading(true);
        const res = await api.activity.list<{ data: ActivityEvent[] }>({ agreementId: a.id });
        if (active) {
          setEvents(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch events for agreement:", err);
      } finally {
        if (active) {
          setEventsLoading(false);
        }
      }
    };
    fetchEvents();
    return () => {
      active = false;
    };
  }, [a.id]);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link to="/agreements" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Agreements
      </Link>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-muted text-2xl">{a.emoji}</div>
          <div className="min-w-0">
            <h1 className="truncate font-display text-3xl">{a.name}</h1>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <StatusPill status={a.status} /> · {a.cadence} · {a.recipients.length} recipients
            </div>
          </div>
        </div>
        <Button onClick={() => setOpen(true)} className="rounded-full"><Play className="h-4 w-4" />Run now</Button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border-[3px] border-foreground bg-card p-6 shadow-elegant">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Flow</div>
          <Timeline items={a.blocks.map((bl: Block, i: number) => ({
            id: bl.id,
            title: bl.title,
            subtitle: bl.subtitle,
            status: (i < a.blocks.length - 1 ? "done" : "current") as "done" | "current",
          }))} />
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border-[3px] border-foreground bg-card p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Budget</div>
                <div className="mt-1 font-display text-3xl tabular-nums">
                  {a.monthlyBudget ? money(a.monthlyBudget, a.currency) : "—"}
                </div>
              </div>
              <ProgressRing value={a.progress ?? 0} />
            </div>
            <div className="mt-6">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Recipients</div>
              <div className="mt-3 flex items-center gap-3">
                <RecipientAvatars recipients={a.recipients} />
                <span className="text-xs text-muted-foreground">{a.recipients.length} people</span>
              </div>
            </div>
          </div>
          <div>
            <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Recent activity</div>
            <div className="space-y-2.5">
              {eventsLoading ? (
                <div className="rounded-2xl border-[3px] border-foreground bg-card p-6 text-center text-sm text-muted-foreground animate-pulse">
                  Loading activity...
                </div>
              ) : events.length ? (
                events.map((e) => <ActivityCard key={e.id} e={e} />)
              ) : (
                <div className="rounded-2xl border-[3px] border-foreground bg-card p-6 text-sm text-muted-foreground">No activity yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ExecutionModal open={open} onOpenChange={setOpen} />
    </div>
  );
}