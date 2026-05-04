"use client";

import AuthGuard from "@/components/auth/auth-guard";
import RulesModal from "@/components/dashboard/rules-modal";
import Sidebar from "@/components/dashboard/sidebar";
import TopBar from "@/components/dashboard/top-bar";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const isStagePage = pathname.includes("/stage/");

  const showRules = user !== null && !user.rulesAcknowledged;

  if (isStagePage) {
    return (
      <AuthGuard>
        {children}
        {showRules && <RulesModal />}
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
      {showRules && <RulesModal />}
    </AuthGuard>
  );
}
