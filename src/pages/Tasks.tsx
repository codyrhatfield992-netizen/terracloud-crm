import { useState, useMemo, useCallback } from "react";
import { Plus, Search, X, CheckCircle2, Circle, Check } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import StatusBadge, { priorityVariant } from "@/components/StatusBadge";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, type DbTask } from "@/hooks/useTasks";
import { Skeleton } from "@/components/ui/skeleton";
import { PRIORITIES, formatDate, getPriorityLabel, isOverdue, isDueToday, normalizePriority } from "@/lib/constants";

function dueBadgeClass(date: string | null) {
  if (!date) return "text-muted-foreground";
  if (isOverdue(date)) return "bg-destructive/15 text-destructive";
  if (isDueToday(date)) return "bg-warning/15 text-warning";
  return "text-muted-foreground";
}

function NewTaskModal({
  open, onClose, onSubmit, submitting,
}: { open: boolean; onClose: () => void; onSubmit: (t: Partial<DbTask>) => void; submitting: boolean }) {
  const [form, setForm] = useState({ title: "", description: "", due_date: "", priority: "medium" });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  if (!open) return null;

  const handleSubmit = () => {
    if (!form.title.trim()) { setErrors({ title: true }); return; }
    onSubmit({
      title: form.title.trim(),
      description: form.description,
      due_date: form.due_date || null,
      priority: form.priority,
      completed: false,
    });
    setForm({ title: "", description: "", due_date: "", priority: "medium" });
    setErrors({});
    onClose();
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
            <input value={form.title} onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value })); if (errors.title) setErrors({}); }}
              placeholder="Task title" autoFocus
              className={`w-full h-9 px-3 rounded-md bg-secondary border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary ${errors.title ? "border-destructive" : "border-border"}`} />
            {errors.title && <p className="text-xs text-destructive mt-1">Required</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Task details..." className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary h-20 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Due Date</label>
              <input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Priority</label>
              <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary">
                {PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button onClick={onClose} className="h-9 px-4 rounded-md text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting}
            className="h-9 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60">
            {submitting ? "Creating..." : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Tasks() {
  const { data: tasks = [], isLoading } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [statusTab, setStatusTab] = useState<"open" | "completed">("open");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const normalized = useMemo(
    () => tasks.map((t) => ({ ...t, priority: normalizePriority(t.priority) })),
    [tasks],
  );

  const openCount = normalized.filter((t) => !t.completed).length;
  const completedCount = normalized.filter((t) => t.completed).length;

  const filtered = useMemo(() => {
    return normalized.filter((t) => {
      const q = search.toLowerCase();
      const matchSearch = !q || t.title.toLowerCase().includes(q) || (t.description ?? "").toLowerCase().includes(q);
      if (!matchSearch) return false;
      return statusTab === "open" ? !t.completed : t.completed;
    });
  }, [normalized, statusTab, search]);

  const toggleComplete = useCallback((task: DbTask) => {
    updateTask.mutate({ id: task.id, completed: !task.completed });
  }, [updateTask]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Tasks</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{openCount} open, {completedCount} completed</p>
          </div>
          <button onClick={() => setShowModal(true)} className="h-9 px-4 flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> New Task
          </button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setStatusTab("open")} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${statusTab === "open" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              Open ({openCount})
            </button>
            <button onClick={() => setStatusTab("completed")} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${statusTab === "completed" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              Completed ({completedCount})
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Check className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">
              {statusTab === "completed" ? "No completed tasks" : "No open tasks"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              {tasks.length === 0 ? "Create your first task to stay organized" : statusTab === "open" ? "All caught up." : "Complete some tasks to see them here"}
            </p>
            {tasks.length === 0 && (
              <button onClick={() => setShowModal(true)} className="h-9 px-4 flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                <Plus className="h-4 w-4" /> New Task
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((task) => (
              <div key={task.id} className="flex items-start gap-3 py-3 px-4 rounded-lg hover:bg-secondary/30 transition-colors group bg-card border border-border">
                <button onClick={() => toggleComplete(task)} className="mt-0.5 shrink-0" disabled={updateTask.isPending}>
                  {task.completed ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>{task.title}</p>
                  {task.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>}
                  <div className="flex items-center gap-3 mt-1.5">
                    <StatusBadge variant={priorityVariant(task.priority)}>{getPriorityLabel(task.priority)}</StatusBadge>
                    {task.due_date ? (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${dueBadgeClass(task.due_date)}`}>
                        {formatDate(task.due_date)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">No date set</span>
                    )}
                  </div>
                </div>
                <button onClick={() => deleteTask.mutate(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-xs text-destructive hover:underline transition-opacity shrink-0">Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <NewTaskModal open={showModal} onClose={() => setShowModal(false)} onSubmit={(t) => createTask.mutate(t)} submitting={createTask.isPending} />
    </AppLayout>
  );
}
