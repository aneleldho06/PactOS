import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import type { TemplateDef } from "@/lib/types";

export const Route = createFileRoute("/_app/templates")({
  component: TemplatesPage,
});

function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.templates.list<TemplateDef[]>();
        if (active) {
          setTemplates(res);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || "Failed to load templates.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchTemplates();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl sm:text-4xl">Templates</h1>
      <p className="mt-1 text-sm text-muted-foreground">Pre-built agreements for common financial flows.</p>

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
      ) : templates.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          No templates published yet.
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <TemplateCard key={t.id} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}