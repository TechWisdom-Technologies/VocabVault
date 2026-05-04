"use client";

import { motion } from "framer-motion";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  Crown,
  Settings,
  History,
  ShieldCheck,
  PlusCircle,
  Menu,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  Sparkles
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Words", href: "/dashboard/words", icon: BookOpen },
  { name: "Flashcards", href: "/dashboard/flashcards", icon: Sparkles },
  { name: "Activities", href: "/dashboard/activities", icon: Activity },
  { name: "Challenges", href: "/dashboard/challenges/history", icon: Trophy },
  { name: "My Progress", href: "/dashboard/progress", icon: Crown },
  { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-[60] lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:block",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col p-6">
          <div className="mb-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-black text-xl">V</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tight leading-none">VocabVault</h1>
              <span className="text-[10px] font-medium text-muted-foreground leading-none mt-1">By TechWisdom Technologies</span>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <motion.div key={item.href} whileTap={{ scale: 0.97 }}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
                    {item.name}
                  </Link>
                </motion.div>
              );
            })}

            {user?.role === "ADMIN" && (
              <motion.div whileTap={{ scale: 0.97 }}>
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all mt-4",
                    pathname.startsWith("/admin") ? "bg-amber-500 text-white shadow-md shadow-amber-500/20" : "text-amber-600 hover:bg-amber-50"
                  )}
                >
                  <ShieldCheck className="w-5 h-5" />
                  Admin Dashboard
                </Link>
              </motion.div>
            )}
          </nav>

        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("rounded-2xl border bg-card shadow-sm", className)}>{children}</div>;
}



