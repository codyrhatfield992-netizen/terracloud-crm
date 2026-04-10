import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useMeetings, useCreateMeeting } from "@/hooks/useMeetings";
import { Calendar, Plus, X, Clock } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

function NewMeetingModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (m: any) => void }) {
  const [form, setForm] = useState({ title: "", date: "", time: "", duration: "30 min", location: "", notes: "" });
  if (!open) return null;

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onSubmit(form);
    onClose();
    setForm({ title: "", date: "", time: "", duration: "30 min", location: "", notes: "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[560px] mx-4 bg-card border border-border rounded-lg shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Schedule Meeting</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Meeting title"
              className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">Date</label><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary [color-scheme:dark]" /></div>
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">Time</label><input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary [color-scheme:dark]" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">Duration</label>
              <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary">
                <option>15 min</option><option>30 min</option><option>1 hour</option><option>2 hours</option>
              </select>
            </div>
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">Location</label><input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Office / Zoom" className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" /></div>
          </div>
          <div><label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label><textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary h-20 resize-none" /></div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button onClick={onClose} className="h-9 px-4 rounded-md text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          <button onClick={handleSubmit} className="h-9 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Schedule</button>
        </div>
      </div>
    </div>
  );
}

export default function Meetings() {
  const { data: meetings = [], isLoading } = useMeetings();
  const createMeeting = useCreateMeeting();
  const [showModal, setShowModal] = useState(false);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Meetings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{meetings.length} meeting{meetings.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={() => setShowModal(true)} className="h-9 px-4 flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> Schedule Meeting
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}</div>
        ) : meetings.length === 0 ? (
          <EmptyState icon={<Calendar className="h-10 w-10" />} title="No meetings scheduled" description="Schedule your first meeting to get started"
            action={<button onClick={() => setShowModal(true)} className="h-9 px-4 flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"><Plus className="h-4 w-4" /> Schedule</button>} />
        ) : (
          <div className="space-y-3">
            {meetings.map(m => (
              <div key={m.id} className="bg-card border border-border rounded-lg p-5 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{m.title}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{m.date}</span>
                      <span>{m.time}</span>
                      <Clock className="h-3.5 w-3.5" />
                      <span>{m.duration}</span>
                    </div>
                    {m.location && <p className="text-xs text-muted-foreground mt-1">{m.location}</p>}
                  </div>
                </div>
                {m.notes && <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border">{m.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
      <NewMeetingModal open={showModal} onClose={() => setShowModal(false)} onSubmit={m => createMeeting.mutate(m)} />
    </AppLayout>
  );
}
