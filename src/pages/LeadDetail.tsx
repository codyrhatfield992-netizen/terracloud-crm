import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Calendar, User, DollarSign, FileText, Check,
  ChevronDown, Pencil, Trash2, Plus, Upload, Phone, Video,
  MapPin, Mail, ExternalLink, X, Clock,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import StatusBadge, { priorityVariant, stageVariant } from "@/components/StatusBadge";
import {
  DeleteConfirmModal, LinkContactModal, LinkPropertyModal,
  LogMeetingModal, CreateTaskModal,
} from "@/components/LeadDetailModals";
import {
  getLeadById, getContactById, getPropertyById, getUserById,
  PIPELINE_STAGES, formatCurrency, getStageLabel, timeAgo, users,
  notes as allNotes, tasks as allTasks, meetings as allMeetings,
  documents as allDocuments, activities as allActivities,
  type Lead, type StageId, type Note, type Task, type Meeting, type DocFile, type Contact, type Property,
} from "@/data/mockData";

const TODAY = "2024-04-08";

// ── Inline Editable Field ──
function InlineEdit({ value, onSave, type = "text", prefix, className = "" }: {
  value: string; onSave: (v: string) => void; type?: string; prefix?: string; className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) { onSave(draft); toast.success("Updated successfully"); }
  };

  if (!editing) {
    return (
      <button onClick={() => { setDraft(value); setEditing(true); }}
        className={`text-sm text-foreground hover:text-primary transition-colors text-right group flex items-center gap-1.5 ${className}`}>
        {prefix}{value || "—"}
        <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    );
  }

  return (
    <input ref={inputRef} type={type} value={draft} onChange={e => setDraft(e.target.value)}
      onBlur={commit} onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
      className="h-8 px-2 rounded-md bg-background border border-primary text-sm text-foreground text-right focus:outline-none focus:ring-1 focus:ring-primary/30 w-full max-w-[180px] transition-colors" />
  );
}

// ── Dropdown Selector ──
function DropdownSelect<T extends string>({ value, options, onSelect, renderOption, renderValue }: {
  value: T; options: { value: T; label: string }[];
  onSelect: (v: T) => void;
  renderOption?: (opt: { value: T; label: string }) => React.ReactNode;
  renderValue?: (v: T) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 transition-colors">
        {renderValue ? renderValue(value) : <span className="text-sm text-foreground">{options.find(o => o.value === value)?.label}</span>}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-xl z-50 py-1 animate-scale-in">
          {options.map(opt => (
            <button key={opt.value} onClick={() => { onSelect(opt.value); setOpen(false); toast.success(`Updated to ${opt.label}`); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary/60 transition-colors flex items-center justify-between ${opt.value === value ? "text-primary" : "text-foreground"}`}>
              {renderOption ? renderOption(opt) : opt.label}
              {opt.value === value && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const staticLead = getLeadById(id!);

  // Local state for the lead
  const [lead, setLead] = useState<Lead | null>(staticLead ? { ...staticLead } : null);
  const [activeTab, setActiveTab] = useState("notes");

  // Modal states
  const [showDelete, setShowDelete] = useState(false);
  const [showLinkContact, setShowLinkContact] = useState(false);
  const [showLinkProperty, setShowLinkProperty] = useState(false);
  const [showLogMeeting, setShowLogMeeting] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);

  // Editable content
  const [noteText, setNoteText] = useState("");
  const [localNotes, setLocalNotes] = useState<Note[]>(allNotes.filter(n => n.entity_type === "lead" && n.entity_id === id));
  const [localTasks, setLocalTasks] = useState<Task[]>(allTasks.filter(t => t.linked_entity?.type === "lead" && t.linked_entity.id === id));
  const [localMeetings, setLocalMeetings] = useState<Meeting[]>(allMeetings.filter(m => m.entity_type === "lead" && m.entity_id === id));
  const [localDocs] = useState<DocFile[]>(allDocuments.filter(d => d.entity_type === "lead" && d.entity_id === id));

  // Linked records
  const [linkedContactId, setLinkedContactId] = useState(lead?.contact_id ?? null);
  const [linkedPropertyId, setLinkedPropertyId] = useState(lead?.property_id ?? null);

  if (!lead) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-muted-foreground mb-4">Lead not found</p>
          <Link to="/leads" className="text-sm text-primary hover:underline">Back to Leads</Link>
        </div>
      </AppLayout>
    );
  }

  const contact = linkedContactId ? getContactById(linkedContactId) : null;
  const property = linkedPropertyId ? getPropertyById(linkedPropertyId) : null;
  const assignedUser = getUserById(lead.assigned_user);

  const updateLead = (patch: Partial<Lead>) => setLead(prev => prev ? { ...prev, ...patch } : prev);

  // Notes
  const addNote = () => {
    if (!noteText.trim()) return;
    const newNote: Note = {
      id: `n${Date.now()}`, content: noteText.trim(), author: "u1",
      entity_type: "lead", entity_id: lead.id, created_at: new Date().toISOString(),
    };
    setLocalNotes(prev => [newNote, ...prev]);
    setNoteText("");
    toast.success("Note saved");
  };

  // Tasks
  const toggleTask = (taskId: string) => {
    setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
    toast.success("Task updated");
  };

  // Activity feed for this lead
  const leadActivities = allActivities.filter(a => a.entity_id === lead.id || a.entity_type === "lead");

  const tabs = [
    { id: "notes", label: "Notes", count: localNotes.length },
    { id: "meetings", label: "Meetings", count: localMeetings.length },
    { id: "tasks", label: "Tasks", count: localTasks.length },
    { id: "documents", label: "Documents", count: localDocs.length },
    { id: "activity", label: "Activity", count: 0 },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1400px]">
        {/* Back */}
        <Link to="/leads" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Leads
        </Link>

        {/* ── HEADER ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-3">
            {/* Editable Title */}
            <InlineEdit
              value={lead.title}
              onSave={(v) => updateLead({ title: v })}
              className="text-2xl font-bold text-foreground text-left"
            />

            <div className="flex items-center gap-3 flex-wrap">
              {/* Stage Dropdown */}
              <DropdownSelect
                value={lead.stage}
                options={PIPELINE_STAGES.map(s => ({ value: s.id, label: s.label }))}
                onSelect={(v) => updateLead({ stage: v })}
                renderValue={(v) => <StatusBadge variant={stageVariant(v)} className="cursor-pointer">{getStageLabel(v)}</StatusBadge>}
              />

              {/* Priority */}
              <DropdownSelect
                value={lead.priority}
                options={[
                  { value: "Low" as const, label: "Low" },
                  { value: "Medium" as const, label: "Medium" },
                  { value: "High" as const, label: "High" },
                  { value: "Urgent" as const, label: "Urgent" },
                ]}
                onSelect={(v) => updateLead({ priority: v as Lead["priority"] })}
                renderValue={(v) => <StatusBadge variant={priorityVariant(v)} className="cursor-pointer">{v}</StatusBadge>}
              />

              {/* Assigned User */}
              <DropdownSelect
                value={lead.assigned_user}
                options={users.map(u => ({ value: u.id, label: u.name }))}
                onSelect={(v) => updateLead({ assigned_user: v })}
                renderValue={(v) => {
                  const u = getUserById(v);
                  return (
                    <div className="flex items-center gap-2 cursor-pointer">
                      <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-[11px] font-medium text-primary">
                        {u?.avatar}
                      </div>
                      <span className="text-sm text-muted-foreground">{u?.name}</span>
                    </div>
                  );
                }}
              />
            </div>
          </div>

          <button onClick={() => setShowDelete(true)}
            className="h-9 px-4 flex items-center gap-2 rounded-lg border border-border text-sm text-destructive hover:bg-destructive/10 transition-colors shrink-0">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>

        {/* ── TWO COLUMN LAYOUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* LEFT COLUMN (3/5) */}
          <div className="lg:col-span-3 space-y-6">

            {/* Details Card */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-base font-semibold text-foreground mb-4">Details</h2>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Source</span>
                  <InlineEdit value={lead.source} onSave={v => updateLead({ source: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm text-muted-foreground">{lead.created_at}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Follow-Up</span>
                  <InlineEdit value={lead.next_follow_up ?? ""} onSave={v => updateLead({ next_follow_up: v || null })} type="date" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" />Est. Value</span>
                  <InlineEdit value={String(lead.estimated_value)} onSave={v => updateLead({ estimated_value: parseInt(v) || 0 })} type="number" prefix="$" />
                </div>
                <div className="col-span-2 flex items-start justify-between">
                  <span className="text-sm text-muted-foreground mt-1">Tags</span>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {lead.tags.map(t => (
                      <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary text-xs font-medium text-foreground">
                        {t}
                        <button onClick={() => { updateLead({ tags: lead.tags.filter(tag => tag !== t) }); toast.success("Tag removed"); }}
                          className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                    <button className="px-2 py-0.5 rounded border border-dashed border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                      onClick={() => { const tag = prompt("Enter tag name"); if (tag) { updateLead({ tags: [...lead.tags, tag] }); toast.success("Tag added"); } }}>
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── TABS ── */}
            <div>
              <div className="border-b border-border mb-4">
                <div className="flex gap-1">
                  {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`px-4 pb-3 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === tab.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}>
                      {tab.label}
                      {tab.count > 0 && <span className="ml-1.5 text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{tab.count}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* NOTES TAB */}
              {activeTab === "notes" && (
                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-lg p-4">
                    <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
                      placeholder="Add a note..."
                      onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") addNote(); }}
                      className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none h-20 focus:outline-none" />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">⌘+Enter to save</span>
                      <button onClick={addNote} disabled={!noteText.trim()}
                        className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        Save Note
                      </button>
                    </div>
                  </div>
                  {localNotes.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-sm text-muted-foreground">No notes yet. Start by adding one above.</p>
                    </div>
                  ) : (
                    localNotes.map(note => {
                      const author = getUserById(note.author);
                      return (
                        <div key={note.id} className="bg-card border border-border rounded-lg p-4 group">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-[11px] font-medium text-primary">{author?.avatar}</div>
                              <span className="text-sm font-medium text-foreground">{author?.name}</span>
                              <span className="text-xs text-muted-foreground">{timeAgo(note.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="h-7 w-7 flex items-center justify-center rounded hover:bg-secondary text-muted-foreground"><Pencil className="h-3 w-3" /></button>
                              <button className="h-7 w-7 flex items-center justify-center rounded hover:bg-secondary text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                            </div>
                          </div>
                          <p className="text-sm text-foreground/80 leading-relaxed">{note.content}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* MEETINGS TAB */}
              {activeTab === "meetings" && (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <button onClick={() => setShowLogMeeting(true)}
                      className="h-8 px-4 flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                      <Plus className="h-3.5 w-3.5" /> Log Meeting
                    </button>
                  </div>
                  {localMeetings.length === 0 ? (
                    <div className="text-center py-10">
                      <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No meetings logged</p>
                    </div>
                  ) : (
                    localMeetings.map(m => (
                      <div key={m.id} className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                            {m.title.includes("Tour") ? <MapPin className="h-4 w-4 text-muted-foreground" /> :
                             m.title.includes("Call") ? <Phone className="h-4 w-4 text-muted-foreground" /> :
                             <Video className="h-4 w-4 text-muted-foreground" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">{m.title}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span>{m.date}</span><span>{m.time}</span><span>{m.duration}</span>
                            </div>
                            {m.notes && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{m.notes}</p>}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TASKS TAB */}
              {activeTab === "tasks" && (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <button onClick={() => setShowCreateTask(true)}
                      className="h-8 px-4 flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                      <Plus className="h-3.5 w-3.5" /> Create Task
                    </button>
                  </div>

                  {localTasks.length === 0 ? (
                    <div className="text-center py-10">
                      <Check className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No tasks assigned</p>
                    </div>
                  ) : (
                    <>
                      {/* Open Tasks */}
                      {localTasks.filter(t => !t.completed).length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Open ({localTasks.filter(t => !t.completed).length})</h3>
                          <div className="space-y-2">
                            {localTasks.filter(t => !t.completed).map(task => {
                              const assignee = getUserById(task.assigned_user);
                              const isOverdue = task.due_date < TODAY;
                              return (
                                <div key={task.id} className="bg-card border border-border rounded-lg p-4 flex items-start gap-3 hover:border-primary/30 transition-colors group">
                                  <button onClick={() => toggleTask(task.id)}
                                    className="mt-0.5 h-5 w-5 rounded border border-border shrink-0 hover:border-primary hover:bg-primary/10 transition-colors flex items-center justify-center" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-medium text-foreground">{task.title}</p>
                                      <div className="flex items-center gap-2">
                                        <StatusBadge variant={isOverdue ? "destructive" : task.due_date === TODAY ? "warning" : "outline"}>
                                          {isOverdue ? "Overdue" : task.due_date}
                                        </StatusBadge>
                                        {assignee && (
                                          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium text-primary" title={assignee.name}>
                                            {assignee.avatar}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {task.description && <p className="text-xs text-muted-foreground mt-1">{task.description}</p>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {/* Completed */}
                      {localTasks.filter(t => t.completed).length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Completed ({localTasks.filter(t => t.completed).length})</h3>
                          <div className="space-y-2">
                            {localTasks.filter(t => t.completed).map(task => (
                              <div key={task.id} className="bg-card border border-border rounded-lg p-4 flex items-start gap-3 opacity-60">
                                <button onClick={() => toggleTask(task.id)}
                                  className="mt-0.5 h-5 w-5 rounded bg-primary border-primary shrink-0 flex items-center justify-center">
                                  <Check className="h-3 w-3 text-primary-foreground" />
                                </button>
                                <p className="text-sm text-muted-foreground line-through">{task.title}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* DOCUMENTS TAB */}
              {activeTab === "documents" && (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <button className="h-8 px-4 flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                      <Upload className="h-3.5 w-3.5" /> Upload Document
                    </button>
                  </div>
                  {localDocs.length === 0 ? (
                    <div className="text-center py-10">
                      <FileText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No documents uploaded</p>
                    </div>
                  ) : (
                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                      {localDocs.map((doc, i) => {
                        const uploader = getUserById(doc.uploader);
                        return (
                          <div key={doc.id} className={`flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors cursor-pointer ${i > 0 ? "border-t border-border" : ""}`}>
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground hover:text-primary transition-colors">{doc.filename}</p>
                                <p className="text-xs text-muted-foreground">{uploader?.name} · {doc.upload_date} · {doc.size}</p>
                              </div>
                            </div>
                            <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ACTIVITY TAB */}
              {activeTab === "activity" && (
                <div className="space-y-0.5 max-h-[500px] overflow-y-auto scrollbar-thin">
                  {leadActivities.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-sm text-muted-foreground">No activity yet</p>
                    </div>
                  ) : (
                    leadActivities.slice(0, 10).map((a, i) => (
                      <div key={a.id} className="flex gap-3 py-3">
                        <div className="flex flex-col items-center">
                          <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-semibold text-primary shrink-0">
                            {getUserById(a.user_id)?.avatar ?? "?"}
                          </div>
                          {i < leadActivities.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                        </div>
                        <div className="flex-1 min-w-0 pb-2">
                          <p className="text-sm text-foreground leading-snug">
                            <span className="font-medium">{a.user}</span>{" "}
                            <span className="text-muted-foreground">{a.action}</span>{" "}
                            <span className="text-primary">{a.entity}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(a.timestamp)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN (2/5) */}
          <div className="lg:col-span-2 space-y-4">

            {/* Contact Card */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contact</h3>
              {contact ? (
                <div className="space-y-3">
                  <p className="text-lg font-semibold text-foreground">{contact.name}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0" /> {contact.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" /> {contact.phone}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Link to={`/contacts/${contact.id}`}
                      className="h-8 px-3 flex items-center gap-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-secondary transition-colors">
                      <ExternalLink className="h-3 w-3" /> View Contact
                    </Link>
                    <button onClick={() => { setLinkedContactId(null); toast.success("Contact unlinked"); }}
                      className="h-8 px-3 rounded-lg border border-border text-xs text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors">
                      Unlink
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <User className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">No contact linked</p>
                  <button onClick={() => setShowLinkContact(true)}
                    className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                    Link Contact
                  </button>
                </div>
              )}
            </div>

            {/* Property Card */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Property</h3>
              {property ? (
                <div className="space-y-3">
                  <p className="text-lg font-semibold text-foreground">{property.address}</p>
                  <p className="text-sm text-muted-foreground">{property.city}, {property.state} {property.zip}</p>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">ARV</p>
                      <p className="text-sm font-medium text-foreground">{formatCurrency(property.arv)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Asking</p>
                      <p className="text-sm font-medium text-foreground">{formatCurrency(property.asking_price)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="text-sm text-foreground">{property.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Size</p>
                      <p className="text-sm text-foreground">{property.beds}bd / {property.baths}ba · {property.sqft.toLocaleString()} sqft</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Link to={`/properties/${property.id}`}
                      className="h-8 px-3 flex items-center gap-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-secondary transition-colors">
                      <ExternalLink className="h-3 w-3" /> View Property
                    </Link>
                    <button onClick={() => { setLinkedPropertyId(null); toast.success("Property unlinked"); }}
                      className="h-8 px-3 rounded-lg border border-border text-xs text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors">
                      Unlink
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <MapPin className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">No property linked</p>
                  <button onClick={() => setShowLinkProperty(true)}
                    className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                    Link Property
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODALS ── */}
      {showDelete && (
        <DeleteConfirmModal
          onClose={() => setShowDelete(false)}
          onConfirm={() => { toast.success("Lead deleted"); navigate("/leads"); }}
        />
      )}
      {showLinkContact && (
        <LinkContactModal
          onClose={() => setShowLinkContact(false)}
          onLink={(c) => { setLinkedContactId(c.id); setShowLinkContact(false); toast.success(`Linked to ${c.name}`); }}
        />
      )}
      {showLinkProperty && (
        <LinkPropertyModal
          onClose={() => setShowLinkProperty(false)}
          onLink={(p) => { setLinkedPropertyId(p.id); setShowLinkProperty(false); toast.success(`Linked to ${p.address}`); }}
        />
      )}
      {showLogMeeting && (
        <LogMeetingModal
          onClose={() => setShowLogMeeting(false)}
          onCreate={(m) => {
            const newMeeting: Meeting = {
              id: `m${Date.now()}`, title: m.title || "", date: m.date || TODAY, time: m.time || "12:00 PM",
              duration: m.duration || "30 min", attendees: ["u1"], entity_type: "lead", entity_id: lead.id,
              notes: m.notes || "", created_at: TODAY,
            };
            setLocalMeetings(prev => [newMeeting, ...prev]);
            toast.success("Meeting logged");
          }}
        />
      )}
      {showCreateTask && (
        <CreateTaskModal
          onClose={() => setShowCreateTask(false)}
          onCreate={(t) => {
            const newTask: Task = {
              id: `t${Date.now()}`, title: t.title || "", description: t.description || "",
              completed: false, due_date: t.due_date || TODAY, priority: t.priority || "Medium",
              assigned_user: t.assigned_user || "u1",
              linked_entity: { type: "lead", id: lead.id, name: lead.title },
              created_at: TODAY,
            };
            setLocalTasks(prev => [newTask, ...prev]);
            toast.success("Task created");
          }}
        />
      )}
    </AppLayout>
  );
}
