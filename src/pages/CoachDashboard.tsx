import AppLayout from "@/components/AppLayout";
import { EnterpriseTable, ErrorState, LoadingState, MetricCard, PageHeader, TrendSparkline } from "@/components/training/SaaSPrimitives";
import { trainingService } from "@/services/trainingService";
import { useTrainingQuery } from "@/hooks/useTraining";

export default function CoachDashboard() {
  const { data, isLoading, error } = useTrainingQuery(() => trainingService.getCoachDashboard(), []);
  if (isLoading) return <AppLayout><LoadingState /></AppLayout>; if (error || !data) return <AppLayout><ErrorState /></AppLayout>;
  const avg = Math.round(data.sessions.filter(s => s.score).reduce((a, s) => a + s.score, 0) / data.sessions.filter(s => s.score).length);
  return <AppLayout><div className="space-y-6 max-w-[1500px]"><PageHeader eyebrow="Coach Console" title="Coach Dashboard" description="Roster performance, weak-skill heatmap, flagged learners, reviews, drill assignment, and comparison controls." />
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4"><MetricCard label="Learners" value={data.learners.length} /><MetricCard label="Average Score" value={avg} tone="ice" /><MetricCard label="Flagged Reviews" value={data.feedback.filter(f => !f.resolved).length} tone="danger" /><MetricCard label="Active Teams" value={data.teams.length} /></div>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5"><div><h2 className="text-sm font-semibold mb-3">Learner Roster</h2><EnterpriseTable columns={["Learner", "Average", "Trend", "Assign"]} rows={data.learners.map((l, i) => [l.name, <span className="font-mono">{78 + i * 4}</span>, <TrendSparkline data={[62 + i, 70 + i, 74 + i, 78 + i * 4]} />, <button className="h-8 px-3 rounded-md bg-secondary text-xs hover:bg-accent">Assign drill</button>])} /></div><div className="xr-glass rounded-xl p-5"><h2 className="text-sm font-semibold mb-4">Weak-Skill Heatmap</h2><div className="space-y-3">{data.heatmap.map((row) => <div key={row.skill}><p className="text-xs text-muted-foreground mb-2">{row.skill}</p><div className="grid grid-cols-4 gap-2">{Object.entries(row).filter(([k]) => k !== "skill").map(([name, val]) => <div key={name} className="rounded-md border border-border p-2 text-center" style={{ background: `hsl(var(--primary) / ${Number(val) / 180})` }}><p className="text-[10px] text-muted-foreground">{name}</p><p className="font-mono text-sm">{String(val)}</p></div>)}</div></div>)}</div></div></div>
    <EnterpriseTable columns={["Flag", "Session", "Severity", "Status"]} rows={data.feedback.map((f) => [f.note, f.sessionId, <span className={f.severity === "high" ? "text-destructive" : "text-warning"}>{f.severity}</span>, f.resolved ? "resolved" : "open"])} />
  </div></AppLayout>;
}
