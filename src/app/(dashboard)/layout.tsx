"use client";

import AuthGuard from "@/components/auth/auth-guard";
import RulesPopup from "@/components/dashboard/rules-popup";
import Sidebar from "@/components/dashboard/sidebar";
import TopBar from "@/components/dashboard/top-bar";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStagePage = pathname.includes("/stage/");

  if (isStagePage) {
    return (
      <AuthGuard>
        {children}
        <RulesPopup />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-muted/20">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
      <RulesPopup />
    </AuthGuard>
  );
}
