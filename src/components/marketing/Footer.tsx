import { Logo } from "@/components/brand/Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-card/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Programmable financial agreements — built on Stellar & Soroban.
            </p>
          </div>
          <FooterCol title="Product" items={["Dashboard", "Builder", "Templates", "Analytics"]} />
          <FooterCol title="Company" items={["About", "Careers", "Press", "Contact"]} />
          <FooterCol title="Legal" items={["Privacy", "Terms", "Security", "Compliance"]} />
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
          <div>© {new Date().getFullYear()} FlowLedger, Inc.</div>
          <div>Built for a world where money knows where to go.</div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-foreground">{title}</div>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.map((i) => (
          <li key={i} className="hover:text-foreground cursor-pointer transition">{i}</li>
        ))}
      </ul>
    </div>
  );
}