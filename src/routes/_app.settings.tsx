import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/settings")({
  component: () => (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl sm:text-4xl">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Workspace, wallets, and notification preferences.</p>
      <div className="mt-8 rounded-2xl border bg-card p-8 shadow-elegant text-sm text-muted-foreground">
        Settings coming soon.
      </div>
    </div>
  ),
});