import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Play, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MoneyFlowVisual } from "@/components/marketing/MoneyFlowVisual";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { WhyStellar } from "@/components/marketing/WhyStellar";
import { Footer } from "@/components/marketing/Footer";
import { ExecutionModal } from "@/components/execution/ExecutionModal";
import { useApplyTheme } from "@/lib/stores";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  useApplyTheme();
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-hero-gradient" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 pt-16 pb-24 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:pt-24">
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="inline-flex w-fit items-center gap-2 rounded-full border-[3px] border-foreground bg-card/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Programmable finance, powered by Stellar
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.5 }}
              className="mt-5 font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
            >
              Money should come <br className="hidden sm:block" />
              with <em className="not-italic text-primary">instructions.</em>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.5 }}
              className="mt-5 max-w-xl text-lg text-muted-foreground"
            >
              Create programmable financial agreements that automatically execute on Stellar — across currencies, borders, and recipients.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Button asChild size="lg" className="rounded-full">
                <Link to="/builder">Create Agreement <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full" onClick={() => setDemoOpen(true)}>
                <Play className="h-4 w-4" /> Watch Demo
              </Button>
            </motion.div>
            <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" />SOC 2 ready</div>
              <div>SEC-registered custody partners</div>
              <div className="hidden sm:block">99.98% execution success</div>
            </div>
          </div>
          <div className="relative">
            <MoneyFlowVisual />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-primary">Building blocks</div>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl">Everything a modern agreement needs.</h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Compose triggers, conditions, conversions and payouts. Ship in minutes — settle in seconds.
          </p>
        </div>
        <FeatureGrid />
      </section>

      {/* Why Stellar */}
      <section id="why" className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <WhyStellar />
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl border bg-foreground p-10 text-background shadow-elegant sm:p-14">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/40 blur-3xl" />
          <div className="relative grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div>
              <h3 className="font-display text-3xl sm:text-4xl">Design money that runs itself.</h3>
              <p className="mt-2 max-w-xl text-sm text-background/70">
                Ship your first programmable agreement in under three minutes. No wallet setup, no glue code.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild size="lg" className="rounded-full bg-background text-foreground hover:bg-background/90">
                <Link to="/builder">Start Building</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-background/20 bg-transparent text-background hover:bg-background/10">
                <Link to="/dashboard">Open Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <ExecutionModal open={demoOpen} onOpenChange={setDemoOpen} />
    </div>
  );
}
