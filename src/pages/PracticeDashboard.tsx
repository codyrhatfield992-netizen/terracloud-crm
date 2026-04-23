import { Link } from "react-router-dom";
import { Activity, ArrowUpRight, Flame, Play, Trophy } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { ErrorState, EnterpriseTable, LoadingState, MetricCard, PageHeader, ScoreRing, TrendSparkline } from "@/components/training/SaaSPrimitives";
import { trainingService } from "@/services/trainingService";
import { useTrainingQuery } from "@/hooks/useTraining";

export default function PracticeDashboard() {
  const { data, isLoading, error } = useTrainingQuery(() => trainingService.getDashboard(), []);
  if (isLoading) return <AppLayout><LoadingState /></AppLayout>;
  if (error || !data) return <AppLayout><ErrorState /></AppLayout>;

  return <AppLayout><div className="space-y-6 max-w-[1500px]">
    <PageHeader eyebrow="Learner Operating Console" title="Practice Dashboard" description="Track sales simulation performance, recommended drills, leaderboard position, and readiness signals." action={<Link to="/practice/launch" className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2 hover:bg-primary/90"><Play className="h-4 w-4" /> Launch Practice</Link>} />
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <MetricCard label="Last Score" value={data.lastSession.score} sub={data.lastSession.scenarioTitle} tone="ice" />
      <MetricCard label="Weekly Improvement" value={`+${data.weeklyImprovement}%`} sub="vs prior 7 days" tone="success" />
      <MetricCard label="Current Streak" value={data.streak} sub="days training" tone="warning" />
      <MetricCard label="Recommended" value="Elite" sub={data.recommendedScenario.title} />
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
      <div className="xl:col-span-8 space-y-5">
        <div className="xr-glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4"><h2 className="text-sm font-semibold">Recent Sessions</h2><Link to="/practice/history" className="text-xs text-muted-foreground hover:text-foreground">View history</Link></div>
          <EnterpriseTable columns={["Session", "Drill", "Mode", "Score", "Trend"]} rows={data.recentSessions.slice(0, 5).map((s, i) => [<Link to={`/practice/results/${s.id}`} className="font-medium hover:text-primary">{s.scenarioTitle}</Link>, s.drillType.replace("_", " "), s.mode, <span className="font-mono tabular-nums">{s.score || "—"}</span>, <TrendSparkline data={[62 + i * 2, 66 + i * 3, 70 + i, s.score || 78]} />])} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SkillPanel title="Top strengths" items={data.strengths} tone="success" />
          <SkillPanel title="Top weaknesses" items={data.weaknesses} tone="danger" />
        </div>
      </div>
      <div className="xl:col-span-4 space-y-5">
        <div className="xr-glass-strong rounded-xl p-5 flex items-center gap-5"><ScoreRing value={data.lastSession.score} label="Prestige Score" /><div><p className="text-sm font-semibold">Next drill</p><p className="text-sm text-muted-foreground mt-1">{data.recommendedScenario.summary}</p><Link to="/practice/launch" className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">Configure drill <ArrowUpRight className="h-3.5 w-3.5" /></Link></div></div>
        <div className="xr-glass rounded-xl p-5"><h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Trophy className="h-4 w-4 text-warning" /> Leaderboard Preview</h2>{data.leaderboardPreview.map((e) => <div key={e.id} className="flex items-center justify-between py-2 border-b border-border last:border-0"><div><p className="text-sm text-foreground">#{e.rank} {e.learnerName}</p><p className="text-xs text-muted-foreground">{e.team}</p></div><span className="font-mono text-primary">{e.score}</span></div>)}</div>
      </div>
    </div>
  </div></AppLayout>;
}

function SkillPanel({ title, items, tone }: { title: string; items: string[]; tone: "success" | "danger" }) {
  return <div className="xr-glass rounded-xl p-5"><h2 className="text-sm font-semibold mb-3 flex items-center gap-2">{tone === "success" ? <Flame className="h-4 w-4 text-success" /> : <Activity className="h-4 w-4 text-destructive" />} {title}</h2><div className="space-y-2">{items.map((item, i) => <div key={item} className="flex items-start gap-2 text-sm text-foreground"><span className={`font-mono text-[10px] mt-1 ${tone === "success" ? "text-success" : "text-destructive"}`}>{String(i + 1).padStart(2, "0")}</span>{item}</div>)}</div></div>;
}
