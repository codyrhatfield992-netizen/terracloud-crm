import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import TopBar from "./TopBar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      <div className="flex-1 ml-60 flex flex-col">
        <TopBar />
        <main className="flex-1 p-8 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
