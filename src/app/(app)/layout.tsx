import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar user={session.user} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-6 lg:p-8"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
