import { useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutGrid, List, Plus, Search, X, ChevronDown, ChevronUp, User, MapPin, Calendar } from "lucide-react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import StatusBadge, { priorityVariant, stageVariant } from "@/components/StatusBadge";
import NewLeadModal from "@/components/NewLeadModal";
import {
  leads as initialLeads, PIPELINE_STAGES, users, getUserById, getContactById, getPropertyById,
  getStageLabel, formatCurrency, type Lead, type StageId,
} from "@/data/mockData";

const TODAY = "2024-04-08";

function getFollowUpVariant(date: string | null): "destructive" | "warning" | "outline" {
  if (!date) return "outline";
  if (date < TODAY) return "destructive";
  if (date === TODAY || date === "2024-04-09") return "warning";
  return "outline";
}

// ── Kanban Card ──
function KanbanCard({ lead, onDragStart }: { lead: Lead; onDragStart: (e: React.DragEvent, leadId: string) => void }) {
  const contact = getContactById(lead.contact_id);
  const property = lead.property_id ? getPropertyById(lead.property_id) : null;
  const user = getUserById(lead.assigned_user);

  return (
    <Link
      to={`/leads/${lead.id}`}
      draggable
      onDragStart={(e) => { e.stopPropagation(); onDragStart(e, lead.id); }}
      className="block bg-card border border-border rounded-lg p-3 hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-150 cursor-grab active:cursor-grabbing group"
    >
      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{lead.title}</p>

      {contact && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <User className="h-3 w-3 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground truncate">{contact.name}</p>
        </div>
      )}

      {property && (
        <div className="flex items-center gap-1.5 mt-0.5">
          <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground truncate">{property.address}</p>
        </div>
      )}

      {lead.tags.length > 0 && (
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          {lead.tags.slice(0, 2).map(t => (
            <StatusBadge key={t} variant={t === "Hot" || t === "Urgent" ? "destructive" : t === "Referral" || t === "Motivated" ? "success" : "outline"}>
              {t}
            </StatusBadge>
          ))}
          {lead.tags.length > 2 && <span className="text-[10px] text-muted-foreground">+{lead.tags.length - 2}</span>}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
        {user && (
          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium text-primary" title={user.name}>
            {user.avatar}
          </div>
        )}
        {lead.next_follow_up ? (
          <StatusBadge variant={getFollowUpVariant(lead.next_follow_up)} className="text-[10px]">
            <Calendar className="h-2.5 w-2.5 mr-1" />
            {lead.next_follow_up}
          </StatusBadge>
        ) : (
          <span className="text-[10px] text-muted-foreground">No follow-up</span>
        )}
      </div>
    </Link>
  );
}

// ── Kanban View ──
function KanbanView({
  filteredLeads,
  onStageDrop,
  onDragStart,
}: {
  filteredLeads: Lead[];
  onStageDrop: (leadId: string, newStage: StageId) => void;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
}) {
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDrop = (e: React.DragEvent, stageId: StageId) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("text/plain");
    if (leadId) onStageDrop(leadId, stageId);
    setDragOverStage(null);
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin -mx-6 px-6">
      {PIPELINE_STAGES.map((stage) => {
        const stageLeads = filteredLeads.filter(l => l.stage === stage.id);
        const isOver = dragOverStage === stage.id;
        return (
          <div
            key={stage.id}
            className={`min-w-[272px] w-[272px] shrink-0 rounded-lg border transition-colors ${
              isOver ? "border-primary/50 bg-primary/5" : "border-border bg-secondary/30"
            }`}
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={() => setDragOverStage(null)}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between p-3 border-b border-border">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">{stage.label}</h3>
                <span className="text-xs text-muted-foreground bg-background px-1.5 py-0.5 rounded-md font-medium">{stageLeads.length}</span>
              </div>
              <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Cards */}
            <div className="p-2 space-y-2 min-h-[120px] max-h-[calc(100vh-320px)] overflow-y-auto scrollbar-thin">
              {stageLeads.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No leads in this stage</p>
              ) : (
                stageLeads.map(lead => (
                  <KanbanCard key={lead.id} lead={lead} onDragStart={onDragStart} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── List View ──
type SortKey = "title" | "contact" | "stage" | "priority" | "value" | "follow_up" | "created" | "property" | "assigned";
type SortDir = "asc" | "desc";

const priorityOrder: Record<string, number> = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
const stageOrder: Record<string, number> = Object.fromEntries(PIPELINE_STAGES.map((s, i) => [s.id, i]));

function ListView({ filteredLeads }: { filteredLeads: Lead[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("created");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const navigate = useNavigate();

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const sorted = [...filteredLeads].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "title": cmp = a.title.localeCompare(b.title); break;
      case "contact": cmp = (getContactById(a.contact_id)?.name ?? "").localeCompare(getContactById(b.contact_id)?.name ?? ""); break;
      case "property": {
        const pa = a.property_id ? getPropertyById(a.property_id)?.address ?? "" : "";
        const pb = b.property_id ? getPropertyById(b.property_id)?.address ?? "" : "";
        cmp = pa.localeCompare(pb); break;
      }
      case "stage": cmp = (stageOrder[a.stage] ?? 0) - (stageOrder[b.stage] ?? 0); break;
      case "priority": cmp = (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3); break;
      case "value": cmp = a.estimated_value - b.estimated_value; break;
      case "follow_up": cmp = (a.next_follow_up ?? "9999").localeCompare(b.next_follow_up ?? "9999"); break;
      case "created": cmp = a.created_at.localeCompare(b.created_at); break;
      case "assigned": cmp = (getUserById(a.assigned_user)?.name ?? "").localeCompare(getUserById(b.assigned_user)?.name ?? ""); break;
    }
    return sortDir === "desc" ? -cmp : cmp;
  });

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <th
      className="text-left text-xs font-medium text-muted-foreground px-4 py-3 cursor-pointer hover:text-foreground transition-colors select-none"
      onClick={() => toggleSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortKey === field && (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
      </div>
    </th>
  );

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <SortHeader label="Title" field="title" />
              <SortHeader label="Contact" field="contact" />
              <SortHeader label="Property" field="property" />
              <SortHeader label="Stage" field="stage" />
              <SortHeader label="Assigned To" field="assigned" />
              <SortHeader label="Priority" field="priority" />
              <SortHeader label="Follow-Up" field="follow_up" />
              <SortHeader label="Created" field="created" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((lead, i) => {
              const contact = getContactById(lead.contact_id);
              const property = lead.property_id ? getPropertyById(lead.property_id) : null;
              const user = getUserById(lead.assigned_user);
              return (
                <tr
                  key={lead.id}
                  onClick={() => navigate(`/leads/${lead.id}`)}
                  className={`border-b border-border hover:bg-secondary/40 transition-colors cursor-pointer ${i % 2 === 1 ? "bg-secondary/10" : ""}`}
                >
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-foreground hover:text-primary transition-colors">{lead.title}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{contact?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground truncate max-w-[160px]">{property?.address ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge variant={stageVariant(lead.stage)}>{getStageLabel(lead.stage)}</StatusBadge></td>
                  <td className="px-4 py-3">
                    {user && (
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium text-primary">{user.avatar}</div>
                        <span className="text-sm text-muted-foreground">{user.name}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3"><StatusBadge variant={priorityVariant(lead.priority)}>{lead.priority}</StatusBadge></td>
                  <td className="px-4 py-3">
                    {lead.next_follow_up ? (
                      <StatusBadge variant={getFollowUpVariant(lead.next_follow_up)}>{lead.next_follow_up}</StatusBadge>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{lead.created_at}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Filter Dropdown ──
function FilterDropdown({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`h-9 px-3 flex items-center gap-1.5 rounded-lg border text-sm transition-colors ${
          selected.length > 0
            ? "border-primary/50 bg-primary/10 text-primary"
            : "border-border bg-secondary text-muted-foreground hover:text-foreground"
        }`}
      >
        {label}
        {selected.length > 0 && (
          <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium">{selected.length}</span>
        )}
        <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-52 bg-card border border-border rounded-lg shadow-xl z-50 py-1 animate-scale-in max-h-64 overflow-y-auto scrollbar-thin">
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => onToggle(opt.value)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary/60 transition-colors text-left"
              >
                <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  selected.includes(opt.value) ? "bg-primary border-primary" : "border-border"
                }`}>
                  {selected.includes(opt.value) && <span className="text-primary-foreground text-[10px]">✓</span>}
                </div>
                <span className="text-foreground">{opt.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Leads Page ──
export default function Leads() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const [stageFilters, setStageFilters] = useState<string[]>([]);
  const [userFilters, setUserFilters] = useState<string[]>([]);
  const [priorityFilters, setPriorityFilters] = useState<string[]>([]);
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [leadsData, setLeadsData] = useState<Lead[]>(initialLeads);

  const toggleFilter = (arr: string[], setArr: React.Dispatch<React.SetStateAction<string[]>>) => (value: string) => {
    setArr(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const allTags = Array.from(new Set(leadsData.flatMap(l => l.tags))).filter(Boolean).sort();

  const filteredLeads = leadsData.filter(l => {
    const contact = getContactById(l.contact_id);
    const property = l.property_id ? getPropertyById(l.property_id) : null;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      l.title.toLowerCase().includes(q) ||
      (contact?.name ?? "").toLowerCase().includes(q) ||
      (property?.address ?? "").toLowerCase().includes(q);
    const matchStage = stageFilters.length === 0 || stageFilters.includes(l.stage);
    const matchUser = userFilters.length === 0 || userFilters.includes(l.assigned_user);
    const matchPriority = priorityFilters.length === 0 || priorityFilters.includes(l.priority);
    const matchTag = tagFilters.length === 0 || l.tags.some(t => tagFilters.includes(t));
    return matchSearch && matchStage && matchUser && matchPriority && matchTag;
  });

  const activeFilterCount = stageFilters.length + userFilters.length + priorityFilters.length + tagFilters.length;

  const clearAllFilters = () => {
    setStageFilters([]);
    setUserFilters([]);
    setPriorityFilters([]);
    setTagFilters([]);
    setSearch("");
  };

  const handleDragStart = useCallback((e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("text/plain", leadId);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleStageDrop = useCallback((leadId: string, newStage: StageId) => {
    setLeadsData(prev => {
      const lead = prev.find(l => l.id === leadId);
      if (!lead || lead.stage === newStage) return prev;
      toast.success(`Lead moved to ${getStageLabel(newStage)}`, {
        description: lead.title,
      });
      return prev.map(l => l.id === leadId ? { ...l, stage: newStage } : l);
    });
  }, []);

  const handleCreateLead = (data: Partial<Lead>) => {
    const newLead: Lead = {
      id: `l${Date.now()}`,
      title: data.title || "Untitled Lead",
      stage: "new",
      priority: (data.priority as Lead["priority"]) || "Medium",
      source: data.source || "Website",
      estimated_value: data.estimated_value || 0,
      next_follow_up: data.next_follow_up || null,
      tags: data.tags || [],
      contact_id: "c1",
      property_id: null,
      assigned_user: data.assigned_user || "u1",
      created_at: TODAY,
    };
    setLeadsData(prev => [newLead, ...prev]);
    toast.success("Lead created", { description: newLead.title });
    setShowModal(false);
  };

  // Build active filter pills
  const filterPills: { label: string; onRemove: () => void }[] = [];
  stageFilters.forEach(s => filterPills.push({
    label: getStageLabel(s as StageId),
    onRemove: () => setStageFilters(prev => prev.filter(v => v !== s)),
  }));
  userFilters.forEach(u => filterPills.push({
    label: getUserById(u)?.name ?? u,
    onRemove: () => setUserFilters(prev => prev.filter(v => v !== u)),
  }));
  priorityFilters.forEach(p => filterPills.push({
    label: p,
    onRemove: () => setPriorityFilters(prev => prev.filter(v => v !== p)),
  }));
  tagFilters.forEach(t => filterPills.push({
    label: t,
    onRemove: () => setTagFilters(prev => prev.filter(v => v !== t)),
  }));

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Leads</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{filteredLeads.length} of {leadsData.length} leads</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="h-9 px-4 flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Lead
          </button>
        </div>

        {/* Filters + View Toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>

          <FilterDropdown
            label="Stage"
            options={PIPELINE_STAGES.map(s => ({ value: s.id, label: s.label }))}
            selected={stageFilters}
            onToggle={toggleFilter(stageFilters, setStageFilters)}
          />
          <FilterDropdown
            label="Assigned"
            options={users.map(u => ({ value: u.id, label: u.name }))}
            selected={userFilters}
            onToggle={toggleFilter(userFilters, setUserFilters)}
          />
          <FilterDropdown
            label="Priority"
            options={["Urgent", "High", "Medium", "Low"].map(p => ({ value: p, label: p }))}
            selected={priorityFilters}
            onToggle={toggleFilter(priorityFilters, setPriorityFilters)}
          />
          <FilterDropdown
            label="Tags"
            options={allTags.map(t => ({ value: t, label: t }))}
            selected={tagFilters}
            onToggle={toggleFilter(tagFilters, setTagFilters)}
          />

          <div className="flex items-center border border-border rounded-lg overflow-hidden ml-auto">
            <button
              onClick={() => setView("kanban")}
              className={`h-9 px-3 flex items-center gap-1.5 text-sm font-medium transition-colors ${
                view === "kanban" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Board</span>
            </button>
            <button
              onClick={() => setView("list")}
              className={`h-9 px-3 flex items-center gap-1.5 text-sm font-medium transition-colors ${
                view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>

        {/* Active Filter Pills */}
        {filterPills.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {filterPills.map((pill, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium"
              >
                {pill.label}
                <button onClick={pill.onRemove} className="hover:text-primary-foreground transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Content */}
        {view === "kanban" ? (
          <KanbanView filteredLeads={filteredLeads} onStageDrop={handleStageDrop} onDragStart={handleDragStart} />
        ) : (
          <ListView filteredLeads={filteredLeads} />
        )}
      </div>

      {/* New Lead Modal */}
      {showModal && (
        <NewLeadModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreateLead}
        />
      )}
    </AppLayout>
  );
}
