import { createFileRoute } from "@tanstack/react-router";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { mockTemplates } from "@/lib/mock";

export const Route = createFileRoute("/_app/templates")({
  component: TemplatesPage,
});

function TemplatesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl sm:text-4xl">Templates</h1>
      <p className="mt-1 text-sm text-muted-foreground">Pre-built agreements for common financial flows.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {mockTemplates.map((t) => <TemplateCard key={t.id} t={t} />)}
      </div>
    </div>
  );
}