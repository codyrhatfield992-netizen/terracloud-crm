import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Bed, Bath, Maximize } from "lucide-react";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useProperty, useUpdateProperty, useDeleteProperty } from "@/hooks/useProperties";
import { PROPERTY_STATUSES, formatCurrency, formatDate, normalizePropertyStatus } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: property, isLoading } = useProperty(id);
  const updateProperty = useUpdateProperty();
  const deleteProperty = useDeleteProperty();
  const [showDelete, setShowDelete] = useState(false);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-60 rounded-lg" />
        </div>
      </AppLayout>
    );
  }

  if (!property) {
    return (
      <AppLayout>
        <div className="text-center py-16 text-muted-foreground">
          Property not found. <Link to="/properties" className="text-primary hover:underline">Back</Link>
        </div>
      </AppLayout>
    );
  }

  const status = normalizePropertyStatus(property.status);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1000px]">
        <Link to="/properties" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Properties
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{property.address}</h1>
            <p className="text-sm text-muted-foreground mt-1">{property.city}, {property.state} {property.zip}</p>
            <div className="flex items-center gap-3 mt-3">
              <select
                value={status}
                onChange={(e) => updateProperty.mutate({ id: property.id, status: e.target.value })}
                disabled={updateProperty.isPending}
                className="h-8 px-2 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary disabled:opacity-60"
              >
                {PROPERTY_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-secondary text-secondary-foreground">{property.property_type}</span>
            </div>
          </div>
          <button onClick={() => setShowDelete(true)} className="h-9 px-4 flex items-center gap-2 rounded-lg border border-border text-sm text-destructive hover:bg-destructive/10 transition-colors shrink-0">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Property Details</h2>
            <div className="space-y-3">
              {(property.beds > 0 || property.baths > 0 || property.sqft > 0) && (
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  {property.beds > 0 && <span className="flex items-center gap-1.5"><Bed className="h-4 w-4" />{property.beds} beds</span>}
                  {property.baths > 0 && <span className="flex items-center gap-1.5"><Bath className="h-4 w-4" />{property.baths} baths</span>}
                  {property.sqft > 0 && <span className="flex items-center gap-1.5"><Maximize className="h-4 w-4" />{property.sqft.toLocaleString()} sqft</span>}
                </div>
              )}
              <Row label="ARV">{formatCurrency(Number(property.arv))}</Row>
              <Row label="Asking Price">{formatCurrency(Number(property.asking_price))}</Row>
              <Row label="Offer Price">{Number(property.offer_price) > 0 ? formatCurrency(Number(property.offer_price)) : "—"}</Row>
              <Row label="Created">{formatDate(property.created_at)}</Row>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Notes</h2>
            <p className="text-sm text-muted-foreground">{property.notes || "No notes yet."}</p>
          </div>
        </div>
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowDelete(false)} />
          <div className="relative bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl animate-scale-in">
            <h3 className="text-lg font-semibold text-foreground mb-2">Delete Property</h3>
            <p className="text-sm text-muted-foreground mb-6">Are you sure? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDelete(false)} className="h-9 px-4 rounded-md text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button
                onClick={() => deleteProperty.mutate(property.id, { onSuccess: () => navigate("/properties") })}
                disabled={deleteProperty.isPending}
                className="h-9 px-4 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 disabled:opacity-60"
              >
                {deleteProperty.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{children}</span>
    </div>
  );
}
