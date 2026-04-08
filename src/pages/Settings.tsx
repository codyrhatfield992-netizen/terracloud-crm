import { useState, useRef, useCallback } from "react";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { users, PIPELINE_STAGES } from "@/data/mockData";
import { toast } from "sonner";
import { User, Building2, Users, GitBranch, GripVertical, Trash2, X, Plus, Camera, Lock, UserPlus } from "lucide-react";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "team", label: "Team", icon: Users },
  { id: "pipeline", label: "Pipeline", icon: GitBranch },
] as const;

const TIMEZONES = [
  "America/Chicago", "America/New_York", "America/Denver", "America/Los_Angeles",
  "America/Phoenix", "UTC", "Europe/London", "Asia/Tokyo",
];

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: "Active" | "Inactive";
}

interface Stage {
  id: string;
  label: string;
  order: number;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  // Profile
  const [profileName, setProfileName] = useState("Alex Rivera");
  const [profileEmail] = useState("alex@terracloud.io");
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Organization
  const [orgName, setOrgName] = useState("Rivera Capital Group");
  const [orgSlug] = useState("rivera-capital");
  const [orgTimezone, setOrgTimezone] = useState("America/Chicago");

  // Team
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: "u1", name: "Alex Rivera", email: "alex@terracloud.io", avatar: "AR", role: "Admin", status: "Active" },
    { id: "u2", name: "Jordan Kim", email: "jordan@terracloud.io", avatar: "JK", role: "Member", status: "Active" },
    { id: "u3", name: "Sam Chen", email: "sam@terracloud.io", avatar: "SC", role: "Member", status: "Active" },
    { id: "u4", name: "Taylor Brooks", email: "taylor@terracloud.io", avatar: "TB", role: "Member", status: "Inactive" },
  ]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);

  // Pipeline
  const [stages, setStages] = useState<Stage[]>(
    PIPELINE_STAGES.map(s => ({ ...s, label: s.label }))
  );
  const [showAddStage, setShowAddStage] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [deleteStageConfirm, setDeleteStageConfirm] = useState<string | null>(null);
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [editingStageValue, setEditingStageValue] = useState("");

  // Drag state
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  function handleDragStart(index: number) {
    dragItem.current = index;
  }
  function handleDragEnter(index: number) {
    dragOverItem.current = index;
  }
  function handleDragEnd() {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const items = [...stages];
    const [removed] = items.splice(dragItem.current, 1);
    items.splice(dragOverItem.current, 0, removed);
    setStages(items.map((s, i) => ({ ...s, order: i })));
    dragItem.current = null;
    dragOverItem.current = null;
    toast.success("Pipeline order updated");
  }

  function handleRemoveTeamMember(id: string) {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
    setRemoveConfirm(null);
    toast.success("Team member removed");
  }

  function handleInvite() {
    if (!inviteEmail.trim()) return;
    const newMember: TeamMember = {
      id: `u${Date.now()}`,
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      avatar: inviteEmail.substring(0, 2).toUpperCase(),
      role: inviteRole,
      status: "Active",
    };
    setTeamMembers(prev => [...prev, newMember]);
    setInviteEmail("");
    setInviteRole("Member");
    setShowInviteModal(false);
    toast.success("Invite sent successfully");
  }

  function handleAddStage() {
    if (!newStageName.trim()) return;
    setStages(prev => [...prev, { id: newStageName.toLowerCase().replace(/\s+/g, "_"), label: newStageName, order: prev.length }]);
    setNewStageName("");
    setShowAddStage(false);
    toast.success("Stage added");
  }

  function handleDeleteStage(id: string) {
    setStages(prev => prev.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i })));
    setDeleteStageConfirm(null);
    toast.success("Stage deleted");
  }

  function handleSaveStageEdit(id: string) {
    if (!editingStageValue.trim()) return;
    setStages(prev => prev.map(s => s.id === id ? { ...s, label: editingStageValue } : s));
    setEditingStage(null);
    toast.success("Stage renamed");
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account and organization</p>
        </div>

        <div className="flex gap-6">
          {/* Left sidebar tabs */}
          <div className="w-48 shrink-0 space-y-1">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}>
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right content */}
          <div className="flex-1 min-w-0">
            {/* PROFILE */}
            {activeTab === "profile" && (
              <div className="max-w-lg space-y-6">
                <h2 className="text-lg font-semibold text-foreground">Your Profile</h2>
                <div className="bg-card border border-border rounded-lg p-6 space-y-5">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="relative group cursor-pointer">
                      <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                        AR
                      </div>
                      <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="h-5 w-5 text-foreground" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Profile Photo</p>
                      <p className="text-xs text-muted-foreground">Click to upload a new photo</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Full Name</label>
                    <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)}
                      className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Email</label>
                    <input type="email" value={profileEmail} readOnly
                      className="w-full h-9 px-3 rounded-md bg-secondary/50 border border-border text-sm text-muted-foreground cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Password</label>
                    <button onClick={() => setShowPasswordModal(true)}
                      className="h-9 px-4 flex items-center gap-2 rounded-md border border-border text-sm text-foreground hover:bg-secondary transition-colors">
                      <Lock className="h-3.5 w-3.5" /> Change Password
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={() => toast.success("Profile saved")}
                    className="h-9 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* ORGANIZATION */}
            {activeTab === "organization" && (
              <div className="max-w-lg space-y-6">
                <h2 className="text-lg font-semibold text-foreground">Organization Settings</h2>
                <div className="bg-card border border-border rounded-lg p-6 space-y-5">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Organization Name</label>
                    <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)}
                      className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Slug</label>
                    <input type="text" value={orgSlug} readOnly
                      className="w-full h-9 px-3 rounded-md bg-secondary/50 border border-border text-sm text-muted-foreground cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Timezone</label>
                    <select value={orgTimezone} onChange={e => setOrgTimezone(e.target.value)}
                      className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
                      {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={() => toast.success("Organization settings saved")}
                    className="h-9 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* TEAM */}
            {activeTab === "team" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Team Members</h2>
                  <button onClick={() => setShowInviteModal(true)}
                    className="h-9 px-4 flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                    <UserPlus className="h-4 w-4" /> Invite User
                  </button>
                </div>

                {teamMembers.length === 0 ? (
                  <EmptyState icon={<Users className="h-10 w-10" />} title="No team members yet" description="Invite your first teammate" />
                ) : (
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Name</th>
                          <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Email</th>
                          <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Role</th>
                          <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                          <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamMembers.map((m, i) => (
                          <tr key={m.id} className={`border-b border-border hover:bg-secondary/30 transition-colors ${i % 2 === 1 ? "bg-secondary/10" : ""}`}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">{m.avatar}</div>
                                <span className="text-sm font-medium text-foreground">{m.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{m.email}</td>
                            <td className="px-4 py-3">
                              <select value={m.role}
                                onChange={e => {
                                  setTeamMembers(prev => prev.map(tm => tm.id === m.id ? { ...tm, role: e.target.value } : tm));
                                  toast.success("Role updated");
                                }}
                                className="h-8 px-2 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
                                <option>Admin</option>
                                <option>Member</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge variant={m.status === "Active" ? "default" : "outline"}>
                                {m.status}
                              </StatusBadge>
                            </td>
                            <td className="px-4 py-3">
                              <button onClick={() => setRemoveConfirm(m.id)}
                                className="text-xs text-destructive hover:underline">Remove</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* PIPELINE */}
            {activeTab === "pipeline" && (
              <div className="max-w-lg space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Pipeline Stages</h2>
                  <p className="text-sm text-muted-foreground mt-1">Drag to reorder stages. These define your lead pipeline.</p>
                </div>
                <div className="space-y-2">
                  {stages.map((stage, index) => (
                    <div key={stage.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragEnter={() => handleDragEnter(index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={e => e.preventDefault()}
                      className="bg-card border border-border rounded-lg px-4 py-3 flex items-center gap-3 group hover:border-primary/30 transition-all cursor-grab active:cursor-grabbing">
                      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-xs font-mono text-muted-foreground w-6">{index + 1}</span>
                      {editingStage === stage.id ? (
                        <input autoFocus value={editingStageValue}
                          onChange={e => setEditingStageValue(e.target.value)}
                          onBlur={() => handleSaveStageEdit(stage.id)}
                          onKeyDown={e => { if (e.key === "Enter") handleSaveStageEdit(stage.id); if (e.key === "Escape") setEditingStage(null); }}
                          className="flex-1 h-7 px-2 rounded bg-secondary border border-primary text-sm text-foreground focus:outline-none" />
                      ) : (
                        <span className="flex-1 text-sm text-foreground cursor-text"
                          onClick={() => { setEditingStage(stage.id); setEditingStageValue(stage.label); }}>
                          {stage.label}
                        </span>
                      )}
                      <button onClick={() => setDeleteStageConfirm(stage.id)}
                        className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowAddStage(true)}
                  className="h-9 px-4 flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                  <Plus className="h-4 w-4" /> Add Stage
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-card border border-border rounded-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Change Password</h2>
              <button onClick={() => setShowPasswordModal(false)} className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Current Password</label>
                <input type="password" className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">New Password</label>
                <input type="password" className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Confirm New Password</label>
                <input type="password" className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary" />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-border">
              <button onClick={() => setShowPasswordModal(false)} className="h-9 px-4 rounded-md text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={() => { setShowPasswordModal(false); toast.success("Password updated"); }}
                className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Update Password</button>
            </div>
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowInviteModal(false)}>
          <div className="bg-card border border-border rounded-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Invite User</h2>
              <button onClick={() => setShowInviteModal(false)} className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Email</label>
                <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="teammate@company.com"
                  className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Role</label>
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                  className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary">
                  <option>Admin</option>
                  <option>Member</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-border">
              <button onClick={() => setShowInviteModal(false)} className="h-9 px-4 rounded-md text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={handleInvite} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Send Invite</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Stage Modal */}
      {showAddStage && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowAddStage(false)}>
          <div className="bg-card border border-border rounded-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Add Stage</h2>
              <button onClick={() => setShowAddStage(false)} className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4">
              <label className="text-xs font-medium text-muted-foreground block mb-1">Stage Name</label>
              <input type="text" value={newStageName} onChange={e => setNewStageName(e.target.value)} placeholder="e.g. Due Diligence"
                onKeyDown={e => { if (e.key === "Enter") handleAddStage(); }}
                className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-border">
              <button onClick={() => setShowAddStage(false)} className="h-9 px-4 rounded-md text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={handleAddStage} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Stage Confirmation */}
      {deleteStageConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setDeleteStageConfirm(null)}>
          <div className="bg-card border border-border rounded-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Delete Stage?</h2>
              <p className="text-sm text-muted-foreground">Leads in this stage may need to be reassigned. This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-border">
              <button onClick={() => setDeleteStageConfirm(null)} className="h-9 px-4 rounded-md text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={() => handleDeleteStage(deleteStageConfirm)}
                className="h-9 px-4 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Team Member Confirmation */}
      {removeConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setRemoveConfirm(null)}>
          <div className="bg-card border border-border rounded-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Remove Team Member?</h2>
              <p className="text-sm text-muted-foreground">This person will lose access to the organization. This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-border">
              <button onClick={() => setRemoveConfirm(null)} className="h-9 px-4 rounded-md text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={() => handleRemoveTeamMember(removeConfirm)}
                className="h-9 px-4 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90">Remove</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
