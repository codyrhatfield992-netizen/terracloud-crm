import { Link } from "react-router-dom";
import { Activity, Play, Sparkles } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { SIMULATIONS, statusColor, outcomeColor } from "@/data/simulations";
import XRModeBadge from "@/components/xr/XRModeBadge";
import { timeAgo } from "@/lib/constants";

export default function Simulations() {
  const live = SIMULATIONS.filter(s => s.status === "live");
  const scheduled = SIMULATIONS.filter(s => s.status === "scheduled");
  const recent = SIMULATIONS.filter(s => s.status === "completed" || s.status === "failed");

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1400px]">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-primary mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              Simulation Engine
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Simulations</h1>
            <p className="text-sm text-muted-foreground mt-1">{SIMULATIONS.length} runs · {live.length} live · {scheduled.length} scheduled</p>
          </div>
          <Link to="/command-center" className="h-9 px-4 inline-flex items-center gap-2 rounded-md bg-gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 shadow-glow">
            <Play className="h-4 w-4" /> New Simulation
          </Link>
        </div>

        {live.length > 0 && (
          <Section title="Live Now" tone="success" count={live.length}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {live.map(s => <SimCard key={s.id} sim={s} />)}
            </div>
          </Section>
        )}

        {scheduled.length > 0 && (
          <Section title="Scheduled" tone="cyan" count={scheduled.length}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scheduled.map(s => <SimCard key={s.id} sim={s} />)}
            </div>
          </Section>
        )}

        <Section title="Recent Runs" tone="muted" count={recent.length}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.map(s => <SimCard key={s.id} sim={s} />)}
          </div>
        </Section>
      </div>
    </AppLayout>
  );
}

function Section({ title, tone, count, children }: { title: string; tone: "success" | "cyan" | "muted"; count: number; children: React.ReactNode }) {
  const dotCls = tone === "success" ? "bg-success xr-live-dot" : tone === "cyan" ? "bg-xr-cyan" : "bg-muted-foreground";
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2.5">
        <span className={`h-2 w-2 rounded-full ${dotCls}`} />
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <span className="text-xs font-mono text-muted-foreground tabular-nums">{count}</span>
      </div>
      {children}
    </section>
  );
}

function SimCard({ sim }: { sim: typeof SIMULATIONS[number] }) {
  return (
    <Link to={`/simulations/${sim.id}`} className="xr-glass rounded-xl p-4 hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 block group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition truncate">{sim.scenarioName}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{sim.clientName} · {sim.clientArchetype}</p>
        </div>
        <XRModeBadge mode={sim.mode} size="xs" />
      </div>

      <div className="text-xs text-muted-foreground mb-3 truncate">{sim.propertyAddress}</div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <Stat label="Score" value={sim.status === "scheduled" ? "—" : String(sim.score)} tone={sim.score >= 75 ? "success" : sim.score >= 50 ? "primary" : "destructive"} />
        <Stat label="Trust" value={sim.status === "scheduled" ? "—" : String(sim.trustEnd)} tone="primary" />
        <Stat label="Walk %" value={sim.status === "scheduled" ? "—" : `${sim.walkthroughCoverage}`} tone="cyan" />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest border rounded px-1.5 py-0.5 ${statusColor(sim.status)}`}>
          {sim.status === "live" && <span className="h-1.5 w-1.5 rounded-full bg-current xr-live-dot" />}
          {sim.status}
        </span>
        <span className={`text-[10px] font-mono uppercase tracking-widest ${outcomeColor(sim.outcome)}`}>{sim.outcome.replace("_", " ")}</span>
        <span className="text-[10px] font-mono text-muted-foreground">{sim.status === "scheduled" ? "in 4h" : timeAgo(sim.ranAt)}</span>
      </div>
    </Link>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "success" | "primary" | "cyan" | "destructive" }) {
  const cls = tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : tone === "cyan" ? "text-xr-cyan" : "text-primary";
  return (
    <div className="text-center xr-glass rounded p-2">
      <p className={`text-base font-mono font-semibold tabular-nums ${cls}`}>{value}</p>
      <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{label}</p>
    </div>
  );
}
