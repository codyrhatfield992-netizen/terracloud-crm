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

// ── Pipeline chart data ──
const pipelineData = PIPELINE_STAGES.filter(s => s.id !== "dead").map(stage => ({
  name: stage.label,
  count: leads.filter(l => l.stage === stage.id).length,
  id: stage.id,
}));

// ── Computed metrics ──
const activeLeads = leads.filter(l => !["closed", "dead"].includes(l.stage));
const closedThisMonth = leads.filter(l => l.stage === "closed");
const pipelineValue = activeLeads.reduce((s, l) => s + l.estimated_value, 0);
const avgDaysToClose = 32;

// ── LeadHunt metrics ──
const totalRedditLeads = redditLeads.length;
const pendingReddit = redditLeads.filter(l => l.status === "pending").length;
const contactedReddit = redditLeads.filter(l => l.status === "contacted").length;
const convertedReddit = redditLeads.filter(l => l.status === "converted").length;
const conversionRate = totalRedditLeads > 0 ? Math.round((convertedReddit / totalRedditLeads) * 100) : 0;

// Leads found per day (last 7 days simulated)
const leadHuntDays = [
  { day: "Mon", leads: 3 },
  { day: "Tue", leads: 5 },
  { day: "Wed", leads: 2 },
  { day: "Thu", leads: 4 },
  { day: "Fri", leads: 6 },
  { day: "Sat", leads: 1 },
  { day: "Sun", leads: 3 },
];

// Top subreddit
const subredditCounts: Record<string, number> = {};
redditLeads.forEach(rl => {
  const thread = redditThreads.find(t => t.id === rl.thread_id);
  if (thread) subredditCounts[thread.subreddit] = (subredditCounts[thread.subreddit] || 0) + 1;
});
const topSubreddit = Object.entries(subredditCounts).sort((a, b) => b[1] - a[1])[0];

// Best keyword
const keywordCounts: Record<string, number> = {};
redditLeads.forEach(rl => {
  const thread = redditThreads.find(t => t.id === rl.thread_id);
  thread?.matched_keywords.forEach(k => { keywordCounts[k] = (keywordCounts[k] || 0) + 1; });
});
const bestKeyword = Object.entries(keywordCounts).sort((a, b) => b[1] - a[1])[0];

const metrics = [
  { label: "Active Leads", value: String(activeLeads.length), sub: "in pipeline", icon: Users, href: "/leads" },
  { label: "Deals This Month", value: String(closedThisMonth.length), sub: "closed", icon: TrendingUp, href: "/leads" },
  { label: "Pipeline Value", value: formatCompactCurrency(pipelineValue), sub: "estimated", icon: ArrowUpRight, href: "/leads" },
  { label: "Avg. Days to Close", value: String(avgDaysToClose), sub: "days", icon: Clock, href: "/leads" },
];

// ── Follow-ups grouped by date ──
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

// ── Tasks for current user ──
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

// ── Custom tooltip ──
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{payload[0].value} leads</p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1400px]">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back, Alex. Here's your pipeline at a glance.</p>
        </div>

        {/* ── Metrics Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <Link
              key={m.label}
              to={m.href}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/40 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">{m.label}</span>
                <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <m.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
              <p className="text-[32px] font-bold text-foreground leading-none tracking-tight">{m.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{m.sub}</p>
            </Link>
          ))}
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Pipeline Overview - spans 2 cols on desktop */}
          <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-foreground">Pipeline Overview</h2>
              <Link to="/leads" className="text-xs text-primary hover:text-primary/80 transition-colors">View all leads →</Link>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} barCategoryGap="20%">
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "hsl(0 0% 45%)", fontSize: 11 }}
                    axisLine={{ stroke: "hsl(0 0% 15%)" }}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fill: "hsl(0 0% 45%)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    width={30}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(0 0% 10%)" }} />
                  <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                    onClick={(data) => navigate(`/leads`)}
                  >
                    {pipelineData.map((entry, i) => (
                      <Cell
                        key={entry.id}
                        fill={
                          entry.id === "closed"
                            ? "hsl(142 71% 45%)"
                            : `hsl(234 89% ${64 - i * 5}%)`
                        }
                        fillOpacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* My Tasks */}
          <div className="bg-card border border-border rounded-lg p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-foreground">My Tasks</h2>
              <Link to="/tasks" className="text-xs text-primary hover:text-primary/80 transition-colors">View all →</Link>
            </div>
            <div className="flex-1 space-y-1 overflow-y-auto max-h-[340px] scrollbar-thin -mx-2 px-2">
              {myTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Check className="h-8 w-8 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">All caught up!</p>
                  <p className="text-xs text-muted-foreground mt-1">No open tasks.</p>
                </div>
              ) : (
                myTasks.map((task) => {
                  const dueBadge = getTaskDueBadge(task.due_date);
                  return (
                    <Link
                      key={task.id}
                      to="/tasks"
                      className="flex items-start gap-3 py-2.5 px-2 -mx-2 rounded-md hover:bg-secondary/40 transition-colors group"
                    >
                      <div className="mt-1 h-4 w-4 rounded border border-border shrink-0 group-hover:border-primary transition-colors" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate leading-tight">{task.title}</p>
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
          <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-foreground">Follow-Ups</h2>
              <Link to="/leads" className="text-xs text-primary hover:text-primary/80 transition-colors">View all →</Link>
            </div>

            {Object.keys(followUpGroups).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Calendar className="h-8 w-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No follow-ups scheduled</p>
              </div>
            ) : (
              <div className="space-y-5 max-h-[400px] overflow-y-auto scrollbar-thin">
                {(["Today", "Tomorrow", "This Week", "Later"] as const).map(group => {
                  const groupLeads = followUpGroups[group];
                  if (!groupLeads || groupLeads.length === 0) return null;
                  return (
                    <div key={group}>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`text-xs font-semibold uppercase tracking-wider ${
                          group === "Today" ? "text-warning" : group === "Tomorrow" ? "text-primary" : "text-muted-foreground"
                        }`}>
                          {group}
                        </h3>
                        <span className="text-xs text-muted-foreground">({groupLeads.length})</span>
                      </div>
                      <div className="space-y-1">
                        {groupLeads.slice(0, group === "Today" ? 5 : 3).map(lead => {
                          const contact = getContactById(lead.contact_id);
                          const property = lead.property_id ? getPropertyById(lead.property_id) : null;
                          return (
                            <Link
                              key={lead.id}
                              to={`/leads/${lead.id}`}
                              className="flex items-center justify-between py-2 px-3 -mx-3 rounded-md hover:bg-secondary/40 transition-colors group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                  <span className="text-[10px] font-medium text-muted-foreground">
                                    {contact?.name.split(" ").map(w => w[0]).join("") ?? "?"}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                    {contact?.name ?? "Unknown"}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {property?.address ?? lead.title}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-4">
                                <StatusBadge variant={priorityVariant(lead.priority)}>{lead.priority}</StatusBadge>
                                <span className="text-xs text-muted-foreground">{lead.next_follow_up}</span>
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
          <div className="bg-card border border-border rounded-lg p-6 flex flex-col">
            <h2 className="text-lg font-medium text-foreground mb-4">Recent Activity</h2>
            <div className="flex-1 space-y-0.5 overflow-y-auto max-h-[400px] scrollbar-thin -mx-2 px-2">
              {activities.slice(0, 10).map((a) => {
                const user = getUserById(a.user_id);
                return (
                  <div
                    key={a.id}
                    className="flex items-start gap-3 py-2.5 px-2 -mx-2 rounded-md hover:bg-secondary/40 transition-colors cursor-pointer"
                  >
                    <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-semibold text-primary shrink-0 mt-0.5">
                      {user?.avatar ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">
                        <span className="font-medium">{a.user}</span>{" "}
                        <span className="text-muted-foreground">{a.action}</span>{" "}
                        <span className="text-primary font-medium">{a.entity}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(a.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* LeadHunt Performance */}
          <div className="lg:col-span-3 bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-lg font-medium text-foreground">LeadHunt Performance</h2>
              </div>
              <Link to="/lead-hunt" className="text-xs text-primary hover:text-primary/80 transition-colors">View All Leads →</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Chart */}
              <div>
                <p className="text-xs text-muted-foreground mb-3 font-medium">Leads Found (Last 7 Days)</p>
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={leadHuntDays}>
                      <XAxis dataKey="day" tick={{ fill: "hsl(0 0% 45%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "hsl(0 0% 45%)", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} width={20} />
                      <Tooltip
                        content={({ active, payload, label }: any) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
                              <p className="text-xs text-muted-foreground">{label}</p>
                              <p className="text-sm font-semibold text-foreground">{payload[0].value} leads</p>
                            </div>
                          );
                        }}
                      />
                      <Line type="monotone" dataKey="leads" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Conversion Funnel */}
              <div>
                <p className="text-xs text-muted-foreground mb-3 font-medium">Conversion Funnel</p>
                <div className="space-y-2">
                  {[
                    { label: "Found", value: totalRedditLeads, pct: 100 },
                    { label: "Reviewed", value: totalRedditLeads - pendingReddit, pct: totalRedditLeads > 0 ? Math.round(((totalRedditLeads - pendingReddit) / totalRedditLeads) * 100) : 0 },
                    { label: "Contacted", value: contactedReddit + convertedReddit, pct: totalRedditLeads > 0 ? Math.round(((contactedReddit + convertedReddit) / totalRedditLeads) * 100) : 0 },
                    { label: "Converted", value: convertedReddit, pct: conversionRate },
                  ].map(step => (
                    <div key={step.label}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{step.label}</span>
                        <span className="text-foreground font-medium">{step.value} <span className="text-muted-foreground">({step.pct}%)</span></span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${step.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground font-medium">Quick Stats</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Leads found today</span>
                    <span className="text-sm font-semibold text-foreground">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Conversion rate</span>
                    <span className="text-sm font-semibold text-foreground">{conversionRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Best keyword</span>
                    <span className="text-sm font-semibold text-primary">{bestKeyword?.[0] ?? "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Top subreddit</span>
                    <span className="text-sm font-semibold text-primary">{topSubreddit?.[0] ?? "—"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
  );
}
