import { Link, useParams } from "react-router-dom";
import { RotateCcw, Home } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { ErrorState, LoadingState, PageHeader, ScoreRing, TranscriptPane } from "@/components/training/SaaSPrimitives";
import TrustMeter from "@/components/xr/TrustMeter";
import { trainingService } from "@/services/trainingService";
import { useTrainingQuery } from "@/hooks/useTraining";

export default function PracticeResults() {
  const { id = "sess-1" } = useParams();
  const score = useTrainingQuery(() => trainingService.getSessionScore(id), [id]);
  const turns = useTrainingQuery(() => trainingService.getSessionTurns(id), [id]);
  if (score.isLoading || turns.isLoading) return <AppLayout><LoadingState /></AppLayout>;
  if (score.error || !score.data || turns.error || !turns.data) return <AppLayout><ErrorState /></AppLayout>;
  return <AppLayout><div className="space-y-6 max-w-[1500px]"><PageHeader eyebrow="Structured Scoring JSON" title="Session Results" description="Performance breakdown, percentile, transcript evidence, suggested rewrites, and recommended next drill." action={<div className="flex gap-2"><Link to="/practice/launch" className="h-10 px-4 rounded-md border border-border text-sm inline-flex items-center gap-2 hover:bg-accent"><RotateCcw className="h-4 w-4" /> Retry Drill</Link><Link to="/practice" className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm inline-flex items-center gap-2"><Home className="h-4 w-4" /> Dashboard</Link></div>} />
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5"><div className="xl:col-span-4 xr-glass-strong rounded-xl p-6 flex flex-col items-center"><ScoreRing value={score.data.overall} label="Overall Score" size="lg" /><p className="mt-5 text-sm text-muted-foreground">Percentile</p><p className="text-4xl font-mono text-primary mt-1">{score.data.percentile}<span className="text-base text-muted-foreground">th</span></p></div><div className="xl:col-span-8 xr-glass rounded-xl p-5"><h2 className="text-sm font-semibold mb-4">Category Breakdown</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{score.data.categories.map((c) => <div key={c.category} className="xr-glass rounded-lg p-4"><TrustMeter value={c.score} label={c.category} /><p className="text-xs text-muted-foreground mt-2">{c.note}</p></div>)}</div></div></div>
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5"><ResultList title="Strengths" items={score.data.strengths} /><ResultList title="Missed Opportunities" items={score.data.missedOpportunities} danger /><ResultList title="Weaknesses" items={score.data.weaknesses} danger /></div>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5"><div className="xr-glass rounded-xl p-5"><h2 className="text-sm font-semibold mb-4">Suggested Rewrites</h2>{score.data.rewrites.map((r) => <div key={r.original} className="space-y-2"><p className="text-xs text-muted-foreground">Original</p><p className="text-sm text-destructive border border-border rounded-md p-3">{r.original}</p><p className="text-xs text-muted-foreground">Improved</p><p className="text-sm text-success border border-border rounded-md p-3">{r.improved}</p></div>)}</div><TranscriptPane turns={turns.data} /></div>
  </div></AppLayout>;
}
function ResultList({ title, items, danger }: { title: string; items: string[]; danger?: boolean }) { return <div className="xr-glass rounded-xl p-5"><h2 className="text-sm font-semibold mb-3">{title}</h2><ul className="space-y-2">{items.map((item, i) => <li key={item} className="text-sm text-foreground flex gap-2"><span className={`font-mono text-[10px] mt-1 ${danger ? "text-destructive" : "text-success"}`}>{String(i + 1).padStart(2, "0")}</span>{item}</li>)}</ul></div>; }
