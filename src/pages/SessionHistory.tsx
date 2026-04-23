import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { EnterpriseTable, ErrorState, LoadingState, PageHeader, TrendSparkline } from "@/components/training/SaaSPrimitives";
import { trainingService } from "@/services/trainingService";
import { useTrainingQuery } from "@/hooks/useTraining";
import { Link } from "react-router-dom";

export default function SessionHistory() {
  const { data, isLoading, error } = useTrainingQuery(() => trainingService.getHistory(), []);
  const [q, setQ] = useState(""); const [drill, setDrill] = useState("all"); const [mode, setMode] = useState("all");
  const rows = useMemo(() => (data ?? []).filter((s) => (drill === "all" || s.drillType === drill) && (mode === "all" || s.mode === mode) && s.scenarioTitle.toLowerCase().includes(q.toLowerCase())), [data, q, drill, mode]);
  if (isLoading) return <AppLayout><LoadingState /></AppLayout>; if (error || !data) return <AppLayout><ErrorState /></AppLayout>;
  return <AppLayout><div className="space-y-6 max-w-[1500px]"><PageHeader eyebrow="Session Archive" title="Session History" description="Searchable audit trail of practice sessions with drill, mode, date, score, and trend visuals." />
    <div className="xr-glass rounded-xl p-4 flex flex-wrap gap-3 items-center"><div className="relative flex-1 min-w-[240px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} className="w-full h-10 pl-9 pr-3 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:border-primary" placeholder="Search sessions…" /></div><select value={drill} onChange={(e) => setDrill(e.target.value)} className="h-10 rounded-md bg-secondary border border-border px-3 text-sm"><option value="all">All drills</option><option value="buyer_consult">Buyer consult</option><option value="objection_handling">Objection handling</option><option value="cold_call">Cold call</option><option value="listing_presentation">Listing presentation</option></select><select value={mode} onChange={(e) => setMode(e.target.value)} className="h-10 rounded-md bg-secondary border border-border px-3 text-sm"><option value="all">All modes</option><option value="text">Text</option><option value="voice">Voice</option><option value="hybrid">Hybrid</option></select></div>
    <EnterpriseTable columns={["Session", "Learner", "Drill", "Mode", "Score", "Date", "Trend"]} rows={rows.map((s, i) => [<Link to={`/practice/results/${s.id}`} className="font-medium hover:text-primary">{s.scenarioTitle}</Link>, s.learnerName, s.drillType.replace("_", " "), s.mode, <span className="font-mono">{s.score || "—"}</span>, new Date(s.startedAt).toLocaleDateString(), <TrendSparkline data={[54 + i, 63 + i, 68 + i, s.score || 74]} />])} />
  </div></AppLayout>;
}
