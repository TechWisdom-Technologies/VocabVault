"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HelpCircle,
  Settings,
  LogOut,
  Flame,
  Calendar,
  Trophy,
  Bell,
  X,
  MessageSquare,
  Search,
  User
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import HowItWorksSheet from "./how-it-works";
import { FeedbackModal } from "./feedback-modal";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function TopBar() {
  const router = useRouter();
  const { user, logout, getAuthHeaders } = useAuthStore();
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState<any[]>([]);
  const [activeToast, setActiveToast] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);

  const handleNotificationMouseEnter = () => {
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    setShowNotifications(true);
  };

  const handleNotificationMouseLeave = () => {
    notificationTimeoutRef.current = setTimeout(() => {
      setShowNotifications(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/user/profile", { headers });
        if (res.ok) setProfileData(await res.json());
      } catch (e) { console.error(e); }
    };
    if (user) fetchProfile();
  }, [user, getAuthHeaders]);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/notifications/unread", { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.notifications && Array.isArray(data.notifications)) {
            setUnreadNotifications(data.notifications);
          }
        }
      } catch (err) { console.error("Notification fetch error:", err); }
    };
    fetchNotifications();

    const channel = supabase
      .channel(`topbar-notifications-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.new) {
            setUnreadNotifications((prev) => [payload.new, ...prev]);
            setActiveToast(payload.new);
            setTimeout(() => setActiveToast(null), 10000);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, getAuthHeaders]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="h-20 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6 sm:px-8">
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search words..."
            className="w-full bg-muted/40 border border-transparent focus:border-primary/20 focus:bg-background rounded-xl py-2.5 pl-10 pr-4 text-sm transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6 ml-auto">
        <div className="hidden sm:flex items-center gap-6 border-r border-border/50 pr-6 mr-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Day Count</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold tracking-tight">{profileData?.dayCount || 0}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Current Streak</span>
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold tracking-tight text-orange-600">{profileData?.currentStreak || 0}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon" onClick={() => setShowHowItWorks(true)} className="rounded-full w-10 h-10">
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
          </Button>

          <div
            onMouseEnter={handleNotificationMouseEnter}
            onMouseLeave={handleNotificationMouseLeave}
            className="relative"
          >
            <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
              <DropdownMenuTrigger
                onClick={() => router.push("/dashboard/notifications")}
                className={cn(
                  "relative rounded-full w-10 h-10 flex items-center justify-center transition-all outline-none border-none hover:bg-muted focus:bg-muted",
                  showNotifications ? "bg-muted text-foreground" : "bg-transparent text-muted-foreground"
                )}
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-background">
                    {unreadNotifications.length}
                  </span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80 mt-2 p-0 rounded-2xl border-border/50 shadow-2xl overflow-hidden bg-popover"
                onMouseEnter={handleNotificationMouseEnter}
                onMouseLeave={handleNotificationMouseLeave}
              >
                <div className="p-4 bg-muted/30 border-b border-border/50 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Notifications</h3>
                  <Badge variant="secondary" className="text-[10px] font-bold">
                    {unreadNotifications.length} New
                  </Badge>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {unreadNotifications.length > 0 ? (
                    unreadNotifications.slice(0, 5).map((noti) => (
                      <DropdownMenuItem
                        key={noti.id}
                        onClick={() => router.push("/dashboard/notifications")}
                        className="p-4 flex flex-col items-start gap-1 border-b border-border/10 last:border-0 cursor-pointer focus:bg-muted"
                      >
                        <span className="text-sm font-bold tracking-tight">{noti.title}</span>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {noti.message}
                        </p>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-10 text-center">
                      <Bell className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">No new notifications</p>
                    </div>
                  )}
                </div>
                {unreadNotifications.length > 0 && (
                  <Button
                    variant="ghost"
                    className="w-full rounded-none h-11 text-xs font-bold text-primary hover:bg-primary/5"
                    onClick={() => router.push("/dashboard/notifications")}
                  >
                    View All Notifications
                  </Button>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className={cn(
              "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-muted hover:text-foreground p-0 h-10 w-10 sm:w-auto sm:px-3 sm:gap-2",
            )}>
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.avatarUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {user?.name?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start text-left">
                <span className="text-xs font-bold truncate max-w-[100px]">{user?.name}</span>
                <span className="text-[10px] text-muted-foreground leading-none">{user?.plan}</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <div className="p-3 bg-muted/30 flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
                  <AvatarImage src={user?.avatarUrl || undefined} />
                  <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{user?.name}</span>
                  <span className="text-xs text-muted-foreground truncate w-32">{user?.email}</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                <User className="w-4 h-4 mr-2" /> My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                <Settings className="w-4 h-4 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => {
                setTimeout(() => setShowReportModal(true), 100);
              }}>
                <MessageSquare className="w-4 h-4 mr-2" /> Report
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <FeedbackModal 
            open={showReportModal} 
            onOpenChange={setShowReportModal}
          />
        </div>
      </div>

      <HowItWorksSheet open={showHowItWorks} onOpenChange={setShowHowItWorks} />

      {activeToast && (
        <div className="fixed top-24 right-6 z-[100] max-w-sm w-full bg-background border border-primary/20 shadow-2xl rounded-2xl p-4 flex gap-4 animate-in slide-in-from-bottom-10">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold">{activeToast.title}</h4>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{activeToast.message}</p>
            <Button size="sm" variant="link" className="p-0 h-auto text-xs mt-2" onClick={() => router.push("/dashboard/notifications")}>
              View Details
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md" onClick={() => setActiveToast(null)}>
            <X className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      )}
    </header>
  );
}
