import { cn } from "@/lib/utils";

export function Logo({ className, showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 7h10" />
          <path d="M4 12h16" />
          <path d="M4 17h10" />
          <circle cx="19" cy="7" r="2" fill="currentColor" />
          <circle cx="19" cy="17" r="2" fill="currentColor" />
        </svg>
      </div>
      {showWordmark && (
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          PactOS
        </span>
      )}
    </div>
  );
}