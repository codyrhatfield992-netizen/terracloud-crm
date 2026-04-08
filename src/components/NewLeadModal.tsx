import { useState } from "react";
import { X } from "lucide-react";
import { users, type Lead } from "@/data/mockData";

interface NewLeadModalProps {
  onClose: () => void;
  onCreate: (data: Partial<Lead>) => void;
}

const sources = ["Cold Call", "Referral", "Website", "Direct Mail", "Facebook Ads", "Google Ads", "Driving for Dollars", "Zillow", "SMS Campaign", "Networking", "Walk-In", "Other"];
const priorities = ["Low", "Medium", "High", "Urgent"];
const commonTags = ["Wholesale", "Flip", "Assignment", "Hot", "Motivated", "Pre-Foreclosure", "Probate", "Absentee", "REO", "Cash Buyer", "Investor", "Seller", "Buyer"];

export default function NewLeadModal({ onClose, onCreate }: NewLeadModalProps) {
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("Website");
  const [priority, setPriority] = useState("Medium");
  const [assignedUser, setAssignedUser] = useState("u1");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  const filteredTagSuggestions = commonTags.filter(
    t => !selectedTags.includes(t) && t.toLowerCase().includes(tagInput.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Lead title is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onCreate({
      title: title.trim(),
      source,
      priority: priority as Lead["priority"],
      assigned_user: assignedUser,
      estimated_value: estimatedValue ? parseInt(estimatedValue) : 0,
      next_follow_up: nextFollowUp || null,
      tags: selectedTags,
    });
  };

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) setSelectedTags(prev => [...prev, tag]);
    setTagInput("");
    setShowTagSuggestions(false);
  };

  const removeTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-xl w-full max-w-[560px] mx-4 animate-enter shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Create New Lead</h2>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Title <span className="text-destructive">*</span></label>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); if (errors.title) setErrors(prev => ({ ...prev, title: "" })); }}
              placeholder="e.g., Oak Ridge Wholesale Deal"
              className={`w-full h-10 px-3 rounded-lg bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors ${
                errors.title ? "border-destructive focus:border-destructive" : "border-border focus:border-primary focus:ring-1 focus:ring-primary/30"
              }`}
              autoFocus
            />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
          </div>

          {/* Source + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Source</label>
              <select
                value={source}
                onChange={e => setSource(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
              >
                {sources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
              >
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Assigned To + Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Assigned To</label>
              <select
                value={assignedUser}
                onChange={e => setAssignedUser(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
              >
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Estimated Value</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <input
                  type="number"
                  value={estimatedValue}
                  onChange={e => setEstimatedValue(e.target.value)}
                  placeholder="0"
                  className="w-full h-10 pl-7 pr-3 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Follow-Up Date */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Next Follow-Up</label>
            <input
              type="date"
              value={nextFollowUp}
              onChange={e => setNextFollowUp(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors [color-scheme:dark]"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Tags</label>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-background border border-border min-h-[40px] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 transition-colors">
              {selectedTags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/15 text-primary text-xs font-medium">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-primary-foreground"><X className="h-3 w-3" /></button>
                </span>
              ))}
              <div className="relative flex-1 min-w-[100px]">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => { setTagInput(e.target.value); setShowTagSuggestions(true); }}
                  onFocus={() => setShowTagSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                  onKeyDown={handleTagKeyDown}
                  placeholder={selectedTags.length === 0 ? "Add tags..." : ""}
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none h-6"
                />
                {showTagSuggestions && filteredTagSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-xl z-50 py-1 max-h-40 overflow-y-auto scrollbar-thin">
                    {filteredTagSuggestions.slice(0, 8).map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onMouseDown={() => addTag(tag)}
                        className="w-full text-left px-3 py-1.5 text-sm text-foreground hover:bg-secondary/60 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Create Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
