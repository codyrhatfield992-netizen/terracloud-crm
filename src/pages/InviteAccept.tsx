import { Link } from "react-router-dom";
import { AuthShell } from "./ForgotPassword";

export default function InviteAccept() {
  return <AuthShell title="Accept Invite" subtitle="Join your training organization and enter the practice operating system."><div className="space-y-4"><div className="xr-glass rounded-xl p-4"><p className="text-sm font-medium">Apex Realty Group</p><p className="text-xs text-muted-foreground mt-1">Role: Learner · Cohort: Q1 Listing Conversion</p></div><Link to="/signup" className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium inline-flex items-center justify-center">Create account</Link><Link to="/login" className="block text-center text-sm text-muted-foreground hover:text-foreground">Already have access?</Link></div></AuthShell>;
}
