import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { EnterpriseTable, ErrorState, LoadingState, PageHeader } from "@/components/training/SaaSPrimitives";
import { trainingService } from "@/services/trainingService";
import { useTrainingQuery } from "@/hooks/useTraining";

const tabs = ["weekly", "all time", "by drill", "by team/cohort"];
export default function Leaderboard() {
  const { data, isLoading, error } = useTrainingQuery(() => trainingService.getLeaderboard(), []); const [tab, setTab] = useState(tabs[0]);
  if (isLoading) return <AppLayout><LoadingState /></AppLayout>; if (error || !data) return <AppLayout><ErrorState /></AppLayout>;
  return <AppLayout><div className="space-y-6 max-w-[1200px]"><PageHeader eyebrow="Competitive Performance" title="Leaderboard" description="Prestige-ranked learner performance across weekly, all-time, drill, and team/cohort views." />
    <div className="xr-glass rounded-xl p-1 inline-flex flex-wrap gap-1">{tabs.map((t) => <button key={t} onClick={() => setTab(t)} className={`h-9 px-4 rounded-md text-sm capitalize ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>)}</div>
    <EnterpriseTable columns={["Rank", "Name", "Score", "Improvement", "Streak", "Sessions", "Team"]} rows={data.map((e) => [<span className="font-mono text-primary">#{e.rank}</span>, e.learnerName, <span className="font-mono">{e.score}</span>, <span className="text-success font-mono">+{e.improvement}%</span>, <span className="font-mono">{e.streak}</span>, <span className="font-mono">{e.sessionsCompleted}</span>, e.team])} />
  </div></AppLayout>;
}
