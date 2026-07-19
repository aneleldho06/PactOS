import { motion } from "motion/react";

/** Small elegant node used in the hero flow diagram */
function Node({ x, y, w = 148, h = 56, title, sub, delay = 0, accent = "var(--primary)" }: {
  x: number; y: number; w?: number; h?: number; title: string; sub?: string; delay?: number; accent?: string;
}) {
  return (
    <motion.g
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <rect x={x} y={y} width={w} height={h} rx={14}
        fill="var(--card)" stroke="var(--border)" strokeWidth={1}
        style={{ filter: "drop-shadow(0 6px 24px rgb(15 23 42 / 0.08))" }} />
      <circle cx={x + 16} cy={y + 16} r={5} fill={accent} />
      <text x={x + 28} y={y + 21} fontSize={12} fontWeight={600} fill="var(--foreground)">{title}</text>
      {sub && <text x={x + 16} y={y + 40} fontSize={10.5} fill="var(--muted-foreground)">{sub}</text>}
    </motion.g>
  );
}

function Line({ d, delay = 0 }: { d: string; delay?: number }) {
  return (
    <g>
      <motion.path
        d={d}
        fill="none"
        stroke="var(--border)"
        strokeWidth={1.25}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay, duration: 0.7 }}
      />
      <path d={d} fill="none" stroke="var(--primary)" strokeOpacity={0.55} strokeWidth={1.5}
        strokeDasharray="4 8" className="animate-flow-dash" />
    </g>
  );
}

export function MoneyFlowVisual() {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-hero-gradient blur-2xl opacity-70" />
      <div className="rounded-3xl border-[3px] border-foreground bg-card/60 p-6 shadow-elegant backdrop-blur">
        <svg viewBox="0 0 560 460" className="w-full h-[420px]">
          <defs>
            <linearGradient id="pulse" x1="0" x2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
              <stop offset="50%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

          <Node x={206} y={16}  title="Salary received"   sub="Payroll · $1,200"    delay={0.0} accent="var(--chart-1)" />
          <Node x={206} y={112} title="Convert USD → INR" sub="Stellar DEX"          delay={0.15} accent="var(--chart-2)" />
          <Node x={206} y={208} title="Split funds"       sub="4 recipients"         delay={0.3} accent="var(--chart-4)" />

          <Node x={16}  y={316} w={128} title="Parents"    sub="35%" delay={0.55} accent="var(--chart-1)" />
          <Node x={156} y={316} w={128} title="Education"  sub="25%" delay={0.62} accent="var(--chart-2)" />
          <Node x={296} y={316} w={128} title="Emergency"  sub="20%" delay={0.69} accent="var(--chart-3)" />
          <Node x={436} y={316} w={108} title="Savings"    sub="20%" delay={0.76} accent="var(--chart-4)" />

          <Node x={206} y={400} title="Completed" sub="Executed by Soroban" delay={1.0} accent="var(--success)" />

          <Line d="M 280 72 L 280 112" delay={0.2} />
          <Line d="M 280 168 L 280 208" delay={0.35} />
          <Line d="M 280 264 Q 280 300 80  316" delay={0.55} />
          <Line d="M 280 264 Q 280 300 220 316" delay={0.6} />
          <Line d="M 280 264 Q 280 300 360 316" delay={0.65} />
          <Line d="M 280 264 Q 280 300 490 316" delay={0.7} />
          <Line d="M 80  372 Q 280 400 280 400" delay={0.85} />
          <Line d="M 220 372 L 280 400" delay={0.9} />
          <Line d="M 360 372 L 280 400" delay={0.95} />
          <Line d="M 490 372 Q 280 400 280 400" delay={1.0} />

          {/* traveling particles */}
          {[0, 1, 2, 3].map((i) => (
            <motion.circle
              key={i}
              r={3.5}
              fill="var(--primary)"
              initial={{ cx: 280, cy: 72, opacity: 0 }}
              animate={{
                cx: [280, 280, 280, [80, 220, 360, 490][i], 280],
                cy: [72, 168, 264, 340, 400],
                opacity: [0, 1, 1, 1, 0],
              }}
              transition={{ duration: 3.2, delay: 1.6 + i * 0.12, repeat: Infinity, repeatDelay: 1.4, ease: "easeInOut" }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}