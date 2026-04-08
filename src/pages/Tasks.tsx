import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import StatusBadge, { priorityVariant } from "@/components/StatusBadge";
import { tasks, getUserById } from "@/data/mockData";

function groupTasks(taskList: typeof tasks) {
  const now = new Date("2024-04-08");
  const today = now.toISOString().split("T")[0];
  const tomorrow = new Date(now.getTime() + 86400000).toISOString().split("T")[0];
  const weekEnd = new Date(now.getTime() + 7 * 86400000).toISOString().split("T")[0];

  const groups: Record<string, typeof tasks> = { Overdue: [], Today: [], Tomorrow: [], "This Week": [], Later: [] };

  taskList.forEach(t => {
    if (t.completed) return;
    if (t.due_date < today) groups.Overdue.push(t);
    else if (t.due_date === today) groups.Today.push(t);
    else if (t.due_date === tomorrow) groups.Tomorrow.push(t);
    else if (t.due_date <= weekEnd) groups["This Week"].push(t);
    else groups.Later.push(t);
  });

  return groups;
}

export default function Tasks() {
  const [filter, setFilter] = useState<"mine" | "all">("mine");
  const filteredTasks = filter === "mine" ? tasks.filter(t => t.assigned_user === "u1") : tasks;
  const groups = groupTasks(filteredTasks);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Tasks</h1>
            <p className="text-sm text-muted-foreground mt-1">{tasks.filter(t => !t.completed).length} incomplete tasks</p>
          </div>
          <button className="h-9 px-4 flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Create Task
          </button>
        </div>

        <div className="flex items-center border border-border rounded-md overflow-hidden w-fit">
          <button onClick={() => setFilter("mine")} className={`h-9 px-4 text-sm font-medium transition-colors ${filter === "mine" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>My Tasks</button>
          <button onClick={() => setFilter("all")} className={`h-9 px-4 text-sm font-medium transition-colors ${filter === "all" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>All Tasks</button>
        </div>

        <div className="space-y-6">
          {Object.entries(groups).map(([group, groupTasks]) => {
            if (groupTasks.length === 0) return null;
            return (
              <div key={group}>
                <h2 className={`text-sm font-medium mb-3 ${group === "Overdue" ? "text-destructive" : "text-foreground"}`}>
                  {group} <span className="text-muted-foreground font-normal">({groupTasks.length})</span>
                </h2>
                <div className="space-y-2">
                  {groupTasks.map(task => {
                    const user = getUserById(task.assigned_user);
                    return (
                      <div key={task.id} className="bg-card border border-border rounded-lg p-4 flex items-start gap-3 hover:border-primary/30 transition-colors">
                        <div className={`mt-0.5 h-4 w-4 rounded border shrink-0 cursor-pointer ${task.completed ? "bg-primary border-primary" : "border-border hover:border-primary"}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-foreground">{task.title}</p>
                            <div className="flex items-center gap-2">
                              <StatusBadge variant={priorityVariant(task.priority)}>{task.priority}</StatusBadge>
                              {user && (
                                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium text-primary">{user.avatar}</div>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-muted-foreground">Due: {task.due_date}</span>
                            {task.linked_entity && (
                              <span className="text-xs text-primary">{task.linked_entity.name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
