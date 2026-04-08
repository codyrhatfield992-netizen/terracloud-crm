import { useState } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, List, Plus, Search, Filter } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import StatusBadge, { priorityVariant, stageVariant } from "@/components/StatusBadge";
import {
  leads, PIPELINE_STAGES, getUserById, getContactById, getPropertyById,
  getStageLabel, formatCurrency, type Lead, type StageId,
} from "@/data/mockData";

function KanbanCard({ lead }: { lead: Lead }) {
  const contact = getContactById(lead.contact_id);
  const property = lead.property_id ? getPropertyById(lead.property_id) : null;
  const user = getUserById(lead.assigned_user);

  return (
    <Link
      to={`/leads/${lead.id}`}
      className="block bg-background border border-border rounded-lg p-3 hover:border-primary/40 transition-colors group"
    >
      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{lead.title}</p>
      {contact && <p className="text-xs text-muted-foreground mt-1">{contact.name}</p>}
      {property && <p className="text-xs text-muted-foreground truncate">{property.address}</p>}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <StatusBadge variant={priorityVariant(lead.priority)}>{lead.priority}</StatusBadge>
          {lead.tags.slice(0, 1).map(t => (
            <StatusBadge key={t} variant="outline">{t}</StatusBadge>
          ))}
        </div>
        {user && (
          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium text-primary">
            {user.avatar}
          </div>
        )}
      </div>
      {lead.next_follow_up && (
        <p className="text-[11px] text-muted-foreground mt-2">Follow-up: {lead.next_follow_up}</p>
      )}
    </Link>
  );
}

function KanbanView({ filteredLeads }: { filteredLeads: Lead[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
      {PIPELINE_STAGES.map((stage) => {
        const stageLeads = filteredLeads.filter(l => l.stage === stage.id);
        return (
          <div key={stage.id} className="min-w-[280px] w-[280px] shrink-0">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-foreground">{stage.label}</h3>
                <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{stageLeads.length}</span>
              </div>
            </div>
            <div className="space-y-2">
              {stageLeads.map(lead => (
                <KanbanCard key={lead.id} lead={lead} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({ filteredLeads }: { filteredLeads: Lead[] }) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Lead</th>
            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Contact</th>
            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Stage</th>
            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Priority</th>
            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Value</th>
            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Follow-Up</th>
            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Assigned</th>
          </tr>
        </thead>
        <tbody>
          {filteredLeads.map((lead, i) => {
            const contact = getContactById(lead.contact_id);
            const user = getUserById(lead.assigned_user);
            return (
              <tr key={lead.id} className={`border-b border-border hover:bg-secondary/30 transition-colors ${i % 2 === 1 ? "bg-secondary/10" : ""}`}>
                <td className="px-4 py-3">
                  <Link to={`/leads/${lead.id}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">{lead.title}</Link>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{contact?.name}</td>
                <td className="px-4 py-3"><StatusBadge variant={stageVariant(lead.stage)}>{getStageLabel(lead.stage)}</StatusBadge></td>
                <td className="px-4 py-3"><StatusBadge variant={priorityVariant(lead.priority)}>{lead.priority}</StatusBadge></td>
                <td className="px-4 py-3 text-sm text-foreground">{lead.estimated_value ? formatCurrency(lead.estimated_value) : "—"}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{lead.next_follow_up ?? "—"}</td>
                <td className="px-4 py-3">
                  {user && (
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium text-primary">{user.avatar}</div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Leads() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");

  const filteredLeads = leads.filter(l => {
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === "all" || l.stage === stageFilter;
    return matchSearch && matchStage;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Leads</h1>
            <p className="text-sm text-muted-foreground mt-1">{leads.length} total leads</p>
          </div>
          <button className="h-9 px-4 flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" />
            New Lead
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          >
            <option value="all">All Stages</option>
            {PIPELINE_STAGES.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <div className="flex items-center border border-border rounded-md overflow-hidden">
            <button onClick={() => setView("kanban")} className={`h-9 w-9 flex items-center justify-center transition-colors ${view === "kanban" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setView("list")} className={`h-9 w-9 flex items-center justify-center transition-colors ${view === "list" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {view === "kanban" ? <KanbanView filteredLeads={filteredLeads} /> : <ListView filteredLeads={filteredLeads} />}
      </div>
    </AppLayout>
  );
}
