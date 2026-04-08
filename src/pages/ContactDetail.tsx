import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Pencil, Trash2, Plus, X, Mail, Phone, Clock,
  Calendar, MapPin, Video, FileText, ExternalLink, Tag, User,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import StatusBadge, { stageVariant } from "@/components/StatusBadge";
import {
  getContactById, getUserById, getPropertyById, getStageLabel,
  formatCurrency, timeAgo, leads as allLeads,
  notes as allNotes, meetings as allMeetings, documents as allDocuments,
  activities as allActivities,
} from "@/data/mockData";

const typeVariant = (t: string) => {
  switch (t) { case "Seller": return "primary" as const; case "Buyer": return "success" as const; case "Agent": return "warning" as const; default: return "outline" as const; }
};

// ── Inline Edit ──
function InlineEdit({ value, onSave, type = "text", className = "" }: {
  value: string; onSave: (v: string) => void; type?: string; className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);
  const commit = () => { setEditing(false); if (draft !== value) { onSave(draft); toast.success("Updated"); } };

  if (!editing) {
    return (
      <button onClick={() => { setDraft(value); setEditing(true); }}
        className={`text-sm text-foreground hover:text-primary transition-colors group flex items-center gap-1.5 ${className}`}>
        {value || "—"}
        <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    );
  }
  return (
    <input ref={ref} type={type} value={draft} onChange={e => setDraft(e.target.value)}
      onBlur={commit} onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
      className="h-8 px-2 rounded-md bg-background border border-primary text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 w-full max-w-[220px]" />
  );
}

// ── Delete Modal ──
function DeleteModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl animate-scale-in">
        <h3 className="text-lg font-semibold text-foreground mb-2">Delete Contact</h3>
        <p className="text-sm text-muted-foreground mb-6">Are you sure? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="h-9 px-4 rounded-md text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          <button onClick={onConfirm} className="h-9 px-4 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const contact = getContactById(id!);

  const [activeTab, setActiveTab] = useState("notes");
  const [showDelete, setShowDelete] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [tags, setTags] = useState<string[]>(contact?.tags || []);
  const [tagInput, setTagInput] = useState("");

  if (!contact) {
    return <AppLayout><div className="text-center py-16 text-muted-foreground">Contact not found</div></AppLayout>;
  }

  const relatedLeads = allLeads.filter(l => l.contact_id === contact.id);
  const relatedPropertyIds = [...new Set(relatedLeads.map(l => l.property_id).filter(Boolean))] as string[];
  const relatedProperties = relatedPropertyIds.map(pid => getPropertyById(pid)).filter(Boolean);

  // Aggregate notes/meetings/docs/activities across contact + related leads
  const contactNotes = allNotes.filter(n =>
    (n.entity_type === "contact" && n.entity_id === contact.id) ||
    (n.entity_type === "lead" && relatedLeads.some(l => l.id === n.entity_id))
  );
  const contactMeetings = allMeetings.filter(m =>
    (m.entity_type === "contact" && m.entity_id === contact.id) ||
    m.attendees.includes(contact.id)
  );
  const contactDocs = allDocuments.filter(d =>
    (d.entity_type === "contact" && d.entity_id === contact.id) ||
    (d.entity_type === "lead" && relatedLeads.some(l => l.id === d.entity_id))
  );
  const contactActivities = allActivities.filter(a =>
    relatedLeads.some(l => l.id === a.entity_id) ||
    (a.entity_type === "contact" && a.entity_id === contact.id)
  );

  // Extra demo notes for c1
  const extraNotes = contactNotes.length === 0 && contact.id === "c1" ? [
    { id: "cn1", content: "Maria confirmed she's ready to move forward with the Oak Ridge deal. Needs to close before May relocation.", author: "u1", entity_type: "contact" as const, entity_id: "c1", created_at: "2024-04-06T15:30:00" },
    { id: "cn2", content: "Sent follow-up email with comparable sales data for the neighborhood. She was impressed with the ARV analysis.", author: "u1", entity_type: "contact" as const, entity_id: "c1", created_at: "2024-03-28T10:00:00" },
    { id: "cn3", content: "Initial contact via direct mail response. Maria called our office, very motivated seller due to job relocation.", author: "u4", entity_type: "contact" as const, entity_id: "c1", created_at: "2024-03-01T14:15:00" },
  ] : contactNotes;

  const extraMeetings = contactMeetings.length === 0 && contact.id === "c1" ? [
    { id: "cm1", title: "Initial Seller Consultation", type: "Phone Call", date: "2024-03-05", time: "2:00 PM", duration: "30 min", summary: "Discussed property condition, timeline, and motivation. Maria is relocating to Portland for work.", author: "u1" },
    { id: "cm2", title: "Property Walk-Through", type: "In-Person", date: "2024-03-12", time: "10:00 AM", duration: "1 hour", summary: "Toured 4521 Oak Ridge Dr. Property in good condition, minor cosmetic work needed.", author: "u1" },
  ] : contactMeetings.map(m => ({ id: m.id, title: m.title, type: "In-Person", date: m.date, time: m.time, duration: m.duration, summary: m.notes, author: "u1" }));

  const tabs = [
    { id: "notes", label: "Notes", count: extraNotes.length },
    { id: "meetings", label: "Meetings", count: extraMeetings.length },
    { id: "documents", label: "Documents", count: contactDocs.length },
    { id: "activity", label: "Activity", count: contactActivities.length },
  ];

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) { setTags([...tags, t]); toast.success("Tag added"); }
    setTagInput("");
  };

  const MeetingIcon = (type: string) => type === "Phone Call" ? Phone : type === "Video Call" ? Video : MapPin;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back */}
        <Link to="/contacts" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Contacts
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <InlineEdit value={contact.name} onSave={() => {}} className="!text-2xl !font-bold" />
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge variant={typeVariant(contact.type)}>{contact.type}</StatusBadge>
            <button onClick={() => setShowDelete(true)} className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left — Tabs (3/5) */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <div className="border-b border-border mb-4">
                <div className="flex gap-1">
                  {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`px-4 pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                      {tab.label} {tab.count > 0 && <span className="text-xs text-muted-foreground ml-1">({tab.count})</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {activeTab === "notes" && (
                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-lg p-4">
                    <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add a note... (⌘+Enter to save)"
                      onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && noteText.trim()) { toast.success("Note saved"); setNoteText(""); } }}
                      className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none h-20 focus:outline-none" />
                    <div className="flex justify-end mt-2">
                      <button onClick={() => { if (noteText.trim()) { toast.success("Note saved"); setNoteText(""); } }}
                        className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50" disabled={!noteText.trim()}>Save Note</button>
                    </div>
                  </div>
                  {extraNotes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No notes yet. Start by adding one above.</p>
                  ) : extraNotes.map(note => {
                    const author = getUserById(note.author);
                    return (
                      <div key={note.id} className="bg-card border border-border rounded-lg p-4 group">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium text-primary">{author?.avatar}</div>
                          <span className="text-sm font-medium text-foreground">{author?.name}</span>
                          <span className="text-xs text-muted-foreground">{timeAgo(note.created_at)}</span>
                          <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground"><Pencil className="h-3 w-3" /></button>
                            <button className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{note.content}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Meetings */}
              {activeTab === "meetings" && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button className="h-8 px-3 flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                      <Plus className="h-3.5 w-3.5" /> Log Meeting
                    </button>
                  </div>
                  {extraMeetings.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No meetings logged</p>
                  ) : extraMeetings.map(m => {
                    const author = getUserById(m.author);
                    const Icon = MeetingIcon(m.type);
                    return (
                      <div key={m.id} className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5"><Icon className="h-4 w-4 text-primary" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{m.title}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{m.date}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{m.time}</span>
                              <span>{m.duration}</span>
                            </div>
                            {m.summary && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{m.summary}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Documents */}
              {activeTab === "documents" && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button className="h-8 px-3 flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                      <Plus className="h-3.5 w-3.5" /> Upload
                    </button>
                  </div>
                  {contactDocs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No documents uploaded</p>
                  ) : contactDocs.map(d => {
                    const uploader = getUserById(d.uploader);
                    return (
                      <div key={d.id} className="bg-card border border-border rounded-lg p-3 flex items-center gap-3 hover:border-primary/30 transition-colors cursor-pointer group">
                        <FileText className="h-4 w-4 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{d.filename}</p>
                          <p className="text-xs text-muted-foreground">{uploader?.name} · {d.upload_date} · {d.size}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Activity */}
              {activeTab === "activity" && (
                <div className="space-y-1">
                  {contactActivities.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
                  ) : contactActivities.map((a, i) => {
                    const author = getUserById(a.user_id);
                    return (
                      <div key={a.id} className="flex gap-3 py-3 relative">
                        {i < contactActivities.length - 1 && <div className="absolute left-3 top-10 bottom-0 w-px bg-border" />}
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium text-primary shrink-0 z-10">{author?.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">
                            <span className="font-medium">{a.user}</span>{" "}
                            <span className="text-muted-foreground">{a.action}</span>{" "}
                            <span className="font-medium">{a.entity}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(a.timestamp)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar (2/5) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <h2 className="text-base font-semibold text-foreground">Contact Info</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <InlineEdit value={contact.email} onSave={() => {}} type="email" />
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <InlineEdit value={contact.phone} onSave={() => {}} type="tel" />
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">Source:</span>
                  <InlineEdit value="Direct Mail" onSave={() => {}} />
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">Created:</span>
                  <span className="text-sm text-foreground">{new Date(contact.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              {/* Tags */}
              <div>
                <span className="text-sm text-muted-foreground block mb-2">Tags</span>
                <div className="flex flex-wrap gap-2">
                  {tags.map(t => (
                    <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium">
                      {t}
                      <button onClick={() => { setTags(tags.filter(x => x !== t)); toast.success("Tag removed"); }} className="hover:text-primary-foreground"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                  <div className="flex items-center gap-1">
                    <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addTag(); }}
                      placeholder="Add tag..." className="h-7 px-2 rounded bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary w-24" />
                    <button onClick={addTag} className="h-7 w-7 flex items-center justify-center rounded bg-secondary hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors"><Plus className="h-3 w-3" /></button>
                  </div>
                </div>
              </div>
            </div>

            {/* Associated Leads */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">Associated Leads</h2>
                <span className="text-xs text-muted-foreground">{relatedLeads.length}</span>
              </div>
              {relatedLeads.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No leads linked to this contact</p>
              ) : (
                <div className="space-y-2">
                  {relatedLeads.map(l => {
                    const prop = l.property_id ? getPropertyById(l.property_id) : null;
                    return (
                      <Link key={l.id} to={`/leads/${l.id}`}
                        className="block bg-secondary/50 rounded-lg p-3 hover:bg-secondary transition-colors group">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{l.title}</p>
                          <StatusBadge variant={stageVariant(l.stage)}>{getStageLabel(l.stage)}</StatusBadge>
                        </div>
                        {prop && <p className="text-xs text-muted-foreground mt-1 truncate">{prop.address}</p>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Related Properties */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">Properties</h2>
                <span className="text-xs text-muted-foreground">{relatedProperties.length}</span>
              </div>
              {relatedProperties.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No properties linked</p>
              ) : (
                <div className="space-y-2">
                  {relatedProperties.map(p => p && (
                    <Link key={p.id} to={`/properties/${p.id}`}
                      className="block bg-secondary/50 rounded-lg p-3 hover:bg-secondary transition-colors group">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{p.address}</p>
                      <p className="text-xs text-muted-foreground mt-1">{p.city}, {p.state} · ARV: {formatCurrency(p.arv)}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DeleteModal open={showDelete} onClose={() => setShowDelete(false)} onConfirm={() => { toast.success("Contact deleted"); navigate("/contacts"); }} />
    </AppLayout>
  );
}
