import AdminGuard from "@/components/admin/admin-guard";
import Link from "next/link";
import { LayoutDashboard, Users, BookOpen, Settings, AlertTriangle, ShieldAlert } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
        {/* Admin Sidebar */}
        <aside className="w-full md:w-64 bg-background border-r border-border/50 shrink-0 sticky top-0 md:h-screen overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-black bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-1">
              VocabVault
            </h2>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Admin Portal
            </p>
          </div>

          <nav className="px-4 space-y-1">
            <Link href="/admin">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors text-foreground">
                <LayoutDashboard className="w-4 h-4 text-primary" />
                Overview
              </div>
            </Link>
            <Link href="/admin/users">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
                <Users className="w-4 h-4 text-emerald-500" />
                Users & Accounts
              </div>
            </Link>
            <Link href="/admin/words">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
                <BookOpen className="w-4 h-4 text-amber-500" />
                Word Management
              </div>
            </Link>
            <Link href="/admin/feedback">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Feedback & Reports
              </div>
            </Link>
            <Link href="/admin/security">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
                <ShieldAlert className="w-4 h-4 text-destructive" />
                Security & Logs
              </div>
            </Link>
            <div className="pt-4 mt-4 border-t border-border/50">
              <Link href="/admin/settings">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
                  <Settings className="w-4 h-4 text-gray-500" />
                  System Settings
                </div>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
