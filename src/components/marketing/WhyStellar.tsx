import { motion } from "motion/react";
import { Cpu, ArrowRightLeft, Anchor, Users } from "lucide-react";

const steps = [
  { icon: Cpu,            title: "Soroban",     body: "Deterministic smart contracts define every agreement's rules." },
  { icon: ArrowRightLeft, title: "Stellar DEX", body: "Best-rate conversion between currencies at settlement time." },
  { icon: Anchor,         title: "Anchors",     body: "On/off-ramp partners around the world for local delivery." },
  { icon: Users,          title: "Recipients",  body: "Funds arrive in each recipient's preferred currency." },
];

export function WhyStellar() {
  return (
    <div className="rounded-3xl border-[3px] border-foreground bg-card p-6 sm:p-10 shadow-elegant">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_1.4fr]">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-primary">Why Stellar</div>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl leading-tight">
            Built on the rails made for value in motion.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-md">
            Stellar's global settlement network and Soroban's smart contract layer let FlowLedger route money across borders, currencies, and rules — in seconds, at low cost.
          </p>
        </div>
        <div className="relative">
          <div className="grid gap-3 sm:grid-cols-2">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="relative overflow-hidden rounded-2xl border-[3px] border-foreground bg-background/60 p-5"
              >
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="h-4 w-4" />
                </div>
                <div className="mt-3 text-sm font-semibold">{s.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
                <div className="pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}