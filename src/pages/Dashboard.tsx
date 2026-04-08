import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CheckSquare, Clock, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import StatusBadge, { priorityVariant } from "@/components/StatusBadge";
import {
  leads, tasks, activities, contacts, PIPELINE_STAGES,
  getUserById, getContactById, formatCurrency, getStageLabel,
} from "@/data/mockData";

const pipelineData = PIPELINE_STAGES.filter(s => s.id !== "dead").map(stage => ({
  name: stage.label.replace(" ", "\n"),
  count: leads.filter(l => l.stage === stage.id).length,
  id: stage.id,
}));

const metrics = [
  { label: "Active Leads", value: leads.filter(l => !["closed", "dead"].includes(l.stage)).length, icon: Users, change: "+3 this week" },
  { label: "Deals This Month", value: leads.filter(l => l.stage === "closed").length, icon: TrendingUp, change: "1 closed" },
  { label: "Pipeline Value", value: formatCurrency(leads.filter(l => !["closed", "dead"].includes(l.stage)).reduce((s, l) => s + l.estimated_value, 0)), icon: TrendingUp, change: "$280K total" },
];

const upcomingFollowUps = leads
  .filter(l => l.next_follow_up)
  .sort((a, b) => (a.next_follow_up! > b.next_follow_up! ? 1 : -1))
  .slice(0, 5);

const incompleteTasks = tasks.filter(t => !t.completed).slice(0, 5);

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back, Alex. Here's what's happening.</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{m.label}</span>
                <m.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-semibold text-foreground">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.change}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pipeline Chart */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-sm font-medium text-foreground mb-4">Pipeline Overview</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData}>
                  <XAxis dataKey="name" tick={{ fill: "hsl(0 0% 45%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(0 0% 45%)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 15%)", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "hsl(0 0% 95%)" }}
                    itemStyle={{ color: "hsl(234 89% 64%)" }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {pipelineData.map((_, i) => (
                      <Cell key={i} fill={i === pipelineData.length - 1 ? "hsl(142 71% 45%)" : "hsl(234 89% 64%)"} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* My Tasks */}
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-foreground">My Tasks</h2>
              <Link to="/tasks" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {incompleteTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 group">
                  <div className="mt-0.5 h-4 w-4 rounded border border-border shrink-0 group-hover:border-primary transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{task.due_date}</span>
                      <StatusBadge variant={priorityVariant(task.priority)}>{task.priority}</StatusBadge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Follow-Ups */}
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-foreground">Upcoming Follow-Ups</h2>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {upcomingFollowUps.map((lead) => {
                const contact = getContactById(lead.contact_id);
                return (
                  <Link key={lead.id} to={`/leads/${lead.id}`} className="flex items-center justify-between group hover:bg-secondary/50 -mx-2 px-2 py-1.5 rounded-md transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate group-hover:text-primary transition-colors">{lead.title}</p>
                      <p className="text-xs text-muted-foreground">{contact?.name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 ml-4">{lead.next_follow_up}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-foreground">Recent Activity</h2>
            </div>
            <div className="space-y-3">
              {activities.slice(0, 6).map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-medium text-muted-foreground shrink-0 mt-0.5">
                    {a.user.split(" ").map(w => w[0]).join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{a.user}</span>{" "}
                      <span className="text-muted-foreground">{a.action}</span>
                    </p>
                    <p className="text-xs text-primary truncate">{a.entity}</p>
                    <p className="text-xs text-muted-foreground">{new Date(a.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
