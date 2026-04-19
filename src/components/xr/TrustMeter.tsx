interface TrustMeterProps {
  value: number; // 0-100
  label?: string;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

export default function TrustMeter({ value, label, size = "md", showValue = true }: TrustMeterProps) {
  const v = Math.max(0, Math.min(100, value));
  const tone =
    v >= 70 ? "from-success to-success/60"
    : v >= 45 ? "from-primary to-primary/60"
    : v >= 25 ? "from-warning to-warning/60"
    : "from-destructive to-destructive/60";

  const h = size === "sm" ? "h-1" : size === "lg" ? "h-2" : "h-1.5";

  return (
    <div className="w-full space-y-1">
      {(label || showValue) && (
        <div className="flex items-center justify-between text-[11px]">
          {label && <span className="text-muted-foreground uppercase tracking-wider">{label}</span>}
          {showValue && <span className="font-mono text-foreground tabular-nums">{v}</span>}
        </div>
      )}
      <div className={`w-full ${h} rounded-full bg-secondary overflow-hidden relative`}>
        <div
          className={`h-full bg-gradient-to-r ${tone} rounded-full transition-all duration-500`}
          style={{ width: `${v}%` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
    </div>
  );
}
