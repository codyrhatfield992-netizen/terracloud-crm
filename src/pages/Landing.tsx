import { Link } from "react-router-dom";
import { Users, Building2, CheckSquare, Shield, Zap, BarChart3, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const features = [
  {
    icon: Users,
    title: "Lead Management",
    description: "Track every opportunity through your pipeline. From first contact to closed deal, never miss a follow-up again.",
  },
  {
    icon: Building2,
    title: "Property Database",
    description: "Organize and analyze all your properties. Track ARV, comps, rehab costs, and deal metrics in one place.",
  },
  {
    icon: CheckSquare,
    title: "Team Collaboration",
    description: "Notes, tasks, and documents in one place. Keep your team aligned and your deals moving forward.",
  },
];

const stats = [
  { icon: BarChart3, title: "Built for Real Estate", description: "Purpose-built tools for agents, investors, and wholesalers." },
  { icon: Shield, title: "Secure & Reliable", description: "Enterprise-grade security. Your data is encrypted and protected." },
  { icon: Zap, title: "Simple & Powerful", description: "Clean interface that gets out of your way. Focus on closing deals." },
];

export default function Landing() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-base font-semibold tracking-tight text-foreground">
            Terra<span className="text-primary">Cloud</span>
          </span>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="h-9 px-4 flex items-center rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-tight max-w-3xl mx-auto">
          Real Estate CRM Built for Agents & Investors
        </h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
          Manage leads, track properties, close more deals. All in one powerful platform.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <Link to="/signup" className="h-11 px-6 flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/login" className="h-11 px-6 flex items-center rounded-md border border-border text-sm font-medium text-foreground hover:bg-card transition-colors">
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map(f => (
            <div key={f.title} className="bg-card border border-border rounded-lg p-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats/Values */}
      <section className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map(s => (
              <div key={s.title} className="text-center">
                <div className="h-10 w-10 rounded-lg bg-card border border-border flex items-center justify-center mx-auto mb-4">
                  <s.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Ready to close more deals?</h2>
          <p className="text-sm text-muted-foreground mt-2">Start managing your real estate pipeline today.</p>
          <Link to="/signup" className="inline-flex h-11 px-6 items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors mt-6">
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">2026 TerraCloud. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
            <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
            <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
