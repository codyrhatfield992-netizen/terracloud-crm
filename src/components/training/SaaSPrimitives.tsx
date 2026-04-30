import { ReactNode } from "react";
import { AlertTriangle, Loader2, ScanLine } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, Area } from "recharts";

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="relative overflow-hidden xr-panel-strong rounded-xl px-6 py-6 md:px-7 md:py-7">
      <div className="absolute inset-y-0 right-0 w-1/2 xr-grid-bg opacity-[0.07]" />
      <div className="relative flex items-start justify-between gap-5 flex-wrap">
        <div className="max-w-4xl">
          <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-primary mb-3 flex items-center gap-2">
            <ScanLine className="h-3.5 w-3.5" /> {eyebrow}
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold leading-[1.02] xr-gradient-text text-glow">{title}</h1>
          <p className="text-base text-muted-foreground mt-3 max-w-3xl">{description}</p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

export function MetricCard({ label, value, sub, tone = "default" }: { label: string; value: string | number; sub?: string; tone?: "default" | "success" | "warning" | "danger" | "ice" }) {
  const toneClass = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "danger" ? "text-destructive" : tone === "ice" ? "text-xr-cyan" : "text-foreground";
  return <div className="xr-panel rounded-xl p-5 xr-kpi xr-focus-card"><p className="relative text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</p><p className={`relative text-4xl font-mono font-semibold tabular-nums mt-3 ${toneClass}`}>{value}</p>{sub && <p className="relative text-sm text-muted-foreground mt-2 leading-snug">{sub}</p>}</div>;
}

export function ScoreRing({ value, label, size = "md" }: { value: number; label: string; size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "h-32 w-32" : size === "sm" ? "h-20 w-20" : "h-24 w-24";
  const bg = `conic-gradient(hsl(var(--primary)) ${Math.max(0, Math.min(value, 100))}%, hsl(var(--secondary)) 0)`;
  return <div className="flex flex-col items-center gap-2"><div className={`${dims} rounded-full p-1 shadow-glow`} style={{ background: bg }}><div className="h-full w-full rounded-full bg-background/90 flex items-center justify-center border border-white/10"><span className="font-mono text-2xl font-semibold tabular-nums text-foreground">{value}</span></div></div><p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground text-center">{label}</p></div>;
}

export function EnterpriseTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return <div className="xr-panel rounded-xl overflow-hidden"><table className="w-full"><thead><tr className="border-b border-border bg-background/35">{columns.map((c) => <th key={c} className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-5 py-4">{c}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i} className="border-b border-border/80 last:border-0 hover:bg-primary/5 transition-colors">{row.map((cell, j) => <td key={j} className="px-5 py-4 text-sm text-foreground align-top">{cell}</td>)}</tr>)}</tbody></table></div>;
}

export function TranscriptPane({ turns }: { turns: { id: string; speaker: string; timestamp: string; text: string }[] }) {
  return <div className="xr-panel-strong rounded-xl flex flex-col min-h-[600px] overflow-hidden"><div className="px-5 py-4 border-b border-border flex items-center justify-between bg-background/20"><h2 className="text-sm font-semibold">Live Transcript</h2><span className="text-[10px] font-mono uppercase tracking-widest text-success flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-success xr-live-dot" /> buyer model streaming</span></div><div className="flex-1 p-5 space-y-4 overflow-y-auto scrollbar-thin">{turns.map((turn) => <div key={turn.id} className={`flex ${turn.speaker === "learner" ? "justify-end" : "justify-start"}`}><div className={`max-w-[82%] rounded-xl border p-4 shadow-panel ${turn.speaker === "learner" ? "bg-primary text-primary-foreground border-primary/40" : "bg-card/88 text-foreground border-white/10"}`}><div className="flex items-center justify-between gap-4 mb-1.5"><span className="text-[10px] font-mono uppercase tracking-widest opacity-70">{turn.speaker}</span><span className="text-[10px] font-mono opacity-60">{turn.timestamp}</span></div><p className="text-sm leading-relaxed">{turn.text}</p></div></div>)}</div></div>;
}

export function TrendSparkline({ data }: { data: number[] }) {
  return <div className="h-11 w-32"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.map((score, i) => ({ i, score }))}><defs><linearGradient id="spark" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="hsl(var(--primary))" /><stop offset="100%" stopColor="hsl(var(--xr-amber))" /></linearGradient></defs><Area type="monotone" dataKey="score" stroke="none" fill="hsl(var(--primary) / 0.08)" /><Line type="monotone" dataKey="score" stroke="url(#spark)" strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer></div>;
}

export function LoadingState() { return <div className="xr-panel rounded-xl p-8 text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin text-primary" /> Syncing Terra Cloud XR operating data...</div>; }
export function ErrorState({ message = "Unable to load this workspace." }: { message?: string }) { return <div className="xr-panel rounded-xl p-8 text-sm text-destructive flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> {message}</div>; }
export function EmptyPanel({ title, description }: { title: string; description: string }) { return <div className="xr-panel rounded-xl p-8 text-center"><h3 className="text-sm font-semibold text-foreground">{title}</h3><p className="text-sm text-muted-foreground mt-1">{description}</p></div>; }
