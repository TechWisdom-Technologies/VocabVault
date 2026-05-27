"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  Bell, 
  Check, 
  ArrowRight, 
  MessageSquare, 
  ShieldAlert, 
  Clock,
  ChevronRight,
  Info,
  ReceiptText
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, isToday, isYesterday } from "date-fns";
import Link from "next/link";

export default function AdminNotificationsPage() {
  const { user, getAuthHeaders } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const markNotificationRead = async (id: string) => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/notifications/read", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [id] })
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/notifications", { headers });
        if (res.ok) {
          const { notifications: data } = await res.json();
          // Filter to show only administrative notification types
          const adminNotifs = (data || []).filter((n: any) =>
            ["FEEDBACK_RECEIVED", "PAYMENT_REQUESTED"].includes(n.type)
          );
          setNotifications(adminNotifs);
        }
      } catch (err) {
        console.error("Failed to load notifications", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchNotifications();
  }, [user, getAuthHeaders]);

  const groupedNotifications = useMemo(() => {
    const groups: { title: string; items: any[] }[] = [
      { title: "Today", items: [] },
      { title: "Yesterday", items: [] },
      { title: "Earlier", items: [] },
    ];

    notifications.forEach((n) => {
      const date = new Date(n.createdAt);
      if (isToday(date)) groups[0].items.push(n);
      else if (isYesterday(date)) groups[1].items.push(n);
      else groups[2].items.push(n);
    });

    return groups.filter(g => g.items.length > 0);
  }, [notifications]);

  const getNotifConfig = (type: string) => {
    switch (type) {
      case "PAYMENT_REQUESTED":
        return { 
          icon: ReceiptText, 
          color: "text-amber-400", 
          bg: "bg-amber-500/10 border-amber-500/20", 
          gradient: "from-amber-500/20 to-orange-500/5",
          border: "border-amber-500/20"
        };
      case "FEEDBACK_RECEIVED":
        return { 
          icon: MessageSquare, 
          color: "text-[#fb731f]", 
          bg: "bg-[#fb731f]/10 border-[#fb731f]/20", 
          gradient: "from-[#fb731f]/20 to-indigo-500/5",
          border: "border-[#fb731f]/20"
        };
      default:
        return { 
          icon: Bell, 
          color: "text-slate-400", 
          bg: "bg-slate-500/10 border-slate-500/20", 
          gradient: "from-slate-500/20 to-slate-500/5",
          border: "border-slate-500/20"
        };
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4 relative font-sans">
      
      {/* Glow blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#fb731f]/10 via-indigo-600/5 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-indigo-500/10 via-[#fb731f]/5 to-transparent blur-[140px] pointer-events-none" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6 relative z-10"
      >
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="absolute -inset-2 bg-[#fb731f]/20 rounded-2xl blur-lg group-hover:bg-[#fb731f]/30 transition-all" />
            <div className="relative w-14 h-14 rounded-2xl bg-[#fb731f]/10 border border-[#fb731f]/20 flex items-center justify-center text-[#fb731f] shrink-0">
              <ShieldAlert className="w-7 h-7 text-[#fb731f] animate-pulse" />
            </div>
          </div>
          <div>
            <Badge className="bg-[#fb731f]/10 text-[#fb731f] border border-[#fb731f]/20 font-bold px-3 py-1 rounded-xl uppercase text-[9px] tracking-widest font-sans">
              Admin Governance Feed
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-white uppercase italic leading-none mt-1">
              Intelligence Alerts
            </h1>
            <p className="text-white/40 text-xs font-semibold tracking-wider uppercase flex items-center gap-2 mt-1">
              System notifications, user requests, and manual payments
            </p>
          </div>
        </div>

        {notifications.filter(n => !n.read).length > 0 && (
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-xl self-start sm:self-center">
            {notifications.filter(n => !n.read).length} UNREAD
          </Badge>
        )}
      </motion.div>

      {/* Main List */}
      <div className="relative z-10">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 w-full bg-white/[0.02] animate-pulse rounded-3xl border border-white/[0.06]" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 px-6 rounded-[32px] border border-dashed border-white/10 bg-white/[0.01] backdrop-blur-md"
          >
            <div className="w-20 h-20 bg-white/[0.02] rounded-full flex items-center justify-center mx-auto mb-6 border border-white/[0.04]">
              <Bell className="w-10 h-10 text-white/10" />
            </div>
            <h3 className="text-xl font-serif font-black text-white uppercase italic mb-2">Protocol: All Secure</h3>
            <p className="text-white/20 max-w-xs mx-auto font-bold text-[10px] uppercase tracking-[0.2em]">
              No pending administrative intelligence logs in the secure queue.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-10">
            {groupedNotifications.map((group) => (
              <div key={group.title} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">{group.title}</h2>
                  <div className="h-px flex-1 bg-white/[0.06]" />
                </div>
                
                <motion.div 
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {group.items.map((notif) => {
                    const config = getNotifConfig(notif.type);
                    return (
                      <motion.div key={notif.id} variants={itemVariants}>
                        <Card className={cn(
                          "relative group overflow-hidden border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.02] backdrop-blur-md transition-all duration-500 hover:shadow-2xl hover:border-white/[0.15] rounded-[24px]",
                          !notif.read && "border-[#fb731f]/30 ring-1 ring-[#fb731f]/5 bg-white/[0.02]"
                        )}>
                          
                          {/* Left Accent border bar */}
                          <div className={cn("absolute inset-y-0 left-0 w-1 bg-[#fb731f]", notif.type === "PAYMENT_REQUESTED" ? "bg-amber-400" : "bg-[#fb731f]")} />
                          
                          <CardContent className="p-6 flex flex-col sm:flex-row gap-5">
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-105",
                              config.bg
                            )}>
                              <config.icon className={cn("w-5 h-5", config.color)} />
                            </div>
                            
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-start justify-between gap-4">
                                <h3 className="text-base font-black tracking-tight text-white capitalize group-hover:text-[#fb731f] transition-colors">
                                  {notif.title}
                                </h3>
                                <div className="flex items-center gap-2 text-white/30 shrink-0">
                                  <Clock className="w-3.5 h-3.5 text-[#fb731f]" />
                                  <span className="text-[9px] font-black uppercase tracking-widest">
                                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                  </span>
                                </div>
                              </div>
                              
                              <p className="text-sm text-white/60 leading-relaxed font-semibold">
                                {notif.message}
                              </p>
                              
                              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/[0.04]">
                                
                                {/* Action Buttons */}
                                <div className="flex items-center gap-2">
                                  {notif.type === "FEEDBACK_RECEIVED" && (
                                    <Link href="/admin/feedback">
                                      <Button 
                                        size="sm" 
                                        className="h-8 px-4 bg-[#fb731f]/10 border border-[#fb731f]/20 hover:bg-[#fb731f] text-[#fb731f] hover:text-white font-black uppercase tracking-widest text-[9px] rounded-xl transition-all shadow-lg active:scale-95 group/btn"
                                      >
                                        Audit Feedback Hub
                                        <ArrowRight className="w-3 h-3 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                      </Button>
                                    </Link>
                                  )}
                                  
                                  {notif.type === "PAYMENT_REQUESTED" && (
                                    <Link href="/admin/transactions">
                                      <Button 
                                        size="sm" 
                                        className="h-8 px-4 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-black font-black uppercase tracking-widest text-[9px] rounded-xl transition-all shadow-lg active:scale-95 group/btn"
                                      >
                                        Verify Payment Hub
                                        <ArrowRight className="w-3 h-3 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                      </Button>
                                    </Link>
                                  )}
                                </div>
                                
                                {/* Read indicators */}
                                <div className="flex items-center gap-3">
                                  {!notif.read && (
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fb731f]/10 text-[#fb731f] border border-[#fb731f]/20">
                                      <div className="w-1.5 h-1.5 rounded-full bg-[#fb731f] animate-pulse" />
                                      <span className="text-[9px] font-black uppercase tracking-widest">Priority Request</span>
                                    </div>
                                  )}

                                  {!notif.read && (
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      onClick={() => markNotificationRead(notif.id)} 
                                      className="h-8 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white border border-white/5 text-white/50 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                                    >
                                      Mark Read
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center hidden sm:block">
                              <ChevronRight className="w-5 h-5 text-white/20" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            ))}
            
            <div className="pt-10 flex justify-center">
              <div className="px-6 py-3 rounded-2xl bg-white/[0.01] border border-white/[0.06] text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-3">
                <Info className="w-4 h-4 text-[#fb731f]" />
                Audit Logs Limit: 50 Administrative Records
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
