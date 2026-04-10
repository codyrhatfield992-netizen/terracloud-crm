import { Link } from "react-router-dom";
import { Check, Clock, TrendingUp, Users, ArrowUpRight, Calendar, LayoutGrid, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import AppLayout from "@/components/AppLayout";
import StatusBadge, { priorityVariant } from "@/components/StatusBadge";
import { useLeads } from "@/hooks/useLeads";
import { useTasks } from "@/hooks/useTasks";
import { useContacts } from "@/hooks/useContacts";
import { useActivities } from "@/hooks/useActivities";
import { useAuth } from "@/contexts/AuthContext";
import { PIPELINE_STAGES, getStageLabel, formatCompactCurrency, timeAgo } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-md px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{payload[0].value} leads</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: leads = [], isLoading: leadsLoading } = useLeads();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: contacts = [] } = useContacts();
  const { data: activities = [] } = useActivities(10);

  const activeLeads = leads.filter(l => !["closed", "dead"].includes(l.stage));
  const closedLeads = leads.filter(l => l.stage === "closed");
  const pipelineValue = activeLeads.reduce((s, l) => s + Number(l.estimated_value), 0);
  const openTasks = tasks.filter(t => !t.completed);

  const pipelineData = PIPELINE_STAGES.filter(s => s.id !== "dead").map(stage => ({
    name: stage.label,
    count: leads.filter(l => l.stage === stage.id).length,
    id: stage.id,
  }));

  const metrics = [
    { label: "Active Leads", value: String(activeLeads.length), sub: "in pipeline", icon: Users, href: "/leads" },
    { label: "Deals Closed", value: String(closedLeads.length), sub: "total", icon: TrendingUp, href: "/leads" },
    { label: "Pipeline Value", value: formatCompactCurrency(pipelineValue), sub: "estimated", icon: ArrowUpRight, href: "/leads" },
    { label: "Open Tasks", value: String(openTasks.length), sub: "pending", icon: Clock, href: "/tasks" },
  ];

  const isLoading = leadsLoading || tasksLoading;
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";

  return (
    <AppLayout>
      <div className="space-y-8 max-w-[1200px]">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back, {userName}.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-md p-5 space-y-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        ) : leads.length === 0 && tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <LayoutGrid className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">Welcome to TerraCloud</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">Start by adding your first lead, contact, or property to build your pipeline.</p>
            <div className="flex items-center gap-3">
              <Link to="/leads" className="h-9 px-4 flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                <Plus className="h-4 w-4" /> Add Lead
              </Link>
              <Link to="/contacts" className="h-9 px-4 flex items-center gap-2 rounded-md border border-border text-sm font-medium text-foreground hover:bg-card transition-colors">
                <Plus className="h-4 w-4" /> Add Contact
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.map(m => (
                <Link key={m.label} to={m.href} className="bg-card border border-border rounded-md p-5 hover:border-muted-foreground/20 transition-all group">
                  <p className="text-xs text-muted-foreground mb-3">{m.label}</p>
                  <p className="text-3xl font-semibold text-foreground tracking-tight">{m.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{m.sub}</p>
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-card border border-border rounded-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-medium text-foreground">Pipeline Overview</h2>
                  <Link to="/leads" className="text-xs text-muted-foreground hover:text-foreground transition-colors">View all</Link>
                </div>
                {leads.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-16">No leads yet. Create your first lead to see pipeline data.</p>
                ) : (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pipelineData} barCategoryGap="20%">
                        <XAxis dataKey="name" tick={{ fill: "hsl(240 4% 46%)", fontSize: 11 }} axisLine={{ stroke: "hsl(240 4% 16%)" }} tickLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
                        <YAxis tick={{ fill: "hsl(240 4% 46%)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} width={30} />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(0 0% 5%)" }} />
                        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                          {pipelineData.map((entry, i) => (
                            <Cell key={entry.id} fill={entry.id === "closed" ? "hsl(142 71% 45%)" : "hsl(217 91% 60%)"} fillOpacity={entry.id === "closed" ? 0.7 : 0.15 + (i * 0.12)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="bg-card border border-border rounded-md p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium text-foreground">My Tasks</h2>
                  <Link to="/tasks" className="text-xs text-muted-foreground hover:text-foreground transition-colors">View all</Link>
                </div>
                <div className="flex-1 space-y-0.5 overflow-y-auto max-h-[300px] scrollbar-thin">
                  {openTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Check className="h-6 w-6 text-muted-foreground/20 mb-3" />
                      <p className="text-sm text-muted-foreground">All caught up</p>
                    </div>
                  ) : openTasks.slice(0, 6).map(task => (
                    <Link key={task.id} to="/tasks" className="flex items-start gap-3 py-2.5 px-2 rounded-md hover:bg-accent transition-colors group">
                      <div className="mt-1 h-3.5 w-3.5 rounded border border-border shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-foreground truncate leading-tight">{task.title}</p>
                      </div>
                      <StatusBadge variant={priorityVariant(task.priority)} className="shrink-0 mt-0.5">{task.priority}</StatusBadge>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {activities.length > 0 && (
              <div className="bg-card border border-border rounded-md p-6">
                <h2 className="text-sm font-medium text-foreground mb-4">Recent Activity</h2>
                <div className="space-y-0.5 max-h-[300px] overflow-y-auto scrollbar-thin">
                  {activities.map(a => (
                    <div key={a.id} className="flex items-start gap-3 py-2 px-2 rounded-md hover:bg-accent transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-muted-foreground leading-snug">{a.description}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(a.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
