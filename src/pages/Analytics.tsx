import AppLayout from "@/components/AppLayout";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, LineChart, Line } from "recharts";
import { Brain, TrendingUp } from "lucide-react";
import { SIMULATIONS, AUTOPSIES } from "@/data/simulations";
import TrustMeter from "@/components/xr/TrustMeter";

export default function Analytics() {
  // Archetype performance
  const archetypeStats = SIMULATIONS.reduce<Record<string, { runs: number; totalScore: number; closes: number }>>((acc, s) => {
    if (!acc[s.clientArchetype]) acc[s.clientArchetype] = { runs: 0, totalScore: 0, closes: 0 };
    acc[s.clientArchetype].runs += 1;
    acc[s.clientArchetype].totalScore += s.score;
    if (s.outcome === "closed") acc[s.clientArchetype].closes += 1;
    return acc;
  }, {});

  const archetypeData = Object.entries(archetypeStats).map(([name, v]) => ({
    name,
    avgScore: Math.round(v.totalScore / v.runs),
    closeRate: Math.round((v.closes / v.runs) * 100),
    runs: v.runs,
  }));

  const objectionStats: Record<string, number> = {};
  AUTOPSIES.forEach(a => a.missedObjections.forEach(o => { objectionStats[o] = (objectionStats[o] ?? 0) + 1; }));
  const objectionData = Object.entries(objectionStats).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);

  const runsOverTime = SIMULATIONS
    .filter(s => s.status === "completed" || s.status === "failed")
    .sort((a, b) => new Date(a.ranAt).getTime() - new Date(b.ranAt).getTime())
    .map((s, i) => ({ run: `R${i + 1}`, score: s.score }));

  const avgScore = Math.round(SIMULATIONS.filter(s => s.score > 0).reduce((sum, s) => sum + s.score, 0) / SIMULATIONS.filter(s => s.score > 0).length);
  const closeRate = Math.round((SIMULATIONS.filter(s => s.outcome === "closed").length / SIMULATIONS.filter(s => s.status === "completed").length) * 100);
  const avgTrust = Math.round(SIMULATIONS.filter(s => s.trustEnd > 0).reduce((sum, s) => sum + s.trustEnd, 0) / SIMULATIONS.filter(s => s.trustEnd > 0).length);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1400px]">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-primary mb-2">
            <TrendingUp className="h-3.5 w-3.5" /> Performance Intelligence
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Archetype performance, trust patterns, and objection intelligence.</p>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Kpi label="Total Simulations" value={SIMULATIONS.length} />
          <Kpi label="Avg Score" value={avgScore} suffix="/100" tone="primary" />
          <Kpi label="Close Rate" value={closeRate} suffix="%" tone="success" />
          <Kpi label="Avg Trust End" value={avgTrust} suffix="/100" tone="cyan" />
        </div>

        {/* Archetype performance */}
        <div className="xr-glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Archetype Performance</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Average simulation score by buyer archetype</p>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={archetypeData}>
                <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} angle={-15} textAnchor="end" height={60} />
                <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }} />
                <Bar dataKey="avgScore" radius={[3, 3, 0, 0]}>
                  {archetypeData.map((d, i) => (
                    <Cell key={i} fill={d.avgScore >= 75 ? "hsl(var(--success))" : d.avgScore >= 50 ? "hsl(var(--primary))" : "hsl(var(--destructive))"} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Trust trajectory */}
          <div className="xr-glass rounded-xl p-6">
            <h2 className="text-sm font-semibold mb-4">Score Trajectory</h2>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={runsOverTime}>
                  <XAxis dataKey="run" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }} />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Objection categories */}
          <div className="xr-glass rounded-xl p-6">
            <h2 className="text-sm font-semibold mb-4">Top Missed Objections</h2>
            <div className="space-y-3">
              {objectionData.length === 0 ? (
                <p className="text-xs text-muted-foreground">No missed objections logged.</p>
              ) : objectionData.map((o, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-foreground">{o.name}</span>
                    <span className="font-mono text-muted-foreground">{o.count}</span>
                  </div>
                  <TrustMeter value={(o.count / objectionData[0].count) * 100} showValue={false} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Archetype detail table */}
        <div className="xr-glass rounded-xl overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="text-sm font-semibold">Archetype Detail</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-5 py-3">Archetype</th>
                <th className="text-right text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-5 py-3">Runs</th>
                <th className="text-right text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-5 py-3">Avg Score</th>
                <th className="text-right text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-5 py-3">Close Rate</th>
              </tr>
            </thead>
            <tbody>
              {archetypeData.map((a, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 text-sm text-foreground">{a.name}</td>
                  <td className="px-5 py-3 text-sm font-mono text-muted-foreground text-right">{a.runs}</td>
                  <td className="px-5 py-3 text-sm font-mono text-foreground text-right tabular-nums">{a.avgScore}</td>
                  <td className={`px-5 py-3 text-sm font-mono text-right tabular-nums ${a.closeRate >= 50 ? "text-success" : "text-destructive"}`}>{a.closeRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}

function Kpi({ label, value, suffix = "", tone }: { label: string; value: number; suffix?: string; tone?: "primary" | "success" | "cyan" }) {
  const cls = tone === "success" ? "text-success" : tone === "cyan" ? "text-xr-cyan" : tone === "primary" ? "text-primary" : "text-foreground";
  return (
    <div className="xr-glass rounded-xl p-5">
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`text-3xl font-mono font-semibold tabular-nums mt-2 ${cls}`}>{value}<span className="text-base text-muted-foreground">{suffix}</span></p>
    </div>
  );
}
