"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  Bell, 
  Trophy, 
  Check, 
  ArrowRight, 
  MessageSquare, 
  Sparkles, 
  Flame, 
  BookOpen, 
  Star,
  Info,
  ChevronRight,
  Clock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, isToday, isYesterday } from "date-fns";

export default function NotificationsPage() {
  const { user, getAuthHeaders } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/notifications", { headers });
        if (res.ok) {
          const { notifications: data } = await res.json();
          setNotifications(data);
          
          const unreadIds = data.filter((n: any) => !n.read).map((n: any) => n.id);
          if (unreadIds.length > 0) {
            await fetch("/api/notifications/read", {
              method: "POST",
              headers: { ...headers, "Content-Type": "application/json" },
              body: JSON.stringify({ notificationIds: unreadIds })
            });
          }
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
      case "CHALLENGE_RECEIVED":
        return { 
          icon: Trophy, 
          color: "text-amber-500", 
          bg: "bg-amber-500/10", 
          gradient: "from-amber-500/20 to-orange-500/5",
          border: "border-amber-500/20"
        };
      case "FEEDBACK_RECEIVED":
        return { 
          icon: MessageSquare, 
          color: "text-blue-500", 
          bg: "bg-blue-500/10", 
          gradient: "from-blue-500/20 to-indigo-500/5",
          border: "border-blue-500/20"
        };
      case "WELCOME":
        return { 
          icon: Sparkles, 
          color: "text-primary", 
          bg: "bg-primary/10", 
          gradient: "from-primary/20 to-violet-500/5",
          border: "border-primary/20"
        };
      case "STREAK_MILESTONE":
        return { 
          icon: Flame, 
          color: "text-orange-500", 
          bg: "bg-orange-500/10", 
          gradient: "from-orange-500/20 to-red-500/5",
          border: "border-orange-500/20"
        };
      case "WORD_MASTERED":
        return { 
          icon: BookOpen, 
          color: "text-emerald-500", 
          bg: "bg-emerald-500/10", 
          gradient: "from-emerald-500/20 to-teal-500/5",
          border: "border-emerald-500/20"
        };
      default:
        return { 
          icon: Bell, 
          color: "text-slate-500", 
          bg: "bg-slate-500/10", 
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Aesthetic Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-3xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12"
        >
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="absolute -inset-2 bg-primary/20 rounded-2xl blur-lg group-hover:bg-primary/30 transition-all" />
              <div className="relative w-14 h-14 rounded-2xl bg-linear-to-br from-primary to-primary-600 flex items-center justify-center shadow-xl shadow-primary/20">
                <Bell className="w-7 h-7 text-white animate-bounce" style={{ animationDuration: '3s' }} />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                Notifications
                {notifications.filter(n => !n.read).length > 0 && (
                  <Badge className="bg-primary text-white border-none font-bold text-[10px] uppercase tracking-widest px-2.5 py-1">
                    {notifications.filter(n => !n.read).length} NEW
                  </Badge>
                )}
              </h1>
              <p className="text-muted-foreground text-sm font-bold tracking-wider uppercase opacity-70 mt-1">Updates & Announcements</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
             <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                   <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                      <Star className="w-3.5 h-3.5 text-primary" />
                   </div>
                ))}
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Intelligence Stream Active</span>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-24 w-full bg-muted/40 animate-pulse rounded-2xl border border-border/50" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 px-6 rounded-3xl border border-dashed border-border/50 bg-background/50 backdrop-blur-md"
          >
            <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-2">Protocol: All Clear</h3>
            <p className="text-muted-foreground max-w-xs mx-auto font-bold text-[10px] uppercase tracking-[0.2em] opacity-60">
              No pending intelligence reports found in your current secure session.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {groupedNotifications.map((group) => (
              <div key={group.title} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/70">{group.title}</h2>
                  <div className="h-px flex-1 bg-border/30" />
                </div>
                
                <motion.div 
                  className="space-y-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {group.items.map((notif) => {
                    const config = getNotifConfig(notif.type);
                    return (
                      <motion.div key={notif.id} variants={itemVariants}>
                        <Card className={cn(
                          "relative group overflow-hidden border-border/50 bg-background/50 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 rounded-[1.5rem]",
                          !notif.read && "border-primary/30 ring-1 ring-primary/10"
                        )}>
                          {/* Left Accent Gradient */}
                          <div className={cn("absolute inset-y-0 left-0 w-1.5 bg-linear-to-b", config.gradient)} />
                          
                          <CardContent className="p-5 flex gap-5">
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                              config.bg
                            )}>
                              <config.icon className={cn("w-6 h-6", config.color)} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 mb-1">
                                <h3 className="text-base font-black tracking-tight capitalize group-hover:text-primary transition-colors">
                                  {notif.title}
                                </h3>
                                <div className="flex items-center gap-2 text-muted-foreground/50">
                                  <Clock className="w-3 h-3" />
                                  <span className="text-[10px] font-bold uppercase tracking-widest">
                                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                  </span>
                                </div>
                              </div>
                              
                              <p className="text-sm text-foreground/70 leading-relaxed font-medium mb-4">
                                {notif.message}
                              </p>
                              
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  {notif.type === "CHALLENGE_RECEIVED" && notif.metadata?.challengeId && (
                                    <Button 
                                      size="sm" 
                                      className="h-9 px-5 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[9px] rounded-xl shadow-lg shadow-primary/20 group/btn"
                                      onClick={async () => {
                                        try {
                                          const headers = await getAuthHeaders();
                                          const res = await fetch("/api/challenges/accept", {
                                            method: "POST",
                                            headers: { ...headers, "Content-Type": "application/json" },
                                            body: JSON.stringify({ challengeId: notif.metadata.challengeId })
                                          });
                                          if (res.ok) {
                                            const data = await res.json();
                                            window.location.href = data.redirectUrl;
                                          }
                                        } catch (err) {
                                          console.error("Failed to accept challenge", err);
                                        }
                                      }}
                                    >
                                      Accept Mission
                                      <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                  )}
                                  
                                  {notif.type === "FEEDBACK_RECEIVED" && (
                                    <Badge variant="outline" className="bg-blue-500/5 text-blue-600 border-blue-500/20 font-bold text-[9px] uppercase tracking-widest py-1 px-3">
                                      RESPONSE REQUIRED
                                    </Badge>
                                  )}
                                </div>
                                
                                {!notif.read && (
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">New Priority</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center">
                               <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
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
               <div className="px-6 py-3 rounded-2xl bg-muted/20 border border-border/50 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-3">
                  <Info className="w-4 h-4" />
                  Historical Intelligence Limit: 50 Records
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
