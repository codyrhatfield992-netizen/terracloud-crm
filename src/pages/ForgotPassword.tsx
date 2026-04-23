import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => { e.preventDefault(); if (!email.includes("@")) { toast.error("Enter a valid email"); return; } setLoading(true); const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` }); setLoading(false); if (error) toast.error(error.message); else toast.success("Password reset link sent"); };
  return <AuthShell title="Reset access" subtitle="Receive a secure password reset link."><form onSubmit={submit} className="space-y-4"><div><label className="text-xs text-muted-foreground mb-1.5 block">Email</label><input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-10 px-3 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:border-primary" placeholder="you@company.com" /></div><button disabled={loading} className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium">{loading ? "Sending…" : "Send reset link"}</button><Link to="/login" className="block text-center text-sm text-muted-foreground hover:text-foreground">Back to login</Link></form></AuthShell>;
}
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) { return <div className="min-h-screen flex items-center justify-center bg-background px-4 xr-radial-glow"><div className="w-full max-w-md xr-glass-strong rounded-2xl p-8 shadow-elevated"><div className="text-center mb-8"><p className="text-[10px] font-mono uppercase tracking-[0.28em] text-primary mb-3">TerraCloud XR</p><h1 className="text-2xl font-semibold xr-silver-text">{title}</h1><p className="text-sm text-muted-foreground mt-2">{subtitle}</p></div>{children}</div></div>; }
