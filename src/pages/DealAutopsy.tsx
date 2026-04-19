import { Link } from "react-router-dom";
import { FileSearch, ChevronRight, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { AUTOPSIES } from "@/data/simulations";
import { timeAgo } from "@/lib/constants";

export default function DealAutopsy() {
  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1200px]">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-primary mb-2">
            <FileSearch className="h-3.5 w-3.5" />
            Post-Mission Intelligence
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Deal Autopsy</h1>
          <p className="text-sm text-muted-foreground mt-1">{AUTOPSIES.length} reports · forensic breakdown of every closed and failed simulation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AUTOPSIES.map(a => {
            const Icon = a.outcome === "closed" ? CheckCircle2 : a.outcome === "lost" ? XCircle : AlertTriangle;
            const outcomeCls = a.outcome === "closed" ? "text-success" : a.outcome === "lost" ? "text-destructive" : "text-warning";
            return (
              <Link key={a.id} to={`/deal-autopsy/${a.id}`} className="xr-glass rounded-xl p-5 hover:border-primary/40 hover:-translate-y-0.5 transition group block">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition truncate">{a.scenarioName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.clientName} · {a.clientArchetype}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition" />
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl font-mono font-semibold tabular-nums text-foreground">{a.overallScore}</div>
                  <div className="flex-1">
                    <div className={`flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest ${outcomeCls}`}>
                      <Icon className="h-3.5 w-3.5" /> {a.outcome.replace("_", " ")}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{timeAgo(a.ranAt)}</p>
                  </div>
                </div>

                {a.breakdownPoint && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-destructive mb-1">Breakdown Point</p>
                    <p className="text-xs text-foreground">{a.breakdownPoint.room} · <span className="font-mono text-muted-foreground">{a.breakdownPoint.minute}</span></p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.breakdownPoint.cause}</p>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
