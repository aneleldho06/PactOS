import {
  Cog, Coins, Split, Lock, GitBranch, Repeat, Sparkles, Globe2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

const features: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: Cog,      title: "Programmable Agreements",  body: "Compose money rules from primitive blocks — no code required." },
  { icon: Coins,    title: "Multi-currency Settlement", body: "Route funds across USD, INR, EUR, USDC — settled on Stellar." },
  { icon: Split,    title: "Automatic Distribution",    body: "Split incoming funds to any number of recipients, by %, fixed, or rule." },
  { icon: Lock,     title: "Escrow",                    body: "Lock funds until conditions or approvals are met — with full audit." },
  { icon: GitBranch,title: "Conditional Payments",      body: "Branch on approvals, deadlines, and external triggers." },
  { icon: Repeat,   title: "Recurring Execution",       body: "Payroll, allowances, subscriptions — run on any cadence." },
  { icon: Sparkles, title: "Powered by Soroban",        body: "Deterministic execution on Stellar's smart contract layer." },
  { icon: Globe2,   title: "Cross-border Ready",        body: "Connect anchors and off-ramp locally around the world." },
];

export function FeatureGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {features.map((f, i) => (
        <motion.div
          key={f.title}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: (i % 4) * 0.05, duration: 0.35 }}
          whileHover={{ y: -3 }}
          className="group rounded-2xl border-[3px] border-foreground bg-card p-5 shadow-elegant hover:shadow-glow"
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-muted text-muted-foreground transition group-hover:bg-primary/10 group-hover:text-primary">
            <f.icon className="h-4 w-4" />
          </div>
          <div className="mt-4 text-sm font-semibold">{f.title}</div>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
        </motion.div>
      ))}
    </div>
  );
}