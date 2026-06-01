import { Sidebar } from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      <Sidebar />
      {/* Main: offset = sidebar width (220) + margin left (12) + gap (16) */}
      <main className="ml-[260px] min-h-screen flex flex-col">
        {children}
      </main>
    </div>
  );
}
