import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Plus, Search, Check, X, Pencil, Trash2, Calendar, User,
  ExternalLink, CheckCircle2, Circle, Target, Building2, Users,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import StatusBadge, { priorityVariant } from "@/components/StatusBadge";
import { tasks as initialTasks, getUserById, users, type Task } from "@/data/mockData";
import { toast } from "sonner";

const TODAY = "2024-04-08";
const TOMORROW = "2024-04-09";
const WEEK_END = "2024-04-15";

type StatusTab = "open" | "in_progress" | "completed" | "overdue";

function getDateGroup(t: Task): string {
  if (t.completed) return "Completed";
  if (!t.due_date) return "No Due Date";
  if (t.due_date < TODAY) return "Overdue";
  if (t.due_date === TODAY) return "Today";
  if (t.due_date === TOMORROW) return "Tomorrow";
  if (t.due_date <= WEEK_END) return "This Week";
  return "Later";
}

const GROUP_ORDER = ["Overdue", "Today", "Tomorrow", "This Week", "Later", "No Due Date", "Completed"];

function dueBadgeClass(date: string | undefined) {
  if (!date) return "text-muted-foreground";
  if (date < TODAY) return "bg-destructive/15 text-destructive";
  if (date === TODAY) return "bg-warning/15 text-warning";
  return "text-muted-foreground";
}

const entityIcon = (type: string) => {
  switch (type) { case "lead": return Target; case "property": return Building2; case "contact": return Users; default: return Target; }
};

const entityRoute = (type: string, id: string) => {
  switch (type) { case "lead": return `/leads/${id}`; case "property": return `/properties/${id}`; case "contact": return `/contacts/${id}`; default: return "#"; }
};

// ── New Task Modal ──
function NewTaskModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (t: Partial<Task>) => void }) {
  const [form, setForm] = useState({ title: "", description: "", assigned_user: "u1", due_date: "", priority: "Medium" as Task["priority"] });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  if (!open) return null;

  const handleSubmit = () => {
    if (!form.title.trim()) { setErrors({ title: true }); return; }
    onCreate({ ...form, completed: false, id: `t${Date.now()}`, created_at: TODAY, linked_entity: null });
    setForm({ title: "", description: "", assigned_user: "u1", due_date: "", priority: "Medium" });
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[560px] mx-4 bg-card border border-border rounded-lg shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">New Task</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Title *</label>
            <input value={form.title} onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors({}); }}
              placeholder="Task title" className={`w-full h-9 px-3 rounded-md bg-secondary border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary ${errors.title ? "border-destructive" : "border-border"}`} />
            {errors.title && <p className="text-xs text-destructive mt-1">Title is required</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Task details..." className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary h-20 resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Assigned To</label>
              <select value={form.assigned_user} onChange={e => setForm(f => ({ ...f, assigned_user: e.target.value }))}
                className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary">
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Due Date</label>
              <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Task["priority"] }))}
                className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary">
                <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button onClick={onClose} className="h-9 px-4 rounded-md text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          <button onClick={handleSubmit} className="h-9 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Create Task</button>
        </div>
      </div>
    </div>
  );
}

// ── Task Detail Modal ──
function TaskDetailModal({ task, onClose, onToggle, onDelete, onUpdate }: {
  task: Task; onClose: () => void; onToggle: () => void; onDelete: () => void; onUpdate: (t: Partial<Task>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title: task.title, description: task.description, priority: task.priority, assigned_user: task.assigned_user, due_date: task.due_date });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const assignee = getUserById(task.assigned_user);
  const Icon = task.linked_entity ? entityIcon(task.linked_entity.type) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[560px] mx-4 bg-card border border-border rounded-lg shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Task Details</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          {editing ? (
            <>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Title</label>
                <input value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
                  className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                <textarea value={draft.description} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary h-20 resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Assigned To</label>
                  <select value={draft.assigned_user} onChange={e => setDraft(d => ({ ...d, assigned_user: e.target.value }))}
                    className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary">
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Due Date</label>
                  <input type="date" value={draft.due_date} onChange={e => setDraft(d => ({ ...d, due_date: e.target.value }))}
                    className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Priority</label>
                  <select value={draft.priority} onChange={e => setDraft(d => ({ ...d, priority: e.target.value as Task["priority"] }))}
                    className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary">
                    <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <button onClick={onToggle} className="mt-0.5 shrink-0">
                  {task.completed
                    ? <CheckCircle2 className="h-5 w-5 text-success" />
                    : <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                  }
                </button>
                <div className="flex-1">
                  <p className={`text-base font-medium ${task.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>{task.title}</p>
                  {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-6 mt-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Assigned:</span>
                  <span className="text-sm text-foreground">{assignee?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Due:</span>
                  <span className={`text-sm px-1.5 py-0.5 rounded ${dueBadgeClass(task.due_date)}`}>
                    {task.due_date ? new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No date"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Priority:</span>
                  <StatusBadge variant={priorityVariant(task.priority)}>{task.priority}</StatusBadge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className={`text-sm font-medium ${task.completed ? "text-success" : "text-foreground"}`}>
                    {task.completed ? "Completed" : "Open"}
                  </span>
                </div>
              </div>
              {task.linked_entity && Icon && (
                <Link to={entityRoute(task.linked_entity.type, task.linked_entity.id)} onClick={onClose}
                  className="flex items-center gap-2 mt-2 px-3 py-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors group">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors">{task.linked_entity.name}</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto" />
                </Link>
              )}
            </>
          )}
        </div>
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="flex gap-2">
            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)} className="h-9 px-3 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-1.5">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Sure?</span>
                <button onClick={() => { onDelete(); onClose(); }} className="h-8 px-3 rounded-md bg-destructive text-destructive-foreground text-xs font-medium">Yes, delete</button>
                <button onClick={() => setShowDeleteConfirm(false)} className="h-8 px-3 rounded-md text-xs text-muted-foreground hover:text-foreground">Cancel</button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={() => setEditing(false)} className="h-9 px-4 rounded-md text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                <button onClick={() => { onUpdate(draft); setEditing(false); }} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Save Changes</button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="h-9 px-3 rounded-md text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button onClick={onToggle} className={`h-9 px-4 rounded-md text-sm font-medium transition-colors ${task.completed ? "bg-secondary text-foreground hover:bg-secondary/80" : "bg-success text-success-foreground hover:bg-success/90"}`}>
                  {task.completed ? "Reopen" : "Mark Complete"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ──
export default function Tasks() {
  const [tasksData, setTasksData] = useState<Task[]>(initialTasks);
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const [statusTab, setStatusTab] = useState<StatusTab>("open");
  const [search, setSearch] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const scopedTasks = useMemo(() =>
    scope === "mine" ? tasksData.filter(t => t.assigned_user === "u1") : tasksData
  , [tasksData, scope]);

  const statusFiltered = useMemo(() => {
    return scopedTasks.filter(t => {
      const q = search.toLowerCase();
      const matchSearch = !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.linked_entity?.name.toLowerCase().includes(q);
      if (!matchSearch) return false;
      switch (statusTab) {
        case "open": return !t.completed && t.due_date >= TODAY;
        case "overdue": return !t.completed && t.due_date < TODAY;
        case "completed": return t.completed;
        case "in_progress": return !t.completed;
        default: return true;
      }
    });
  }, [scopedTasks, statusTab, search]);

  const grouped = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    statusFiltered.forEach(t => {
      const g = getDateGroup(t);
      (groups[g] ??= []).push(t);
    });
    return GROUP_ORDER.map(g => ({ group: g, tasks: groups[g] || [] })).filter(g => g.tasks.length > 0);
  }, [statusFiltered]);

  const counts = useMemo(() => ({
    open: scopedTasks.filter(t => !t.completed && t.due_date >= TODAY).length,
    in_progress: scopedTasks.filter(t => !t.completed).length,
    completed: scopedTasks.filter(t => t.completed).length,
    overdue: scopedTasks.filter(t => !t.completed && t.due_date < TODAY).length,
  }), [scopedTasks]);

  const toggleComplete = useCallback((id: string) => {
    setTasksData(prev => prev.map(t => {
      if (t.id !== id) return t;
      const next = !t.completed;
      toast.success(next ? "Task completed!" : "Task reopened");
      return { ...t, completed: next };
    }));
    setSelectedTask(prev => prev && prev.id === id ? { ...prev, completed: !prev.completed } : prev);
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasksData(prev => prev.filter(t => t.id !== id));
    toast.success("Task deleted");
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasksData(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    setSelectedTask(prev => prev && prev.id === id ? { ...prev, ...updates } : prev);
    toast.success("Task updated");
  }, []);

  const createTask = useCallback((t: Partial<Task>) => {
    setTasksData(prev => [...prev, t as Task]);
    setShowNewModal(false);
    toast.success("Task created");
  }, []);

  const tabs: { id: StatusTab; label: string; count: number }[] = [
    { id: "open", label: "Open", count: counts.open },
    { id: "overdue", label: "Overdue", count: counts.overdue },
    { id: "in_progress", label: "All Active", count: counts.in_progress },
    { id: "completed", label: "Completed", count: counts.completed },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Tasks</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{counts.in_progress} active · {counts.overdue} overdue</p>
          </div>
          <button onClick={() => setShowNewModal(true)} className="h-9 px-4 flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> New Task
          </button>
        </div>

        {/* Scope + Search */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center border border-border rounded-md overflow-hidden">
            <button onClick={() => setScope("mine")} className={`h-9 px-4 text-sm font-medium transition-colors ${scope === "mine" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>My Tasks</button>
            <button onClick={() => setScope("all")} className={`h-9 px-4 text-sm font-medium transition-colors ${scope === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>All Tasks</button>
          </div>
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
          </div>
        </div>

        {/* Status Tabs */}
        <div className="border-b border-border">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setStatusTab(tab.id)}
                className={`px-4 pb-3 text-sm font-medium transition-colors border-b-2 ${statusTab === tab.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {tab.label}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[11px] ${tab.id === "overdue" && tab.count > 0 ? "bg-destructive/15 text-destructive" : "text-muted-foreground"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Task Groups */}
        {grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CheckCircle2 className="h-12 w-12 text-success/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">All caught up!</h3>
            <p className="text-sm text-muted-foreground max-w-sm">No {statusTab === "completed" ? "completed" : "open"} tasks{scope === "mine" ? " assigned to you" : ""}.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ group, tasks: groupTasks }) => (
              <div key={group}>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className={`text-sm font-semibold ${group === "Overdue" ? "text-destructive" : "text-foreground"}`}>{group}</h2>
                  <span className="px-1.5 py-0.5 rounded-full text-[11px] text-muted-foreground bg-secondary">{groupTasks.length}</span>
                </div>
                <div className="space-y-1.5">
                  {groupTasks.map(task => {
                    const assignee = getUserById(task.assigned_user);
                    const EIcon = task.linked_entity ? entityIcon(task.linked_entity.type) : null;
                    return (
                      <div key={task.id}
                        className={`bg-card border rounded-lg px-4 py-3 flex items-center gap-3 hover:bg-secondary/30 transition-all cursor-pointer group ${group === "Overdue" ? "border-destructive/20" : "border-border"}`}
                        onClick={() => setSelectedTask(task)}>
                        {/* Checkbox */}
                        <button onClick={e => { e.stopPropagation(); toggleComplete(task.id); }}
                          className="shrink-0 transition-all">
                          {task.completed
                            ? <CheckCircle2 className="h-5 w-5 text-success" />
                            : <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                          }
                        </button>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium truncate ${task.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>{task.title}</p>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            {task.description && <p className="text-xs text-muted-foreground truncate max-w-[300px]">{task.description}</p>}
                          </div>
                        </div>
                        {/* Right side */}
                        <div className="flex items-center gap-2 shrink-0">
                          {task.linked_entity && EIcon && (
                            <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-secondary text-[11px] text-muted-foreground">
                              <EIcon className="h-3 w-3" />
                              <span className="truncate max-w-[120px]">{task.linked_entity.name}</span>
                            </span>
                          )}
                          <StatusBadge variant={priorityVariant(task.priority)}>{task.priority}</StatusBadge>
                          {task.due_date && (
                            <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${dueBadgeClass(task.due_date)}`}>
                              {new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          )}
                          {assignee && (
                            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium text-primary" title={assignee.name}>
                              {assignee.avatar}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <NewTaskModal open={showNewModal} onClose={() => setShowNewModal(false)} onCreate={createTask} />
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onToggle={() => toggleComplete(selectedTask.id)}
          onDelete={() => deleteTask(selectedTask.id)}
          onUpdate={(updates) => updateTask(selectedTask.id, updates)}
        />
      )}
    </AppLayout>
  );
}
