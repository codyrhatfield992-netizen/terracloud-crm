import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { getContactById, leads, notes, meetings, documents, getUserById, getStageLabel } from "@/data/mockData";

export default function ContactDetail() {
  const { id } = useParams();
  const contact = getContactById(id!);
  const [activeTab, setActiveTab] = useState("notes");

  if (!contact) {
    return <AppLayout><div className="text-center py-16 text-muted-foreground">Contact not found</div></AppLayout>;
  }

  const relatedLeads = leads.filter(l => l.contact_id === contact.id);
  const contactNotes = notes.filter(n => n.entity_type === "contact" && n.entity_id === contact.id);
  const contactMeetings = meetings.filter(m => m.entity_type === "contact" && m.entity_id === contact.id);

  return (
    <AppLayout>
      <div className="space-y-6">
        <Link to="/contacts" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Contacts
        </Link>

        <div>
          <h1 className="text-2xl font-semibold text-foreground">{contact.name}</h1>
          <StatusBadge variant="primary" className="mt-2">{contact.type}</StatusBadge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <h2 className="text-sm font-medium text-foreground">Contact Info</h2>
              {[["Email", contact.email], ["Phone", contact.phone], ["Created", contact.created_at]].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{l}</span>
                  <span className="text-sm text-foreground">{v}</span>
                </div>
              ))}
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">Tags</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {contact.tags.map(t => <StatusBadge key={t} variant="outline">{t}</StatusBadge>)}
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <h2 className="text-sm font-medium text-foreground">Related Leads ({relatedLeads.length})</h2>
              {relatedLeads.map(l => (
                <Link key={l.id} to={`/leads/${l.id}`} className="block hover:text-primary transition-colors">
                  <p className="text-sm font-medium text-foreground">{l.title}</p>
                  <p className="text-xs text-muted-foreground">{getStageLabel(l.stage)}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="border-b border-border mb-4 flex gap-6">
              {["notes", "meetings"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-medium transition-colors border-b-2 capitalize ${activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "notes" && (
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <textarea placeholder="Add a note..." className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none h-20 focus:outline-none" />
                  <div className="flex justify-end mt-2">
                    <button className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Save Note</button>
                  </div>
                </div>
                {contactNotes.map(note => {
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
                {contactMeetings.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No meetings</p>}
                {contactMeetings.map(m => (
                  <div key={m.id} className="bg-card border border-border rounded-lg p-4">
                    <p className="text-sm font-medium text-foreground">{m.title}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{m.date}</span><span>{m.time}</span><span>{m.duration}</span>
                    </div>
                    {m.notes && <p className="text-sm text-muted-foreground mt-2">{m.notes}</p>}
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
