import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TemplateDef } from "@/lib/types";
import { useNavigate } from "@tanstack/react-router";
import { useBuilderStore } from "@/lib/stores";

export function TemplateCard({ t }: { t: TemplateDef }) {
  const navigate = useNavigate();
  const loadTemplate = useBuilderStore((s) => s.loadTemplate);
  const accent = t.accent || "var(--chart-1)";
  const emoji = t.emoji || "📜";
  const blocks = t.blocks || [];

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-elegant hover:shadow-glow"
    >
      <div
        className="relative h-32 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, color-mix(in oklab, ${accent} 22%, transparent), color-mix(in oklab, ${accent} 6%, transparent))`,
        }}
      >
        <div className="absolute right-4 top-4 rounded-full border bg-background/70 px-2.5 py-0.5 text-[11px] font-medium text-foreground backdrop-blur">
          {t.category}
        </div>
        <div className="absolute inset-0 grid place-items-center text-5xl">
          <motion.div
            initial={{ scale: 0.9, opacity: 0.85 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            {emoji}
          </motion.div>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="text-[15px] font-semibold">{t.name}</div>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.description}</p>
        <Button
          className="mt-5 self-start gap-1.5 rounded-full"
          size="sm"
          onClick={() => {
            loadTemplate(blocks, t.name);
            navigate({ to: "/builder" });
          }}
        >
          Use template <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}