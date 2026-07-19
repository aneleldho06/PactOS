import { motion } from "motion/react";
import { ChevronDown, ChevronUp, Trash2, GripVertical } from "lucide-react";
import type { Block } from "@/lib/types";
import { BLOCK_META } from "@/lib/blocks-meta";

interface Props {
  block: Block;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  first?: boolean;
  last?: boolean;
}

export function BuilderBlock({ block, onRemove, onMoveUp, onMoveDown, first, last }: Props) {
  const meta = BLOCK_META[block.type];
  const parts = (block.config?.parts as { label: string; pct: number }[] | undefined) ?? undefined;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group relative w-full max-w-md rounded-2xl border-[3px] border-foreground bg-card p-4 shadow-elegant hover:shadow-glow"
    >
      <div className="flex items-start gap-3">
        <div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white"
          style={{ background: meta.color }}
          aria-hidden
        >
          <meta.icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {meta.label}
            </span>
          </div>
          <div className="mt-0.5 truncate text-sm font-semibold">{block.title}</div>
          {block.subtitle && (
            <div className="mt-0.5 truncate text-xs text-muted-foreground">{block.subtitle}</div>
          )}
          {parts && (
            <div className="mt-3 space-y-1.5">
              {parts.map((p) => (
                <div key={p.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-1.5 rounded-full bg-muted flex-1 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: meta.color }} />
                    </div>
                    <span className="text-xs text-muted-foreground truncate">{p.label}</span>
                  </div>
                  <span className="text-xs font-medium tabular-nums">{p.pct}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-col opacity-0 transition group-hover:opacity-100">
          <button onClick={onMoveUp} disabled={first} className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label="Move up"><ChevronUp className="h-3.5 w-3.5" /></button>
          <button onClick={onMoveDown} disabled={last} className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label="Move down"><ChevronDown className="h-3.5 w-3.5" /></button>
          <button onClick={onRemove} className="rounded p-1 text-muted-foreground hover:text-destructive" aria-label="Remove"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 transition group-hover:opacity-60">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </motion.div>
  );
}