import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X } from "lucide-react";

const NODES = [
  { id: "salary",    label: "Salary",           x: 300, y: 40  },
  { id: "activate",  label: "Agreement Active", x: 300, y: 120 },
  { id: "usd",       label: "USD",              x: 160, y: 220 },
  { id: "dex",       label: "Stellar DEX",      x: 300, y: 220 },
  { id: "inr",       label: "INR",              x: 440, y: 220 },
  { id: "split",     label: "Split funds",      x: 300, y: 320 },
  { id: "parents",   label: "Parents",          x: 60,  y: 430 },
  { id: "edu",       label: "Education",        x: 220, y: 430 },
  { id: "emerg",     label: "Emergency",        x: 380, y: 430 },
  { id: "savings",   label: "Savings",          x: 540, y: 430 },
];

const EDGES: [string, string][] = [
  ["salary", "activate"],
  ["activate", "usd"], ["activate", "dex"], ["activate", "inr"],
  ["usd", "dex"], ["dex", "inr"],
  ["dex", "split"],
  ["split", "parents"], ["split", "edu"], ["split", "emerg"], ["split", "savings"],
];

const SEQUENCE = ["salary", "activate", "usd", "dex", "inr", "split", "parents", "edu", "emerg", "savings"];

function nodeById(id: string) { return NODES.find((n) => n.id === id)!; }

export function ExecutionModal({
  open, onOpenChange,
}: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!open) { setStep(0); return; }
    setStep(0);
    const t = setInterval(() => setStep((s) => Math.min(s + 1, SEQUENCE.length + 1)), 380);
    return () => clearInterval(t);
  }, [open]);

  const done = step > SEQUENCE.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl border-0 bg-transparent p-0 shadow-none [&>button:last-child]:hidden"
      >
        <DialogTitle className="sr-only">Executing agreement</DialogTitle>
        <div className="relative overflow-hidden rounded-3xl border-[3px] border-foreground bg-card shadow-elegant">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-background/70 text-muted-foreground backdrop-blur hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative bg-hero-gradient p-6 sm:p-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium uppercase tracking-widest text-primary">Executing</div>
                <div className="mt-1 font-display text-2xl sm:text-3xl">Family Agreement</div>
              </div>
              <div className="text-xs text-muted-foreground">Powered by Soroban</div>
            </div>

            <div className="mt-6 rounded-2xl border-[3px] border-foreground bg-background/40 p-4 backdrop-blur">
              <svg viewBox="0 0 600 480" className="w-full h-[380px] sm:h-[440px]">
                {EDGES.map(([a, b], i) => {
                  const A = nodeById(a); const B = nodeById(b);
                  const idxA = SEQUENCE.indexOf(a); const idxB = SEQUENCE.indexOf(b);
                  const active = step > Math.max(idxA, idxB);
                  return (
                    <g key={i}>
                      <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="var(--border)" strokeWidth={1.25} />
                      {active && (
                        <motion.line
                          x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                          stroke="var(--primary)" strokeWidth={2}
                          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4 }}
                        />
                      )}
                    </g>
                  );
                })}
                {NODES.map((n) => {
                  const idx = SEQUENCE.indexOf(n.id);
                  const lit = step > idx;
                  return (
                    <g key={n.id}>
                      <motion.circle
                        cx={n.x} cy={n.y} r={lit ? 22 : 18}
                        fill={lit ? "var(--primary)" : "var(--card)"}
                        stroke={lit ? "var(--primary)" : "var(--border)"}
                        strokeWidth={1.5}
                        style={{ filter: lit ? "drop-shadow(0 0 16px rgb(14 165 233 / 0.55))" : undefined }}
                        animate={{ scale: lit ? [1, 1.15, 1] : 1 }}
                        transition={{ duration: 0.4 }}
                      />
                      {lit && (
                        <path d={`M ${n.x - 5} ${n.y} l 4 4 l 8 -8`} stroke="var(--primary-foreground)" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      )}
                      <text x={n.x} y={n.y + 40} textAnchor="middle" fontSize={11} fill="var(--foreground)" fontWeight={600}>
                        {n.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <AnimatePresence>
              {done && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 grid gap-4 rounded-2xl border-[3px] border-foreground bg-background/70 p-5 backdrop-blur sm:grid-cols-[auto_1fr_auto]"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-base font-semibold">Completed Successfully</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Executed by Soroban · 2.3s · 4 Recipients · 3 Currency Conversions · 1 Agreement
                    </div>
                  </div>
                  <Button onClick={() => onOpenChange(false)} className="self-center">Done</Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}