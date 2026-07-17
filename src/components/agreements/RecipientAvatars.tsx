import type { Recipient } from "@/lib/types";

export function RecipientAvatars({ recipients, max = 4 }: { recipients: Recipient[]; max?: number }) {
  const shown = recipients.slice(0, max);
  const extra = recipients.length - shown.length;
  return (
    <div className="flex -space-x-2">
      {shown.map((r) => (
        <div
          key={r.id}
          className="grid h-7 w-7 place-items-center rounded-full ring-2 ring-card text-[10px] font-semibold text-white"
          style={{ background: r.avatarColor }}
          title={r.name}
        >
          {r.name.slice(0, 1)}
        </div>
      ))}
      {extra > 0 && (
        <div className="grid h-7 w-7 place-items-center rounded-full bg-muted ring-2 ring-card text-[10px] font-medium text-foreground">
          +{extra}
        </div>
      )}
    </div>
  );
}