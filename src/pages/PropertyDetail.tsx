import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Pencil, Trash2, Plus, Upload, Phone, Video, MapPin,
  X, Clock, FileText, Image, ClipboardCheck, File, ChevronDown,
  Calendar, User, Search, ExternalLink,
} from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import StatusBadge, { propertyStatusVariant, stageVariant, priorityVariant } from "@/components/StatusBadge";
import {
  getPropertyById, getUserById, getContactById, getStageLabel,
  formatCurrency, timeAgo, users, leads as allLeads,
  notes as allNotes, meetings as allMeetings, documents as allDocuments,
  activities as allActivities, type Property, type Lead,
} from "@/data/mockData";

const TODAY = "2024-04-08";
const PROPERTY_TYPES = ["Single Family", "Multi Family", "Condo", "Townhouse", "Land", "Commercial"] as const;
const STATUSES: Property["status"][] = ["Available", "Under Contract", "Sold", "Off Market"];
const DOC_FILTERS = ["All", "Photo", "Inspection", "Contract", "Other"] as const;

// ── Inline Edit ──
function InlineEdit({ value, onSave, type = "text", prefix, className = "" }: {
  value: string; onSave: (v: string) => void; type?: string; prefix?: string; className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

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
    <input ref={ref} type={type} value={draft} onChange={e => setDraft(e.target.value)}
      onBlur={commit} onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
      className="h-8 px-2 rounded-md bg-background border border-primary text-sm text-foreground text-right focus:outline-none focus:ring-1 focus:ring-primary/30 w-full max-w-[180px]" />
  );
}

// ── Dropdown ──
function DropdownSelect<T extends string>({ value, options, onSelect, renderValue }: {
  value: T; options: { value: T; label: string }[]; onSelect: (v: T) => void; renderValue?: (v: T) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  const label = options.find(o => o.value === value)?.label || value;
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 text-sm text-foreground hover:text-primary transition-colors">
        {renderValue ? renderValue(value) : label}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute top-full mt-1 right-0 z-30 bg-popover border border-border rounded-lg shadow-xl py-1 min-w-[160px] animate-fade-in">
          {options.map(o => (
            <button key={o.value} onClick={() => { onSelect(o.value); setOpen(false); toast.success(`Updated to ${o.label}`); }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${o.value === value ? "text-primary bg-primary/10" : "text-foreground hover:bg-secondary"}`}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Delete Confirm Modal ──
function DeleteConfirmModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl animate-scale-in">
        <h3 className="text-lg font-semibold text-foreground mb-2">Delete Property</h3>
        <p className="text-sm text-muted-foreground mb-6">Are you sure? This action cannot be undone. All linked notes, meetings, and documents will also be removed.</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="h-9 px-4 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
          <button onClick={onConfirm} className="h-9 px-4 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Link Lead Modal ──
function LinkLeadModal({ open, onClose, existingIds, propertyName }: { open: boolean; onClose: () => void; existingIds: string[]; propertyName: string }) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"search" | "create">("search");
  if (!open) return null;
  const available = allLeads.filter(l => !existingIds.includes(l.id) && (l.title.toLowerCase().includes(search.toLowerCase()) || getContactById(l.contact_id)?.name.toLowerCase().includes(search.toLowerCase())));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-lg max-w-lg w-full mx-4 shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">Link Lead</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex border-b border-border">
          {(["search", "create"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}>
              {t === "search" ? "Search Leads" : "Create New Lead"}
            </button>
          ))}
        </div>
        {tab === "search" ? (
          <div className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads by title or contact..."
                className="w-full h-9 pl-9 pr-4 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
            </div>
            <div className="max-h-[300px] overflow-y-auto scrollbar-thin space-y-1">
              {available.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No matching leads found</p>}
              {available.map(l => {
                const contact = getContactById(l.contact_id);
                return (
                  <button key={l.id} onClick={() => { toast.success(`Linked "${l.title}"`); onClose(); }}
                    className="w-full text-left px-3 py-2.5 rounded-md hover:bg-secondary transition-colors">
                    <p className="text-sm font-medium text-foreground">{l.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{contact?.name}</span>
                      <StatusBadge variant={stageVariant(l.stage)}>{getStageLabel(l.stage)}</StatusBadge>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Lead Title *</label>
              <input placeholder="e.g., Wholesale Deal" className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Property</label>
              <input value={propertyName} readOnly className="w-full h-9 px-3 rounded-md bg-muted border border-border text-sm text-muted-foreground" />
            </div>
            <div className="flex justify-end">
              <button onClick={() => { toast.success("Lead created & linked"); onClose(); }}
                className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Create & Link</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Log Meeting Modal ──
function LogMeetingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-lg max-w-lg w-full mx-4 shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">Log Meeting</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-4 space-y-3">
          <div><label className="block text-xs font-medium text-muted-foreground mb-1">Title *</label><input placeholder="Meeting title" className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">Type</label>
              <select className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary">
                <option>In-Person</option><option>Phone Call</option><option>Video Call</option>
              </select>
            </div>
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">Duration</label><input placeholder="1 hour" className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">Date</label><input type="date" className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary" /></div>
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">Time</label><input type="time" className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary" /></div>
          </div>
          <div><label className="block text-xs font-medium text-muted-foreground mb-1">Summary</label><textarea placeholder="Meeting notes..." className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary h-20 resize-none" /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose} className="h-9 px-4 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            <button onClick={() => { toast.success("Meeting logged"); onClose(); }} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Log Meeting</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──
export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const property = getPropertyById(id!);

  const [activeTab, setActiveTab] = useState("notes");
  const [status, setStatus] = useState(property?.status || "Available");
  const [showDelete, setShowDelete] = useState(false);
  const [showLinkLead, setShowLinkLead] = useState(false);
  const [showMeeting, setShowMeeting] = useState(false);
  const [docFilter, setDocFilter] = useState<string>("All");
  const [noteText, setNoteText] = useState("");
  const [tags, setTags] = useState<string[]>(["Investment", "Rehab Needed"]);
  const [tagInput, setTagInput] = useState("");

  if (!property) {
    return <AppLayout><div className="text-center py-16 text-muted-foreground">Property not found</div></AppLayout>;
  }

  const linkedLeads = allLeads.filter(l => l.property_id === property.id);
  const propNotes = allNotes.filter(n => n.entity_type === "property" && n.entity_id === property.id);
  const propMeetings = allMeetings.filter(m => m.entity_type === "property" && m.entity_id === property.id);
  const propDocs = allDocuments.filter(d => d.entity_type === "property" && d.entity_id === property.id);
  const propActivities = allActivities.filter(a => a.entity_type === "property" && a.entity_id === property.id);

  // Supplementary mock data for richer demo
  const extraNotes = propNotes.length === 0 && property.id === "p1" ? [
    { id: "pn1", content: "Title search came back clean. No liens or encumbrances. Ready to proceed with closing.", author: "u1", created_at: "2024-04-05T14:00:00" },
    { id: "pn2", content: "Contractor walked the property. Estimated rehab $32K — roof, HVAC, and cosmetic updates.", author: "u2", created_at: "2024-03-28T11:30:00" },
    { id: "pn3", content: "Drove by the property. Exterior in decent shape, yard overgrown. Neighbors say owner relocated 6 months ago.", author: "u4", created_at: "2024-03-15T09:45:00" },
  ] : propNotes.map(n => ({ id: n.id, content: n.content, author: n.author, created_at: n.created_at }));

  const extraMeetings = propMeetings.length === 0 && property.id === "p1" ? [
    { id: "pm1", title: "Property Inspection", type: "In-Person", date: "2024-03-25", time: "9:00 AM", duration: "2 hours", summary: "Full inspection with licensed inspector. Minor issues found — see report.", author: "u1", created_at: "2024-03-20" },
    { id: "pm2", title: "Contractor Walk-Through", type: "In-Person", date: "2024-03-28", time: "1:00 PM", duration: "1.5 hours", summary: "Got rehab estimate. Scope of work drafted.", author: "u2", created_at: "2024-03-26" },
  ] : propMeetings.map(m => ({ id: m.id, title: m.title, type: "In-Person", date: m.date, time: m.time, duration: m.duration, summary: m.notes, author: "u1", created_at: m.created_at }));

  const extraDocs = propDocs.length > 0 ? propDocs.map(d => ({ ...d, docCategory: d.type === "Contract" ? "Contract" : d.type === "Image" ? "Photo" : d.type === "PDF" ? "Inspection" : "Other" })) : property.id === "p1" ? [
    { id: "pd1", filename: "Front_Exterior.jpg", type: "Image" as const, docCategory: "Photo", uploader: "u1", upload_date: "2024-03-05", size: "4.2 MB" },
    { id: "pd2", filename: "Kitchen_Before.jpg", type: "Image" as const, docCategory: "Photo", uploader: "u1", upload_date: "2024-03-05", size: "3.8 MB" },
    { id: "pd3", filename: "Inspection_Report.pdf", type: "PDF" as const, docCategory: "Inspection", uploader: "u2", upload_date: "2024-03-26", size: "5.1 MB" },
    { id: "pd4", filename: "Purchase_Agreement.pdf", type: "Contract" as const, docCategory: "Contract", uploader: "u1", upload_date: "2024-03-20", size: "2.4 MB" },
    { id: "pd5", filename: "Rehab_SOW.pdf", type: "PDF" as const, docCategory: "Other", uploader: "u2", upload_date: "2024-03-29", size: "1.1 MB" },
  ] : [];

  const extraActivities = propActivities.length > 0 ? propActivities : property.id === "p1" ? [
    { id: "pa1", action: "uploaded Purchase Agreement", user: "Alex Rivera", user_id: "u1", timestamp: "2024-03-20T14:00:00" },
    { id: "pa2", action: "updated ARV to $385,000", user: "Jordan Kim", user_id: "u2", timestamp: "2024-03-18T10:30:00" },
    { id: "pa3", action: "added property photos", user: "Alex Rivera", user_id: "u1", timestamp: "2024-03-05T16:00:00" },
    { id: "pa4", action: "created this property", user: "Alex Rivera", user_id: "u1", timestamp: "2024-03-01T09:00:00" },
  ] : [];

  const filteredDocs = docFilter === "All" ? extraDocs : extraDocs.filter(d => d.docCategory === docFilter);

  const tabs = [
    { id: "notes", label: "Notes", count: extraNotes.length },
    { id: "meetings", label: "Meetings", count: extraMeetings.length },
    { id: "documents", label: "Documents", count: extraDocs.length },
    { id: "activity", label: "Activity", count: extraActivities.length },
  ];

  const docIcon = (cat: string) => {
    switch (cat) {
      case "Photo": return <Image className="h-4 w-4 text-primary" />;
      case "Inspection": return <ClipboardCheck className="h-4 w-4 text-warning" />;
      case "Contract": return <FileText className="h-4 w-4 text-success" />;
      default: return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) { setTags([...tags, t]); toast.success("Tag added"); }
    setTagInput("");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back */}
        <Link to="/properties" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Properties
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <InlineEdit value={property.address} onSave={() => {}} className="!text-2xl !font-bold !text-left" />
            <p className="text-sm text-muted-foreground mt-1">{property.city}, {property.state} {property.zip}</p>
          </div>
          <div className="flex items-center gap-3">
            <DropdownSelect
              value={status}
              options={STATUSES.map(s => ({ value: s, label: s }))}
              onSelect={setStatus}
              renderValue={(v) => <StatusBadge variant={propertyStatusVariant(v)}>{v}</StatusBadge>}
            />
            <button onClick={() => setShowDelete(true)} className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left (3/5) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Details Card */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h2 className="text-base font-semibold text-foreground">Property Details</h2>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <DropdownSelect value={property.type} options={PROPERTY_TYPES.map(t => ({ value: t, label: t }))} onSelect={() => {}} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bedrooms</span>
                  <InlineEdit value={String(property.beds)} onSave={() => {}} type="number" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bathrooms</span>
                  <InlineEdit value={String(property.baths)} onSave={() => {}} type="number" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Square Feet</span>
                  <InlineEdit value={property.sqft.toLocaleString()} onSave={() => {}} type="text" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">ARV</span>
                  <InlineEdit value={formatCurrency(property.arv)} onSave={() => {}} prefix="" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Asking Price</span>
                  <InlineEdit value={formatCurrency(property.asking_price)} onSave={() => {}} prefix="" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Offer Price</span>
                  <InlineEdit value={property.offer_price ? formatCurrency(property.offer_price) : "—"} onSave={() => {}} prefix="" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm text-muted-foreground">{new Date(property.created_at).toLocaleDateString()}</span>
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

            {/* Tabs */}
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

              {/* Notes Tab */}
              {activeTab === "notes" && (
                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-lg p-4">
                    <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add a note... (⌘+Enter to save)"
                      onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && noteText.trim()) { toast.success("Note saved"); setNoteText(""); } }}
                      className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none h-20 focus:outline-none" />
                    <div className="flex justify-end mt-2">
                      <button onClick={() => { if (noteText.trim()) { toast.success("Note saved"); setNoteText(""); } }}
                        className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                        disabled={!noteText.trim()}>Save Note</button>
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

              {/* Meetings Tab */}
              {activeTab === "meetings" && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button onClick={() => setShowMeeting(true)} className="h-8 px-3 flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                      <Plus className="h-3.5 w-3.5" /> Log Meeting
                    </button>
                  </div>
                  {extraMeetings.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No meetings logged</p>
                  ) : extraMeetings.map(m => {
                    const author = getUserById(m.author);
                    const TypeIcon = m.type === "Phone Call" ? Phone : m.type === "Video Call" ? Video : MapPin;
                    return (
                      <div key={m.id} className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5"><TypeIcon className="h-4 w-4 text-primary" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{m.title}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{m.date}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{m.time}</span>
                              <span>{m.duration}</span>
                            </div>
                            {m.summary && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{m.summary}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === "documents" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {DOC_FILTERS.map(f => (
                        <button key={f} onClick={() => setDocFilter(f)}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${docFilter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                          {f}
                        </button>
                      ))}
                    </div>
                    <button className="h-8 px-3 flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                      <Upload className="h-3.5 w-3.5" /> Upload
                    </button>
                  </div>
                  {/* Photo grid for photos */}
                  {docFilter === "Photo" || (docFilter === "All" && filteredDocs.some(d => d.docCategory === "Photo")) ? (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Photos</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {filteredDocs.filter(d => d.docCategory === "Photo").map(d => (
                          <div key={d.id} className="bg-secondary rounded-lg aspect-[4/3] flex flex-col items-center justify-center group cursor-pointer hover:ring-1 hover:ring-primary/40 transition-all">
                            <Image className="h-8 w-8 text-muted-foreground/30 mb-2" />
                            <p className="text-xs text-muted-foreground truncate max-w-[90%]">{d.filename}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {/* File list for non-photos */}
                  {filteredDocs.filter(d => docFilter === "All" ? d.docCategory !== "Photo" : true).filter(d => d.docCategory !== "Photo").length > 0 && (
                    <div className="space-y-2">
                      {docFilter === "All" && <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Files</p>}
                      {filteredDocs.filter(d => d.docCategory !== "Photo").map(d => {
                        const uploader = getUserById(d.uploader);
                        return (
                          <div key={d.id} className="bg-card border border-border rounded-lg p-3 flex items-center gap-3 hover:border-primary/30 transition-colors cursor-pointer group">
                            {docIcon(d.docCategory)}
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
                  {filteredDocs.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No documents uploaded</p>}
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === "activity" && (
                <div className="space-y-1">
                  {extraActivities.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
                  ) : extraActivities.map((a, i) => {
                    const author = getUserById(a.user_id);
                    return (
                      <div key={a.id} className="flex gap-3 py-3 relative">
                        {i < extraActivities.length - 1 && <div className="absolute left-3 top-10 bottom-0 w-px bg-border" />}
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium text-primary shrink-0 z-10">{author?.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">
                            <span className="font-medium">{a.user}</span>{" "}
                            <span className="text-muted-foreground">{a.action}</span>
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
            {/* Linked Leads */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">Associated Leads</h2>
                <span className="text-xs text-muted-foreground">{linkedLeads.length}</span>
              </div>
              {linkedLeads.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No leads linked to this property yet</p>
              ) : (
                <div className="space-y-2">
                  {linkedLeads.map(l => {
                    const contact = getContactById(l.contact_id);
                    const assignee = getUserById(l.assigned_user);
                    return (
                      <Link key={l.id} to={`/leads/${l.id}`}
                        className="block bg-secondary/50 rounded-lg p-3 hover:bg-secondary transition-colors group">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{l.title}</p>
                          <StatusBadge variant={stageVariant(l.stage)}>{getStageLabel(l.stage)}</StatusBadge>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            {assignee && (
                              <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-medium text-primary">{assignee.avatar}</div>
                            )}
                            <span className="text-xs text-muted-foreground">{contact?.name}</span>
                          </div>
                          {l.next_follow_up && (
                            <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${l.next_follow_up < TODAY ? "bg-destructive/15 text-destructive" : l.next_follow_up === TODAY ? "bg-warning/15 text-warning" : "text-muted-foreground"}`}>
                              {new Date(l.next_follow_up).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
              <button onClick={() => setShowLinkLead(true)}
                className="w-full h-9 flex items-center justify-center gap-2 rounded-md border border-dashed border-border text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
                <Plus className="h-3.5 w-3.5" /> Link Lead
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <h2 className="text-base font-semibold text-foreground">Property Summary</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Spread", value: property.offer_price ? formatCurrency(property.arv - property.offer_price) : "—" },
                  { label: "ROI", value: property.offer_price ? `${Math.round(((property.arv - property.offer_price) / property.offer_price) * 100)}%` : "—" },
                  { label: "Price/sqft", value: property.sqft > 0 ? `$${Math.round(property.asking_price / property.sqft)}` : "—" },
                  { label: "Days Listed", value: `${Math.round((new Date(TODAY).getTime() - new Date(property.created_at).getTime()) / 86400000)}` },
                ].map(s => (
                  <div key={s.label} className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-lg font-bold text-foreground mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DeleteConfirmModal open={showDelete} onClose={() => setShowDelete(false)} onConfirm={() => { toast.success("Property deleted"); navigate("/properties"); }} />
      <LinkLeadModal open={showLinkLead} onClose={() => setShowLinkLead(false)} existingIds={linkedLeads.map(l => l.id)} propertyName={property.address} />
      <LogMeetingModal open={showMeeting} onClose={() => setShowMeeting(false)} />
    </AppLayout>
  );
}
