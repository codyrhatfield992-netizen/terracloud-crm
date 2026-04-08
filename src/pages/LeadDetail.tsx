import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Tag, User, DollarSign, Clock, FileText, CheckSquare, MessageSquare } from "lucide-react";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import StatusBadge, { priorityVariant, stageVariant } from "@/components/StatusBadge";
import {
  getLeadById, getContactById, getPropertyById, getUserById,
  PIPELINE_STAGES, formatCurrency, getStageLabel,
  notes, tasks, meetings, documents, activities,
} from "@/data/mockData";

export default function LeadDetail() {
  const { id } = useParams();
  const lead = getLeadById(id!);
  const [activeTab, setActiveTab] = useState("notes");

  if (!lead) {
    return (
      <AppLayout>
        <div className="text-center py-16 text-muted-foreground">Lead not found</div>
      </AppLayout>
    );
  }

  const contact = getContactById(lead.contact_id);
  const property = lead.property_id ? getPropertyById(lead.property_id) : null;
  const user = getUserById(lead.assigned_user);

  const leadNotes = notes.filter(n => n.entity_type === "lead" && n.entity_id === lead.id);
  const leadTasks = tasks.filter(t => t.linked_entity?.type === "lead" && t.linked_entity.id === lead.id);
  const leadMeetings = meetings.filter(m => m.entity_type === "lead" && m.entity_id === lead.id);
  const leadDocs = documents.filter(d => d.entity_type === "lead" && d.entity_id === lead.id);

  const tabs = [
    { id: "notes", label: "Notes", count: leadNotes.length },
    { id: "tasks", label: "Tasks", count: leadTasks.length },
    { id: "meetings", label: "Meetings", count: leadMeetings.length },
    { id: "documents", label: "Documents", count: leadDocs.length },
    { id: "activity", label: "Activity", count: 0 },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back */}
        <Link to="/leads" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Leads
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{lead.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge variant={stageVariant(lead.stage)}>{getStageLabel(lead.stage)}</StatusBadge>
              <StatusBadge variant={priorityVariant(lead.priority)}>{lead.priority}</StatusBadge>
              {user && <span className="text-sm text-muted-foreground">Assigned to {user.name}</span>}
            </div>
          </div>
          <button className="h-9 px-4 rounded-md border border-border text-sm text-destructive hover:bg-destructive/10 transition-colors">Delete</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Info */}
          <div className="space-y-4">
            {/* Key Info */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <h2 className="text-sm font-medium text-foreground">Key Info</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Source</span>
                  <span className="text-sm text-foreground">{lead.source}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm text-foreground">{lead.created_at}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Follow-Up</span>
                  <span className="text-sm text-foreground">{lead.next_follow_up ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Est. Value</span>
                  <span className="text-sm text-foreground">{formatCurrency(lead.estimated_value)}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm text-muted-foreground">Tags</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {lead.tags.map(t => <StatusBadge key={t} variant="outline">{t}</StatusBadge>)}
                  </div>
                </div>
              </div>
            </div>

            {/* Linked Records */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <h2 className="text-sm font-medium text-foreground">Linked Records</h2>
              {contact && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Contact</p>
                  <Link to={`/contacts/${contact.id}`} className="block hover:text-primary transition-colors">
                    <p className="text-sm font-medium text-foreground">{contact.name}</p>
                    <p className="text-xs text-muted-foreground">{contact.email} · {contact.phone}</p>
                  </Link>
                </div>
              )}
              {property && (
                <div className="space-y-2 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Property</p>
                  <Link to={`/properties/${property.id}`} className="block hover:text-primary transition-colors">
                    <p className="text-sm font-medium text-foreground">{property.address}</p>
                    <p className="text-xs text-muted-foreground">{property.city}, {property.state} · ARV: {formatCurrency(property.arv)}</p>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right column - Tabs */}
          <div className="lg:col-span-2">
            <div className="border-b border-border mb-4">
              <div className="flex gap-6">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label} {tab.count > 0 && <span className="text-xs text-muted-foreground ml-1">({tab.count})</span>}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "notes" && (
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <textarea
                    placeholder="Add a note..."
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none h-20 focus:outline-none"
                  />
                  <div className="flex justify-end mt-2">
                    <button className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Save Note</button>
                  </div>
                </div>
                {leadNotes.map(note => {
                  const author = getUserById(note.author);
                  return (
                    <div key={note.id} className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium text-primary">
                          {author?.avatar}
                        </div>
                        <span className="text-sm font-medium text-foreground">{author?.name}</span>
                        <span className="text-xs text-muted-foreground">{new Date(note.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{note.content}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "tasks" && (
              <div className="space-y-3">
                <button className="h-8 px-4 rounded-md border border-border text-sm text-foreground hover:bg-secondary transition-colors">Create Task</button>
                {leadTasks.map(task => (
                  <div key={task.id} className="bg-card border border-border rounded-lg p-4 flex items-start gap-3">
                    <div className={`mt-0.5 h-4 w-4 rounded border shrink-0 ${task.completed ? "bg-primary border-primary" : "border-border"}`} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${task.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">{task.due_date}</span>
                        <StatusBadge variant={priorityVariant(task.priority)}>{task.priority}</StatusBadge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "meetings" && (
              <div className="space-y-3">
                {leadMeetings.map(m => (
                  <div key={m.id} className="bg-card border border-border rounded-lg p-4">
                    <p className="text-sm font-medium text-foreground">{m.title}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{m.date}</span>
                      <span>{m.time}</span>
                      <span>{m.duration}</span>
                    </div>
                    {m.notes && <p className="text-sm text-muted-foreground mt-2">{m.notes}</p>}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-3">
                {leadDocs.map(doc => (
                  <div key={doc.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{doc.filename}</p>
                        <p className="text-xs text-muted-foreground">{doc.type} · {doc.size} · {doc.upload_date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "activity" && (
              <div className="space-y-3">
                {activities.filter(a => a.entity_type === "lead").slice(0, 5).map(a => (
                  <div key={a.id} className="flex items-start gap-3 py-2">
                    <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-medium text-muted-foreground shrink-0">
                      {a.user.split(" ").map(w => w[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{a.user}</span>{" "}
                        <span className="text-muted-foreground">{a.action}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(a.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
