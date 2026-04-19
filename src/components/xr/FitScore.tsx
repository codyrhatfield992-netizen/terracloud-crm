interface Props {
  score: number; // 0-100
  label?: string;
  size?: "md" | "lg";
}

export default function FitScore({ score, label = "Fit Score", size = "md" }: Props) {
  const v = Math.max(0, Math.min(100, score));
  const radius = size === "lg" ? 52 : 38;
  const stroke = size === "lg" ? 6 : 5;
  const dim = (radius + stroke) * 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (v / 100) * circumference;

  const tone =
    v >= 75 ? "hsl(var(--success))"
    : v >= 50 ? "hsl(var(--primary))"
    : v >= 30 ? "hsl(var(--warning))"
    : "hsl(var(--destructive))";

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle
            cx={radius + stroke} cy={radius + stroke} r={radius}
            stroke="hsl(var(--border))" strokeWidth={stroke} fill="none"
          />
          <circle
            cx={radius + stroke} cy={radius + stroke} r={radius}
            stroke={tone} strokeWidth={stroke} fill="none" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease", filter: `drop-shadow(0 0 6px ${tone})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-mono font-semibold tabular-nums ${size === "lg" ? "text-2xl" : "text-base"} text-foreground`}>{v}</span>
          {size === "lg" && <span className="text-[9px] text-muted-foreground uppercase tracking-widest">/100</span>}
        </div>
      </div>
      {label && <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{label}</span>}
    </div>
  );
}
