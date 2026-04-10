import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, DollarSign, Trash2, X } from "lucide-react";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import StatusBadge, { priorityVariant, stageVariant } from "@/components/StatusBadge";
import { useLead, useUpdateLead, useDeleteLead } from "@/hooks/useLeads";
import { useContact } from "@/hooks/useContacts";
import { useProperty } from "@/hooks/useProperties";
import { PIPELINE_STAGES, getStageLabel, formatCurrency } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: lead, isLoading } = useLead(id);
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const { data: contact } = useContact(lead?.contact_id || undefined);
  const { data: property } = useProperty(lead?.property_id || undefined);
  const [showDelete, setShowDelete] = useState(false);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 max-w-[1000px]">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
          </div>
        </div>
      </AppLayout>
    );
  }

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

  const handleDelete = () => {
    deleteLead.mutate(lead.id, { onSuccess: () => navigate("/leads") });
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1000px]">
        <Link to="/leads" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Leads
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-foreground">{lead.title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <select value={lead.stage} onChange={e => { updateLead.mutate({ id: lead.id, stage: e.target.value }); toast.success(`Stage updated`); }}
                className="h-8 px-2 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary">
                {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <StatusBadge variant={priorityVariant(lead.priority)}>{lead.priority}</StatusBadge>
            </div>
          </div>
          <button onClick={() => setShowDelete(true)} className="h-9 px-4 flex items-center gap-2 rounded-lg border border-border text-sm text-destructive hover:bg-destructive/10 transition-colors shrink-0">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Details</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Source</span>
                <span className="text-sm text-foreground">{lead.source || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" />Est. Value</span>
                <span className="text-sm text-foreground">{formatCurrency(Number(lead.estimated_value))}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Follow-Up</span>
                <span className="text-sm text-foreground">{lead.next_follow_up || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm text-muted-foreground">{new Date(lead.created_at).toLocaleDateString()}</span>
              </div>
              {lead.tags.length > 0 && (
                <div className="flex items-start justify-between">
                  <span className="text-sm text-muted-foreground mt-1">Tags</span>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {lead.tags.map(t => <span key={t} className="px-2 py-0.5 rounded bg-secondary text-xs font-medium text-foreground">{t}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {contact && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-base font-semibold text-foreground mb-3">Linked Contact</h2>
                <Link to={`/contacts/${contact.id}`} className="text-sm text-primary hover:underline">{contact.name}</Link>
                <p className="text-xs text-muted-foreground mt-1">{contact.email} · {contact.phone}</p>
              </div>
            )}
            {property && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-base font-semibold text-foreground mb-3">Linked Property</h2>
                <Link to={`/properties/${property.id}`} className="text-sm text-primary hover:underline">{property.address}</Link>
                <p className="text-xs text-muted-foreground mt-1">{property.city}, {property.state} · ARV: {formatCurrency(Number(property.arv))}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowDelete(false)} />
          <div className="relative bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl animate-scale-in">
            <h3 className="text-lg font-semibold text-foreground mb-2">Delete Lead</h3>
            <p className="text-sm text-muted-foreground mb-6">Are you sure? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDelete(false)} className="h-9 px-4 rounded-md text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={handleDelete} className="h-9 px-4 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
