import { useState, useRef, useEffect } from "react";
import { X, Search } from "lucide-react";
import { contacts, properties, users, formatCurrency, type Contact, type Property, type Task, type Meeting } from "@/data/mockData";

// ── Generic Modal Shell ──
export function ModalShell({ title, onClose, children, width = "max-w-[560px]" }: {
  title: string; onClose: () => void; children: React.ReactNode; width?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-card border border-border rounded-xl w-full ${width} mx-4 animate-enter shadow-2xl`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Delete Confirmation ──
export function DeleteConfirmModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <ModalShell title="Delete Lead" onClose={onClose} width="max-w-[420px]">
      <div className="p-6 space-y-4">
        <p className="text-sm text-muted-foreground">Are you sure you want to delete this lead? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="h-10 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">Cancel</button>
          <button onClick={onConfirm} className="h-10 px-4 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors">Delete</button>
        </div>
      </div>
    </ModalShell>
  );
}

// ── Link Contact Modal ──
export function LinkContactModal({ onClose, onLink }: { onClose: () => void; onLink: (contact: Contact) => void }) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"search" | "create">("search");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<Contact["type"]>("Seller");

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!name.trim()) return;
    const newContact: Contact = {
      id: `c${Date.now()}`, name: name.trim(), email, phone, type, tags: [], created_at: "2024-04-08",
    };
    onLink(newContact);
  };

  return (
    <ModalShell title="Link Contact" onClose={onClose}>
      <div className="border-b border-border flex">
        <button onClick={() => setTab("search")} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${tab === "search" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground"}`}>Search Existing</button>
        <button onClick={() => setTab("create")} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${tab === "create" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground"}`}>Create New</button>
      </div>
      {tab === "search" ? (
        <div className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts by name or email..."
              className="w-full h-10 pl-9 pr-4 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" autoFocus />
          </div>
          <div className="max-h-[300px] overflow-y-auto scrollbar-thin space-y-1">
            {filtered.map(c => (
              <button key={c.id} onClick={() => onLink(c)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-secondary/60 transition-colors text-left">
                <div>
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.email} · {c.type}</p>
                </div>
              </button>
            ))}
            {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No contacts found</p>}
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Phone</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Type</label>
            <select value={type} onChange={e => setType(e.target.value as Contact["type"])} className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
              <option>Seller</option><option>Buyer</option><option>Agent</option><option>Other</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="h-10 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">Cancel</button>
            <button onClick={handleCreate} className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Create & Link</button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

// ── Link Property Modal ──
export function LinkPropertyModal({ onClose, onLink }: { onClose: () => void; onLink: (property: Property) => void }) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"search" | "create">("search");
  const [address, setAddress] = useState("");
  const [propType, setPropType] = useState<Property["type"]>("Single Family");
  const [arv, setArv] = useState("");

  const filtered = properties.filter(p => p.address.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = () => {
    if (!address.trim()) return;
    const newProp: Property = {
      id: `p${Date.now()}`, address: address.trim(), city: "Austin", state: "TX", zip: "78701",
      type: propType, beds: 0, baths: 0, sqft: 0, arv: parseInt(arv) || 0,
      asking_price: 0, offer_price: null, status: "Available", thumbnail: "", created_at: "2024-04-08",
    };
    onLink(newProp);
  };

  return (
    <ModalShell title="Link Property" onClose={onClose}>
      <div className="border-b border-border flex">
        <button onClick={() => setTab("search")} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${tab === "search" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground"}`}>Search Existing</button>
        <button onClick={() => setTab("create")} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${tab === "create" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground"}`}>Create New</button>
      </div>
      {tab === "search" ? (
        <div className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search properties by address..."
              className="w-full h-10 pl-9 pr-4 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" autoFocus />
          </div>
          <div className="max-h-[300px] overflow-y-auto scrollbar-thin space-y-1">
            {filtered.map(p => (
              <button key={p.id} onClick={() => onLink(p)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-secondary/60 transition-colors text-left">
                <div>
                  <p className="text-sm font-medium text-foreground">{p.address}</p>
                  <p className="text-xs text-muted-foreground">{p.type} · ARV: {formatCurrency(p.arv)}</p>
                </div>
              </button>
            ))}
            {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No properties found</p>}
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Address *</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Type</label>
              <select value={propType} onChange={e => setPropType(e.target.value as Property["type"])} className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
                <option>Single Family</option><option>Multi Family</option><option>Condo</option><option>Townhouse</option><option>Land</option><option>Commercial</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">ARV</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <input type="number" value={arv} onChange={e => setArv(e.target.value)} className="w-full h-10 pl-7 pr-3 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="h-10 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">Cancel</button>
            <button onClick={handleCreate} className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Create & Link</button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

// ── Log Meeting Modal ──
export function LogMeetingModal({ onClose, onCreate }: { onClose: () => void; onCreate: (m: Partial<Meeting>) => void }) {
  const [title, setTitle] = useState("");
  const [meetingType, setMeetingType] = useState("In-Person");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("30 min");
  const [summary, setSummary] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({ title: title.trim(), date, time, duration, notes: summary });
    onClose();
  };

  return (
    <ModalShell title="Log Meeting" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Title *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Property Tour - Oak Ridge"
            className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" autoFocus />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Type</label>
            <select value={meetingType} onChange={e => setMeetingType(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
              <option>In-Person</option><option>Phone Call</option><option>Video Call</option><option>Property Tour</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Duration</label>
            <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
              <option>15 min</option><option>30 min</option><option>45 min</option><option>1 hour</option><option>2 hours</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors [color-scheme:dark]" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Time</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors [color-scheme:dark]" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Summary</label>
          <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={3} placeholder="Meeting notes..."
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none" />
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="h-10 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">Cancel</button>
          <button type="submit" className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Log Meeting</button>
        </div>
      </form>
    </ModalShell>
  );
}

// ── Create Task Modal ──
export function CreateTaskModal({ onClose, onCreate }: { onClose: () => void; onCreate: (t: Partial<Task>) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedUser, setAssignedUser] = useState("u1");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("Medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({ title: title.trim(), description, assigned_user: assignedUser, due_date: dueDate, priority });
    onClose();
  };

  return (
    <ModalShell title="Create Task" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Title *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Follow up on counter-offer"
            className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" autoFocus />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Task details..."
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Assigned To</label>
            <select value={assignedUser} onChange={e => setAssignedUser(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Due Date</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors [color-scheme:dark]" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value as Task["priority"])} className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="h-10 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">Cancel</button>
          <button type="submit" className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Create Task</button>
        </div>
      </form>
    </ModalShell>
  );
}
