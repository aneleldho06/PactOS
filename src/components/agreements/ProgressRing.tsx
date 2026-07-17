interface Props {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  color?: string; // css color
  trackColor?: string;
  label?: string;
}

export function ProgressRing({
  value, size = 56, stroke = 6, color = "var(--primary)", trackColor = "var(--muted)", label,
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const dash = (clamped / 100) * c;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          style={{ transition: "stroke-dasharray 700ms cubic-bezier(.2,.8,.2,1)" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-[11px] font-semibold tabular-nums">{Math.round(clamped)}%</div>
        {label && <div className="text-[9px] text-muted-foreground">{label}</div>}
      </div>
    </div>
  );
}