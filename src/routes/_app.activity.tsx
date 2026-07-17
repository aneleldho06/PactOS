import { createFileRoute } from "@tanstack/react-router";
import { ActivityCard } from "@/components/activity/ActivityCard";
import { mockActivity } from "@/lib/mock";

export const Route = createFileRoute("/_app/activity")({
  component: () => (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl sm:text-4xl">Activity</h1>
      <p className="mt-1 text-sm text-muted-foreground">Every execution, deposit, and payout across your agreements.</p>
      <div className="mt-8 space-y-2.5">
        {mockActivity.map((e) => <ActivityCard key={e.id} e={e} />)}
      </div>
    </div>
  ),
});