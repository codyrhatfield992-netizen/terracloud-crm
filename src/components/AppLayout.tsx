import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import TopBar from "./TopBar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex xr-shell">
      <AppSidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <TopBar />
        <main className="flex-1 p-7 2xl:p-9 overflow-y-auto scrollbar-thin xr-command-surface">
          {children}
        </main>
      </div>
    </div>
  );
}
