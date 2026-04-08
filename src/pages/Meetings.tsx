import AppLayout from "@/components/AppLayout";
import { meetings, getUserById, getContactById } from "@/data/mockData";
import { Calendar } from "lucide-react";

export default function Meetings() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Meetings</h1>
            <p className="text-sm text-muted-foreground mt-1">{meetings.length} scheduled meetings</p>
          </div>
          <button className="h-9 px-4 flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Schedule Meeting
          </button>
        </div>

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
                    <span>{m.duration}</span>
                  </div>
                </div>
                <div className="flex -space-x-1">
                  {m.attendees.map((a, i) => {
                    const user = getUserById(a);
                    const contact = getContactById(a);
                    const label = user?.avatar ?? contact?.name.split(" ").map(w => w[0]).join("") ?? "?";
                    return (
                      <div key={i} className="h-7 w-7 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                        {label}
                      </div>
                    );
                  })}
                </div>
              </div>
              {m.notes && <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border">{m.notes}</p>}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
