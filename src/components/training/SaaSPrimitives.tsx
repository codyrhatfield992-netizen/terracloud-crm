import { ReactNode } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { ResponsiveContainer, LineChart, Line } from "recharts";

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="flex items-start justify-between gap-4 flex-wrap"><div><p className="text-[10px] font-mono uppercase tracking-[0.24em] text-primary mb-2">{eyebrow}</p><h1 className="text-3xl font-semibold tracking-tight xr-silver-text">{title}</h1><p className="text-sm text-muted-foreground mt-2 max-w-2xl">{description}</p></div>{action}</div>;
}

export function MetricCard({ label, value, sub, tone = "default" }: { label: string; value: string | number; sub?: string; tone?: "default" | "success" | "warning" | "danger" | "ice" }) {
  const toneClass = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "danger" ? "text-destructive" : tone === "ice" ? "text-xr-cyan" : "text-foreground";
  return <div className="xr-glass rounded-xl p-5"><p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</p><p className={`text-3xl font-mono font-semibold tabular-nums mt-2 ${toneClass}`}>{value}</p>{sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}</div>;
}

export function ScoreRing({ value, label, size = "md" }: { value: number; label: string; size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "h-32 w-32" : size === "sm" ? "h-20 w-20" : "h-24 w-24";
  const bg = `conic-gradient(hsl(var(--primary)) ${Math.max(0, Math.min(value, 100))}%, hsl(var(--secondary)) 0)`;
  return <div className="flex flex-col items-center gap-2"><div className={`${dims} rounded-full p-1 shadow-glow`} style={{ background: bg }}><div className="h-full w-full rounded-full bg-card flex items-center justify-center"><span className="font-mono text-2xl font-semibold tabular-nums text-foreground">{value}</span></div></div><p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground text-center">{label}</p></div>;
}

export function EnterpriseTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return <div className="xr-glass rounded-xl overflow-hidden"><table className="w-full"><thead><tr className="border-b border-border bg-secondary/40">{columns.map((c) => <th key={c} className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-4 py-3">{c}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i} className="border-b border-border last:border-0 hover:bg-accent/40 transition-colors">{row.map((cell, j) => <td key={j} className="px-4 py-3 text-sm text-foreground align-top">{cell}</td>)}</tr>)}</tbody></table></div>;
}

export function TranscriptPane({ turns }: { turns: { id: string; speaker: string; timestamp: string; text: string }[] }) {
  return <div className="xr-glass-strong rounded-xl flex flex-col min-h-[520px] overflow-hidden"><div className="px-5 py-4 border-b border-border flex items-center justify-between"><h2 className="text-sm font-semibold">Live Transcript</h2><span className="text-[10px] font-mono uppercase tracking-widest text-success flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-success xr-live-dot" /> streaming-ready</span></div><div className="flex-1 p-5 space-y-4 overflow-y-auto scrollbar-thin">{turns.map((turn) => <div key={turn.id} className={`flex ${turn.speaker === "learner" ? "justify-end" : "justify-start"}`}><div className={`max-w-[78%] rounded-xl border border-border p-3 ${turn.speaker === "learner" ? "bg-primary text-primary-foreground" : "bg-card text-foreground"}`}><div className="flex items-center justify-between gap-4 mb-1"><span className="text-[10px] font-mono uppercase tracking-widest opacity-70">{turn.speaker}</span><span className="text-[10px] font-mono opacity-60">{turn.timestamp}</span></div><p className="text-sm leading-relaxed">{turn.text}</p></div></div>)}</div></div>;
}

export function TrendSparkline({ data }: { data: number[] }) {
  return <div className="h-10 w-28"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.map((score, i) => ({ i, score }))}><Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div>;
}

export function LoadingState() { return <div className="xr-glass rounded-xl p-8 text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading operating data…</div>; }
export function ErrorState({ message = "Unable to load this workspace." }: { message?: string }) { return <div className="xr-glass rounded-xl p-8 text-sm text-destructive flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> {message}</div>; }
export function EmptyPanel({ title, description }: { title: string; description: string }) { return <div className="xr-glass rounded-xl p-8 text-center"><h3 className="text-sm font-semibold text-foreground">{title}</h3><p className="text-sm text-muted-foreground mt-1">{description}</p></div>; }
