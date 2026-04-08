import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Building2 } from "lucide-react";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import StatusBadge, { propertyStatusVariant } from "@/components/StatusBadge";
import { getPropertyById, leads, notes, meetings, documents, formatCurrency, getStageLabel, getUserById } from "@/data/mockData";

export default function PropertyDetail() {
  const { id } = useParams();
  const property = getPropertyById(id!);
  const [activeTab, setActiveTab] = useState("notes");

  if (!property) {
    return <AppLayout><div className="text-center py-16 text-muted-foreground">Property not found</div></AppLayout>;
  }

  const linkedLeads = leads.filter(l => l.property_id === property.id);
  const propNotes = notes.filter(n => n.entity_type === "property" && n.entity_id === property.id);
  const propMeetings = meetings.filter(m => m.entity_type === "property" && m.entity_id === property.id);
  const propDocs = documents.filter(d => d.entity_type === "property" && d.entity_id === property.id);

  const tabs = [
    { id: "notes", label: "Notes", count: propNotes.length },
    { id: "meetings", label: "Meetings", count: propMeetings.length },
    { id: "documents", label: "Documents", count: propDocs.length },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Link to="/properties" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Properties
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{property.address}</h1>
            <p className="text-sm text-muted-foreground mt-1">{property.city}, {property.state} {property.zip}</p>
          </div>
          <StatusBadge variant={propertyStatusVariant(property.status)}>{property.status}</StatusBadge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <h2 className="text-sm font-medium text-foreground">Property Details</h2>
              {[
                ["Type", property.type],
                ["Beds", property.beds > 0 ? String(property.beds) : "N/A"],
                ["Baths", property.baths > 0 ? String(property.baths) : "N/A"],
                ["Sq Ft", property.sqft.toLocaleString()],
                ["ARV", formatCurrency(property.arv)],
                ["Asking Price", formatCurrency(property.asking_price)],
                ["Offer Price", property.offer_price ? formatCurrency(property.offer_price) : "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm text-foreground">{value}</span>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <h2 className="text-sm font-medium text-foreground">Linked Leads ({linkedLeads.length})</h2>
              {linkedLeads.map(l => (
                <Link key={l.id} to={`/leads/${l.id}`} className="block hover:text-primary transition-colors">
                  <p className="text-sm font-medium text-foreground">{l.title}</p>
                  <p className="text-xs text-muted-foreground">{getStageLabel(l.stage)}</p>
                </Link>
              ))}
              {linkedLeads.length === 0 && <p className="text-sm text-muted-foreground">No linked leads</p>}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="border-b border-border mb-4">
              <div className="flex gap-6">
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                    {tab.label} {tab.count > 0 && <span className="text-xs text-muted-foreground ml-1">({tab.count})</span>}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "notes" && (
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <textarea placeholder="Add a note..." className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none h-20 focus:outline-none" />
                  <div className="flex justify-end mt-2">
                    <button className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Save Note</button>
                  </div>
                </div>
                {propNotes.map(note => {
                  const author = getUserById(note.author);
                  return (
                    <div key={note.id} className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium text-primary">{author?.avatar}</div>
                        <span className="text-sm font-medium text-foreground">{author?.name}</span>
                        <span className="text-xs text-muted-foreground">{new Date(note.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{note.content}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "meetings" && (
              <div className="space-y-3">
                {propMeetings.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No meetings scheduled</p>}
                {propMeetings.map(m => (
                  <div key={m.id} className="bg-card border border-border rounded-lg p-4">
                    <p className="text-sm font-medium text-foreground">{m.title}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{m.date}</span><span>{m.time}</span><span>{m.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-3">
                {propDocs.map(doc => (
                  <div key={doc.id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{doc.filename}</p>
                      <p className="text-xs text-muted-foreground">{doc.type} · {doc.size} · {doc.upload_date}</p>
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
