import { Sidebar } from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="ml-[260px] min-h-screen flex flex-col">
        {children}
      </main>
    </div>
  );
}
