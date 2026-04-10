import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Lock, Camera } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("full_name").eq("user_id", user.id).single();
      if (data) setFullName(data.full_name || "");
      setLoading(false);
    })();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName } as any).eq("user_id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile saved");
  };

  const initials = fullName ? fullName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : user?.email?.[0]?.toUpperCase() || "?";

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account</p>
        </div>

        {loading ? (
          <div className="max-w-lg space-y-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : (
          <div className="max-w-lg space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="relative group cursor-pointer">
                  <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                    {initials}
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
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Email</label>
                <input type="email" value={user?.email || ""} readOnly
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
              <button onClick={handleSave} disabled={saving}
                className="h-9 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-card border border-border rounded-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Change Password</h3>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">New Password</label>
                <input type="password" id="new-password" className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Confirm Password</label>
                <input type="password" id="confirm-password" className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary" />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowPasswordModal(false)} className="h-9 px-4 rounded-md text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                <button onClick={async () => {
                  const pw = (document.getElementById("new-password") as HTMLInputElement).value;
                  const confirm = (document.getElementById("confirm-password") as HTMLInputElement).value;
                  if (pw !== confirm) { toast.error("Passwords don't match"); return; }
                  if (pw.length < 6) { toast.error("Password must be at least 6 characters"); return; }
                  const { error } = await supabase.auth.updateUser({ password: pw });
                  if (error) { toast.error(error.message); return; }
                  toast.success("Password updated");
                  setShowPasswordModal(false);
                }} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Update Password</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
