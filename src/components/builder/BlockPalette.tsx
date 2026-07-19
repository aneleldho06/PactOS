import { BLOCK_META } from "@/lib/blocks-meta";
import type { BlockType } from "@/lib/types";

export function BlockPalette({ onAdd }: { onAdd: (type: BlockType) => void }) {
  return (
    <div className="rounded-2xl border-[3px] border-foreground bg-card p-4 shadow-elegant">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Blocks</div>
      <p className="mt-1 text-xs text-muted-foreground">Click to add to your flow.</p>
      <div className="mt-4 grid grid-cols-1 gap-2">
        {(Object.keys(BLOCK_META) as BlockType[]).map((t) => {
          const meta = BLOCK_META[t];
          return (
            <button
              key={t}
              onClick={() => onAdd(t)}
              className="group flex items-center gap-3 rounded-xl border-[3px] border-foreground bg-background/40 p-2.5 text-left transition hover:bg-background hover:shadow-elegant"
            >
              <div className="grid h-8 w-8 place-items-center rounded-lg text-white" style={{ background: meta.color }}>
                <meta.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-widest text-foreground">{meta.label}</div>
                <div className="truncate text-xs text-muted-foreground">{meta.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}