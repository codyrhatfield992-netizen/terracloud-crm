import { Activity, Target, Eye, Gauge } from "lucide-react";

interface Props {
  walkthroughCoverage: number;
  trust: number;
  objectionsHit: number;
  objectionsHandled: number;
  duration: string;
  mode: "vr" | "desktop";
}

export default function HUDOverlay({ walkthroughCoverage, trust, objectionsHit, objectionsHandled, duration, mode }: Props) {
  return (
    <>
      {/* Top-left: status */}
      <div className="absolute top-4 left-4 xr-glass-strong rounded-md px-3 py-2 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-success xr-live-dot" />
        <span className="text-[11px] font-mono uppercase tracking-widest text-foreground">Live · {mode.toUpperCase()}</span>
        <span className="text-[11px] font-mono text-muted-foreground ml-2">{duration}</span>
      </div>

      {/* Top-right: trust + walkthrough */}
      <div className="absolute top-4 right-4 xr-glass-strong rounded-md p-3 space-y-2 min-w-[200px]">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="flex items-center gap-1.5"><Gauge className="h-3 w-3" /> Trust</span>
          <span className="font-mono text-foreground tabular-nums">{trust}</span>
        </div>
        <div className="h-1 rounded-full bg-secondary overflow-hidden">
          <div className="h-full bg-gradient-to-r from-success to-success/60 transition-all" style={{ width: `${trust}%` }} />
        </div>
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground pt-1">
          <span className="flex items-center gap-1.5"><Eye className="h-3 w-3" /> Walkthrough</span>
          <span className="font-mono text-foreground tabular-nums">{walkthroughCoverage}%</span>
        </div>
        <div className="h-1 rounded-full bg-secondary overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all" style={{ width: `${walkthroughCoverage}%` }} />
        </div>
      </div>

      {/* Bottom-left: objections counter */}
      <div className="absolute bottom-4 left-4 xr-glass-strong rounded-md px-3 py-2 flex items-center gap-3">
        <Target className="h-4 w-4 text-xr-amber" />
        <div>
          <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Objections</div>
          <div className="text-sm font-mono text-foreground tabular-nums">
            <span className="text-success">{objectionsHandled}</span>
            <span className="text-muted-foreground"> / </span>
            <span>{objectionsHit}</span>
          </div>
        </div>
      </div>

      {/* Bottom-right: input hint */}
      <div className="absolute bottom-4 right-4 xr-glass rounded-md px-3 py-1.5 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <Activity className="h-3 w-3" />
        {mode === "vr" ? "Hand-track · Voice" : "WASD · Eye-focus"}
      </div>
    </>
  );
}
