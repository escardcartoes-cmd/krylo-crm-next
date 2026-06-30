import { Sidebar } from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden">
      <Sidebar />
      <main className="ml-[240px] h-screen flex flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
