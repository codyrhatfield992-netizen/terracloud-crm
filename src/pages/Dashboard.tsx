import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from "recharts";
import { Check, Clock, TrendingUp, Users, ArrowUpRight, Calendar, Target } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import StatusBadge, { priorityVariant } from "@/components/StatusBadge";
import {
  leads, tasks, activities, contacts, properties,
  PIPELINE_STAGES, getUserById, getContactById, getPropertyById,
  formatCurrency, formatCompactCurrency, getStageLabel, timeAgo,
  redditLeads, redditThreads,
  type Lead,
} from "@/data/mockData";

const pipelineData = PIPELINE_STAGES.filter(s => s.id !== "dead").map(stage => ({
  name: stage.label,
  count: leads.filter(l => l.stage === stage.id).length,
  id: stage.id,
}));

const activeLeads = leads.filter(l => !["closed", "dead"].includes(l.stage));
const closedThisMonth = leads.filter(l => l.stage === "closed");
const pipelineValue = activeLeads.reduce((s, l) => s + l.estimated_value, 0);
const avgDaysToClose = 32;

const totalRedditLeads = redditLeads.length;
const pendingReddit = redditLeads.filter(l => l.status === "pending").length;
const contactedReddit = redditLeads.filter(l => l.status === "contacted").length;
const convertedReddit = redditLeads.filter(l => l.status === "converted").length;
const conversionRate = totalRedditLeads > 0 ? Math.round((convertedReddit / totalRedditLeads) * 100) : 0;

const leadHuntDays = [
  { day: "Mon", leads: 3 },
  { day: "Tue", leads: 5 },
  { day: "Wed", leads: 2 },
  { day: "Thu", leads: 4 },
  { day: "Fri", leads: 6 },
  { day: "Sat", leads: 1 },
  { day: "Sun", leads: 3 },
];

const subredditCounts: Record<string, number> = {};
redditLeads.forEach(rl => {
  const thread = redditThreads.find(t => t.id === rl.thread_id);
  if (thread) subredditCounts[thread.subreddit] = (subredditCounts[thread.subreddit] || 0) + 1;
});
const topSubreddit = Object.entries(subredditCounts).sort((a, b) => b[1] - a[1])[0];

const keywordCounts: Record<string, number> = {};
redditLeads.forEach(rl => {
  const thread = redditThreads.find(t => t.id === rl.thread_id);
  thread?.matched_keywords.forEach(k => { keywordCounts[k] = (keywordCounts[k] || 0) + 1; });
});
const bestKeyword = Object.entries(keywordCounts).sort((a, b) => b[1] - a[1])[0];

const metrics = [
  { label: "Active Leads", value: String(activeLeads.length), sub: "in pipeline", icon: Users, href: "/leads" },
  { label: "Deals Closed", value: String(closedThisMonth.length), sub: "this month", icon: TrendingUp, href: "/leads" },
  { label: "Pipeline Value", value: formatCompactCurrency(pipelineValue), sub: "estimated", icon: ArrowUpRight, href: "/leads" },
  { label: "Avg. Close", value: `${avgDaysToClose}d`, sub: "days to close", icon: Clock, href: "/leads" },
];

const TODAY = "2024-04-08";
const TOMORROW = "2024-04-09";

function getFollowUpGroup(date: string): "Today" | "Tomorrow" | "This Week" | "Later" {
  if (date === TODAY) return "Today";
  if (date === TOMORROW) return "Tomorrow";
  if (date <= "2024-04-14") return "This Week";
  return "Later";
}

const followUpLeads = leads
  .filter(l => l.next_follow_up && !["closed", "dead"].includes(l.stage))
  .sort((a, b) => (a.next_follow_up! > b.next_follow_up! ? 1 : -1));

const followUpGroups: Record<string, Lead[]> = {};
followUpLeads.forEach(l => {
  const group = getFollowUpGroup(l.next_follow_up!);
  if (!followUpGroups[group]) followUpGroups[group] = [];
  followUpGroups[group].push(l);
});

const myTasks = tasks
  .filter(t => t.assigned_user === "u1" && !t.completed)
  .sort((a, b) => (a.due_date > b.due_date ? 1 : -1))
  .slice(0, 6);

function getTaskDueBadge(dueDate: string) {
  if (dueDate < TODAY) return { label: "Overdue", variant: "destructive" as const };
  if (dueDate === TODAY) return { label: "Today", variant: "warning" as const };
  if (dueDate === TOMORROW) return { label: "Tomorrow", variant: "default" as const };
  return { label: dueDate, variant: "outline" as const };
}

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
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="space-y-8 max-w-[1200px]">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back, Alex.</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <Link
              key={m.label}
              to={m.href}
              className="bg-card border border-border rounded-md p-5 hover:border-muted-foreground/20 transition-all group"
            >
              <p className="text-xs text-muted-foreground mb-3">{m.label}</p>
              <p className="text-3xl font-semibold text-foreground tracking-tight">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.sub}</p>
            </Link>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Pipeline Overview */}
          <div className="lg:col-span-2 bg-card border border-border rounded-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-medium text-foreground">Pipeline Overview</h2>
              <Link to="/leads" className="text-xs text-muted-foreground hover:text-foreground transition-colors">View all</Link>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} barCategoryGap="20%">
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "hsl(240 4% 46%)", fontSize: 11 }}
                    axisLine={{ stroke: "hsl(240 4% 16%)" }}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fill: "hsl(240 4% 46%)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    width={30}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(0 0% 5%)" }} />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]} cursor="pointer" onClick={() => navigate("/leads")}>
                    {pipelineData.map((entry, i) => (
                      <Cell
                        key={entry.id}
                        fill={entry.id === "closed" ? "hsl(142 71% 45%)" : "hsl(217 91% 60%)"}
                        fillOpacity={entry.id === "closed" ? 0.7 : 0.15 + (i * 0.12)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* My Tasks */}
          <div className="bg-card border border-border rounded-md p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-foreground">My Tasks</h2>
              <Link to="/tasks" className="text-xs text-muted-foreground hover:text-foreground transition-colors">View all</Link>
            </div>
            <div className="flex-1 space-y-0.5 overflow-y-auto max-h-[300px] scrollbar-thin">
              {myTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Check className="h-6 w-6 text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground">All caught up</p>
                </div>
              ) : (
                myTasks.map((task) => {
                  const dueBadge = getTaskDueBadge(task.due_date);
                  return (
                    <Link
                      key={task.id}
                      to="/tasks"
                      className="flex items-start gap-3 py-2.5 px-2 rounded-md hover:bg-accent transition-colors group"
                    >
                      <div className="mt-1 h-3.5 w-3.5 rounded border border-border shrink-0 group-hover:border-muted-foreground/50 transition-colors" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-foreground truncate leading-tight">{task.title}</p>
                        {task.linked_entity && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{task.linked_entity.name}</p>
                        )}
                      </div>
                      <StatusBadge variant={dueBadge.variant} className="shrink-0 mt-0.5">{dueBadge.label}</StatusBadge>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {/* Follow-Ups */}
          <div className="lg:col-span-2 bg-card border border-border rounded-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-foreground">Follow-Ups</h2>
              <Link to="/leads" className="text-xs text-muted-foreground hover:text-foreground transition-colors">View all</Link>
            </div>

            {Object.keys(followUpGroups).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Calendar className="h-6 w-6 text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground">No follow-ups scheduled</p>
              </div>
            ) : (
              <div className="space-y-5 max-h-[360px] overflow-y-auto scrollbar-thin">
                {(["Today", "Tomorrow", "This Week", "Later"] as const).map(group => {
                  const groupLeads = followUpGroups[group];
                  if (!groupLeads || groupLeads.length === 0) return null;
                  return (
                    <div key={group}>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`text-xs font-medium uppercase tracking-wider ${
                          group === "Today" ? "text-warning" : group === "Tomorrow" ? "text-primary" : "text-muted-foreground"
                        }`}>
                          {group}
                        </h3>
                        <span className="text-xs text-muted-foreground">({groupLeads.length})</span>
                      </div>
                      <div className="space-y-0.5">
                        {groupLeads.slice(0, group === "Today" ? 5 : 3).map(lead => {
                          const contact = getContactById(lead.contact_id);
                          const property = lead.property_id ? getPropertyById(lead.property_id) : null;
                          return (
                            <Link
                              key={lead.id}
                              to={`/leads/${lead.id}`}
                              className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent transition-colors group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                  <span className="text-[10px] font-medium text-muted-foreground">
                                    {contact?.name.split(" ").map(w => w[0]).join("") ?? "?"}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[13px] text-foreground truncate group-hover:text-primary transition-colors">
                                    {contact?.name ?? "Unknown"}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {property?.address ?? lead.title}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-4">
                                <StatusBadge variant={priorityVariant(lead.priority)}>{lead.priority}</StatusBadge>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-md p-6 flex flex-col">
            <h2 className="text-sm font-medium text-foreground mb-4">Recent Activity</h2>
            <div className="flex-1 space-y-0.5 overflow-y-auto max-h-[360px] scrollbar-thin">
              {activities.slice(0, 10).map((a) => {
                const user = getUserById(a.user_id);
                return (
                  <div
                    key={a.id}
                    className="flex items-start gap-3 py-2 px-2 rounded-md hover:bg-accent transition-colors"
                  >
                    <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-medium text-muted-foreground shrink-0 mt-0.5">
                      {user?.avatar ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-muted-foreground leading-snug">
                        <span className="font-medium text-foreground">{a.user}</span>{" "}
                        {a.action}{" "}
                        <span className="text-foreground">{a.entity}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(a.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LeadHunt Performance */}
          <div className="lg:col-span-3 bg-card border border-border rounded-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-medium text-foreground">LeadHunt Performance</h2>
              </div>
              <Link to="/lead-hunt" className="text-xs text-muted-foreground hover:text-foreground transition-colors">View all</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Chart */}
              <div>
                <p className="text-xs text-muted-foreground mb-3">Leads found (7d)</p>
                <div className="h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={leadHuntDays}>
                      <XAxis dataKey="day" tick={{ fill: "hsl(240 4% 46%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "hsl(240 4% 46%)", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} width={20} />
                      <Tooltip content={<ChartTooltip />} />
                      <Line type="monotone" dataKey="leads" stroke="hsl(217 91% 60%)" strokeWidth={1.5} dot={{ fill: "hsl(217 91% 60%)", r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Conversion Funnel */}
              <div>
                <p className="text-xs text-muted-foreground mb-3">Conversion funnel</p>
                <div className="space-y-2.5">
                  {[
                    { label: "Found", value: totalRedditLeads, pct: 100 },
                    { label: "Reviewed", value: totalRedditLeads - pendingReddit, pct: totalRedditLeads > 0 ? Math.round(((totalRedditLeads - pendingReddit) / totalRedditLeads) * 100) : 0 },
                    { label: "Contacted", value: contactedReddit + convertedReddit, pct: totalRedditLeads > 0 ? Math.round(((contactedReddit + convertedReddit) / totalRedditLeads) * 100) : 0 },
                    { label: "Converted", value: convertedReddit, pct: conversionRate },
                  ].map(step => (
                    <div key={step.label}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{step.label}</span>
                        <span className="text-foreground tabular-nums">{step.value}</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${step.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div>
                <p className="text-xs text-muted-foreground mb-3">Quick stats</p>
                <div className="space-y-3">
                  {[
                    { label: "Leads found today", value: "3" },
                    { label: "Conversion rate", value: `${conversionRate}%` },
                    { label: "Best keyword", value: bestKeyword?.[0] ?? "-" },
                    { label: "Top subreddit", value: topSubreddit?.[0] ?? "-" },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between">
                      <span className="text-[13px] text-muted-foreground">{s.label}</span>
                      <span className="text-[13px] font-medium text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
