import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { users, PIPELINE_STAGES } from "@/data/mockData";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = ["Profile", "Organization", "Team", "Pipeline"];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account and organization</p>
        </div>

        <div className="border-b border-border">
          <div className="flex gap-6">
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())}
                className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.toLowerCase() ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "profile" && (
          <div className="max-w-lg space-y-4">
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <h2 className="text-sm font-medium text-foreground">Profile Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Full Name</label>
                  <input type="text" defaultValue="Alex Rivera" className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Email</label>
                  <input type="email" defaultValue="alex@terracloud.io" className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Role</label>
                  <input type="text" defaultValue="Admin" disabled className="w-full h-9 px-3 rounded-md bg-secondary/50 border border-border text-sm text-muted-foreground" />
                </div>
              </div>
              <button className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Save Changes</button>
            </div>
          </div>
        )}

        {activeTab === "organization" && (
          <div className="max-w-lg">
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <h2 className="text-sm font-medium text-foreground">Organization</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Organization Name</label>
                  <input type="text" defaultValue="Rivera Capital Group" className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              <button className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Save</button>
            </div>
          </div>
        )}

        {activeTab === "team" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">Team Members</h2>
              <button className="h-9 px-4 rounded-md border border-border text-sm text-foreground hover:bg-secondary transition-colors">Invite User</button>
            </div>
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Name</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Role</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} className={`border-b border-border ${i % 2 === 1 ? "bg-secondary/10" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">{u.avatar}</div>
                          <span className="text-sm text-foreground">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select defaultValue={u.role} className="h-8 px-2 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
                          <option>Admin</option>
                          <option>Agent</option>
                          <option>Viewer</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-xs text-destructive hover:underline">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "pipeline" && (
          <div className="max-w-lg space-y-4">
            <h2 className="text-sm font-medium text-foreground">Pipeline Stages</h2>
            <p className="text-xs text-muted-foreground">Drag to reorder stages. These define your lead pipeline.</p>
            <div className="space-y-2">
              {PIPELINE_STAGES.map((stage) => (
                <div key={stage.id} className="bg-card border border-border rounded-lg px-4 py-3 flex items-center justify-between group hover:border-primary/30 transition-colors cursor-grab">
                  <div className="flex items-center gap-3">
                    <div className="text-muted-foreground">⠿</div>
                    <span className="text-sm text-foreground">{stage.label}</span>
                  </div>
                  <button className="text-xs text-destructive opacity-0 group-hover:opacity-100 transition-opacity">Remove</button>
                </div>
              ))}
            </div>
            <button className="h-9 px-4 rounded-md border border-border text-sm text-foreground hover:bg-secondary transition-colors">Add Stage</button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
