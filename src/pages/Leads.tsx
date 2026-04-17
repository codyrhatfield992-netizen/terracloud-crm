import { useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutGrid, List, Plus, Search, MapPin, Calendar, X } from "lucide-react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import StatusBadge, { priorityVariant, stageVariant } from "@/components/StatusBadge";
import { useLeads, useCreateLead, useUpdateLead, type DbLead } from "@/hooks/useLeads";
import { useContacts } from "@/hooks/useContacts";
import { useProperties } from "@/hooks/useProperties";
import {
  PIPELINE_STAGES,
  PRIORITIES,
  LEAD_SOURCES,
  formatCurrency,
  formatDate,
  getStageLabel,
  getPriorityLabel,
  isOverdue,
  normalizeStage,
  normalizePriority,
} from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

function followUpVariant(date: string | null): "destructive" | "outline" {
  return isOverdue(date) ? "destructive" : "outline";
}

function KanbanCard({
  lead,
  onDragStart,
  contactName,
  propertyAddress,
}: {
  lead: DbLead;
  onDragStart: (e: React.DragEvent, id: string) => void;
  contactName?: string;
  propertyAddress?: string;
}) {
  return (
    <Link
      to={`/leads/${lead.id}`}
      draggable
      onDragStart={(e) => { e.stopPropagation(); onDragStart(e, lead.id); }}
      className="block bg-card border border-border rounded-lg p-3 hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-150 cursor-grab active:cursor-grabbing group"
    >
      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
        {lead.title}
      </p>
      {contactName && <p className="text-xs text-muted-foreground mt-1.5 truncate">{contactName}</p>}
      {propertyAddress && (
        <div className="flex items-center gap-1.5 mt-0.5">
          <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground truncate">{propertyAddress}</p>
        </div>
      )}
      {lead.tags?.length > 0 && (
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          {lead.tags.slice(0, 2).map((t) => (
            <StatusBadge key={t} variant={t === "Hot" || t === "Urgent" ? "destructive" : "outline"}>
              {t}
            </StatusBadge>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
        <StatusBadge variant={priorityVariant(lead.priority)}>{getPriorityLabel(lead.priority)}</StatusBadge>
        {lead.next_follow_up ? (
          <StatusBadge variant={followUpVariant(lead.next_follow_up)} className="text-[10px]">
            <Calendar className="h-2.5 w-2.5 mr-1" />
            {formatDate(lead.next_follow_up)}
          </StatusBadge>
        ) : (
          <span className="text-[10px] text-muted-foreground">No follow-up</span>
        )}
      </div>
    </Link>
  );
}

function NewLeadModal({
  open,
  onClose,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (l: Partial<DbLead>) => void;
  submitting: boolean;
}) {
  const [title, setTitle] = useState("");
  const [source, setSource] = useState<string>("Website");
  const [priority, setPriority] = useState<string>("medium");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  const reset = () => {
    setTitle(""); setSource("Website"); setPriority("medium");
    setEstimatedValue(""); setNextFollowUp(""); setErrors({});
  };

  const handleSubmit = () => {
    if (!title.trim()) { setErrors({ title: "Required" }); return; }
    onSubmit({
      title: title.trim(),
      source,
      priority,
      estimated_value: parseInt(estimatedValue) || 0,
      next_follow_up: nextFollowUp || null,
      tags: [],
      stage: "new",
    });
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-lg w-full max-w-[560px] mx-4 shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Create New Lead</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Title *</label>
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors({}); }}
              placeholder="e.g., Oak Ridge Wholesale Deal"
              className={`w-full h-9 px-3 rounded-md bg-secondary border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary ${errors.title ? "border-destructive" : "border-border"}`}
              autoFocus
            />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary"
              >
                {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary"
              >
                {PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Estimated Value</label>
              <input
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="0"
                className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Next Follow-Up</label>
              <input
                type="date"
                value={nextFollowUp}
                onChange={(e) => setNextFollowUp(e.target.value)}
                className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary [color-scheme:dark]"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button onClick={onClose} className="h-9 px-4 rounded-md text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="h-9 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating..." : "Create Lead"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Leads() {
  const { data: leads = [], isLoading } = useLeads();
  const { data: contacts = [] } = useContacts();
  const { data: properties = [] } = useProperties();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const navigate = useNavigate();

  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const contactMap = useMemo(() => Object.fromEntries(contacts.map((c) => [c.id, c.name])), [contacts]);
  const propertyMap = useMemo(() => Object.fromEntries(properties.map((p) => [p.id, p.address])), [properties]);

  // Always normalize stage so Kanban placement is reliable.
  const normalizedLeads = useMemo(
    () => leads.map((l) => ({ ...l, stage: normalizeStage(l.stage), priority: normalizePriority(l.priority) })),
    [leads],
  );

  const filtered = useMemo(() => {
    if (!search) return normalizedLeads;
    const q = search.toLowerCase();
    return normalizedLeads.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        (l.contact_id && contactMap[l.contact_id]?.toLowerCase().includes(q)),
    );
  }, [normalizedLeads, search, contactMap]);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleStageDrop = useCallback(
    (leadId: string, newStage: string) => {
      const lead = normalizedLeads.find((l) => l.id === leadId);
      if (!lead || lead.stage === newStage) return;
      updateLead.mutate(
        { id: leadId, stage: newStage },
        { onSuccess: () => toast.success(`Moved to ${getStageLabel(newStage)}`) },
      );
    },
    [normalizedLeads, updateLead],
  );

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Leads</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filtered.length} lead{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-border rounded-md overflow-hidden">
              <button
                onClick={() => setView("kanban")}
                className={`h-9 w-9 flex items-center justify-center transition-colors ${view === "kanban" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`h-9 w-9 flex items-center justify-center transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="h-9 px-4 flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" /> New Lead
            </button>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {isLoading ? (
          <div className="flex gap-3 overflow-x-auto pb-4">
            {PIPELINE_STAGES.slice(0, 5).map((s) => (
              <div key={s.id} className="min-w-[272px] w-[272px] shrink-0 rounded-lg border border-border bg-secondary/30 p-3 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ) : leads.length === 0 && !search ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <LayoutGrid className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">No leads yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Create your first lead to start building your pipeline
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="h-9 px-4 flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" /> New Lead
            </button>
          </div>
        ) : view === "kanban" ? (
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin -mx-6 px-6">
            {PIPELINE_STAGES.map((stage) => {
              const stageLeads = filtered.filter((l) => l.stage === stage.id);
              const isOver = dragOverStage === stage.id;
              return (
                <div
                  key={stage.id}
                  className={`min-w-[272px] w-[272px] shrink-0 rounded-lg border transition-colors ${isOver ? "border-primary/50 bg-primary/5" : "border-border bg-secondary/30"}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage.id); }}
                  onDragLeave={() => setDragOverStage(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData("text/plain");
                    if (id) handleStageDrop(id, stage.id);
                    setDragOverStage(null);
                  }}
                >
                  <div className="flex items-center justify-between p-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{stage.label}</h3>
                      <span className="text-xs text-muted-foreground bg-background px-1.5 py-0.5 rounded-md font-medium">
                        {stageLeads.length}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 space-y-2 min-h-[120px] max-h-[calc(100vh-320px)] overflow-y-auto scrollbar-thin">
                    {stageLeads.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-8">No leads</p>
                    ) : (
                      stageLeads.map((lead) => (
                        <KanbanCard
                          key={lead.id}
                          lead={lead}
                          onDragStart={handleDragStart}
                          contactName={lead.contact_id ? contactMap[lead.contact_id] : undefined}
                          propertyAddress={lead.property_id ? propertyMap[lead.property_id] : undefined}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Title</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Stage</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Priority</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Value</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Follow-Up</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead, i) => (
                    <tr
                      key={lead.id}
                      onClick={() => navigate(`/leads/${lead.id}`)}
                      className={`border-b border-border hover:bg-secondary/40 transition-colors cursor-pointer ${i % 2 === 1 ? "bg-secondary/10" : ""}`}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{lead.title}</td>
                      <td className="px-4 py-3">
                        <StatusBadge variant={stageVariant(lead.stage)}>{getStageLabel(lead.stage)}</StatusBadge>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge variant={priorityVariant(lead.priority)}>{getPriorityLabel(lead.priority)}</StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{formatCurrency(Number(lead.estimated_value))}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {lead.next_follow_up ? formatDate(lead.next_follow_up) : "No date set"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(lead.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <NewLeadModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={(l) => createLead.mutate(l)}
        submitting={createLead.isPending}
      />
    </AppLayout>
  );
}
