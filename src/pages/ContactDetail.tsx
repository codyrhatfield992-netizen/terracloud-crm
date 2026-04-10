import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Mail, Phone, Calendar } from "lucide-react";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { useContact, useUpdateContact, useDeleteContact } from "@/hooks/useContacts";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const typeVariant = (t: string) => {
  switch (t) { case "Seller": return "primary" as const; case "Buyer": return "success" as const; case "Agent": return "warning" as const; default: return "outline" as const; }
};

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: contact, isLoading } = useContact(id);
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();
  const [showDelete, setShowDelete] = useState(false);

  if (isLoading) {
    return <AppLayout><div className="space-y-6"><Skeleton className="h-4 w-32" /><Skeleton className="h-8 w-48" /><Skeleton className="h-40 rounded-lg" /></div></AppLayout>;
  }

  if (!contact) {
    return <AppLayout><div className="text-center py-16 text-muted-foreground">Contact not found. <Link to="/contacts" className="text-primary hover:underline">Back</Link></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1000px]">
        <Link to="/contacts" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Contacts
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{contact.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge variant={typeVariant(contact.type)}>{contact.type}</StatusBadge>
            </div>
          </div>
          <button onClick={() => setShowDelete(true)} className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Contact Info</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground">{contact.email || "No email"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground">{contact.phone || "No phone"}</span>
              </div>
              {contact.source && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Source:</span>
                  <span className="text-sm text-foreground">{contact.source}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">Created {new Date(contact.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Tags</h2>
            {contact.tags.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tags</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {contact.tags.map(t => <span key={t} className="px-2 py-0.5 rounded bg-secondary text-xs font-medium text-foreground">{t}</span>)}
              </div>
            )}
          </div>
        </div>
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowDelete(false)} />
          <div className="relative bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl animate-scale-in">
            <h3 className="text-lg font-semibold text-foreground mb-2">Delete Contact</h3>
            <p className="text-sm text-muted-foreground mb-6">Are you sure? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDelete(false)} className="h-9 px-4 rounded-md text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={() => deleteContact.mutate(contact.id, { onSuccess: () => navigate("/contacts") })} className="h-9 px-4 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
