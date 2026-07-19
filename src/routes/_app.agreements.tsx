import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AgreementCard } from "@/components/agreements/AgreementCard";
import { api } from "@/lib/api";
import { useSessionStore } from "@/lib/stores";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Agreement } from "@/lib/types";

export const Route = createFileRoute("/_app/agreements")({
  component: AgreementsPage,
});

function AgreementsPage() {
  const walletAddress = useSessionStore((s) => s.walletAddress);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchAgreements = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.agreements.list<{ data: Agreement[] }>();
        if (active) {
          setAgreements(res.data);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || "Failed to load agreements.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchAgreements();
    return () => {
      active = false;
    };
  }, [walletAddress]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Agreements</h1>
          <p className="mt-1 text-sm text-muted-foreground">All programmable financial contracts in your workspace.</p>
        </div>
        <Button asChild className="rounded-full self-start sm:self-center">
          <Link to="/builder"><Plus className="mr-2 h-4 w-4" />Create Agreement</Link>
        </Button>
      </div>

      {loading ? (
        <div className="mt-12 flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="mt-12 rounded-2xl bg-destructive/10 p-6 text-center text-destructive">
          <p>{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
            Retry
          </Button>
        </div>
      ) : agreements.length === 0 ? (
        <div className="mt-12 rounded-2xl border-[3px] border-dashed border-foreground p-12 text-center">
          <h3 className="text-lg font-medium text-foreground">No agreements found</h3>
          <p className="mt-2 text-sm text-muted-foreground">Get started by building and deploying your first smart agreement.</p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/builder"><Plus className="mr-2 h-4 w-4" />Create Agreement</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agreements.map((a) => (
            <AgreementCard key={a.id} a={a} />
          ))}
        </div>
      )}
    </div>
  );
}