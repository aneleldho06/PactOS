import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ActivityCard } from "@/components/activity/ActivityCard";
import { api } from "@/lib/api";
import { useSessionStore } from "@/lib/stores";
import { Button } from "@/components/ui/button";
import type { ActivityEvent } from "@/lib/types";

export const Route = createFileRoute("/_app/activity")({
  component: ActivityPage,
});

function ActivityPage() {
  const walletAddress = useSessionStore((s) => s.walletAddress);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);

  const fetchEvents = async (cursor?: string) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const res = await api.activity.list<{ data: ActivityEvent[]; nextCursor?: string }>({
        cursor,
        walletAddress: walletAddress || undefined,
      });

      setEvents((prev) => (cursor ? [...prev, ...res.data] : res.data));
      setNextCursor(res.nextCursor);
    } catch (err: any) {
      setError(err.message || "Failed to load activity logs.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [walletAddress]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl sm:text-4xl">Activity</h1>
      <p className="mt-1 text-sm text-muted-foreground">Every execution, deposit, and payout across your agreements.</p>

      {loading ? (
        <div className="mt-12 flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="mt-12 rounded-2xl bg-destructive/10 p-6 text-center text-destructive">
          <p>{error}</p>
          <Button onClick={() => fetchEvents()} variant="outline" className="mt-4">
            Retry
          </Button>
        </div>
      ) : events.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          No activity recorded yet. Activity will appear once blockchain transactions are executed.
        </div>
      ) : (
        <div className="mt-8 space-y-2.5">
          {events.map((e) => (
            <ActivityCard key={e.id} e={e} />
          ))}

          {nextCursor && (
            <div className="mt-6 flex justify-center">
              <Button
                onClick={() => fetchEvents(nextCursor)}
                disabled={loadingMore}
                variant="outline"
                className="rounded-full px-6"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}