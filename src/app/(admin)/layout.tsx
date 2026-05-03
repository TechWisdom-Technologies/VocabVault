"use client";

import AdminGuard from "@/components/admin/admin-guard";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  AlertTriangle,
  ShieldAlert,
  ChevronRight,
  LogOut,
  Bell,
  Menu,
  X
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, color: "text-violet-500" },
  { href: "/admin/users", label: "Users & Accounts", icon: Users, color: "text-emerald-500" },
  { href: "/admin/words", label: "Word Management", icon: BookOpen, color: "text-amber-500" },
  { href: "/admin/feedback", label: "Feedback & Reports", icon: AlertTriangle, color: "text-orange-500" },
  { href: "/admin/security", label: "Security & Logs", icon: ShieldAlert, color: "text-rose-500" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getBreadcrumb = () => {
    const parts = pathname.split("/").filter(Boolean);
    return parts.map((part, i) => (
      <span key={part} className="flex items-center gap-1">
        <span className="capitalize">{part}</span>
        {i < parts.length - 1 && <ChevronRight className="w-3 h-3 opacity-30" />}
      </span>
    ));
  };

  return (
    <AdminGuard>
      <div className="dark">
        <div className="min-h-screen bg-[#0a0a0b] text-slate-200 flex overflow-hidden">
        {/* Decorative Background Glows */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-violet-600/5 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        </div>

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-[100] w-72 border-r border-white/5 bg-background/50 backdrop-blur-xl flex flex-col transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-8">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-transform group-hover:scale-105">
                <span className="text-xl font-black text-white">V</span>
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight text-white leading-none">VocabVault</h2>
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] leading-none mt-1 block">By TechWisdom Technologies</span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            <p className="px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Main Navigation</p>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all relative group
                    ${isActive
                      ? 'text-white bg-white/5'
                      : 'text-muted-foreground hover:text-white hover:bg-white/5'}
                  `}>
                    {isActive && (
                      <div className="absolute left-0 w-1 h-5 bg-primary rounded-full -translate-x-1" />
                    )}
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? item.color : 'opacity-40 group-hover:opacity-100'}`} />
                    {item.label}
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-6 mt-auto">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
                  <p className="text-[10px] text-white/40 truncate">{user?.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="w-full justify-start gap-2 h-8 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-[10px] font-bold uppercase tracking-wider"
              >
                <LogOut className="w-3 h-3" />
                Sign Out
              </Button>
            </div>

            <Link href="/admin/settings">
              <div className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                ${pathname === "/admin/settings" ? 'text-white bg-white/5' : 'text-muted-foreground hover:text-white hover:bg-white/5'}
              `}>
                <Settings className={`w-4 h-4 ${pathname === "/admin/settings" ? 'text-gray-400' : 'opacity-40'}`} />
                Settings
              </div>
            </Link>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Header */}
          <header className="h-20 border-b border-white/5 bg-background/30 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 shrink-0 relative z-10">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden text-white/40 hover:text-white"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              
              <div className="flex items-center gap-4 text-xs font-bold text-white/40">
                <Link href="/admin" className="hidden sm:block hover:text-white transition-colors">Admin</Link>
                <ChevronRight className="hidden sm:block w-3 h-3 opacity-30" />
                <div className="text-white flex items-center gap-1">
                  {getBreadcrumb()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative">
                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl text-white/40 hover:text-white hover:bg-white/5">
                  <Bell className="w-5 h-5" />
                </Button>
                <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-[#0a0a0b]" />
              </div>

              <div className="h-8 w-[1px] bg-white/5" />

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Status</span>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
        </div>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </AdminGuard>
  );
}
