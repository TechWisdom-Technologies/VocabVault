"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Zap, 
  User, 
  Mail, 
  Loader2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Flame,
  Trophy,
  BookOpen,
  Calendar,
  ShieldAlert,
  Copy,
  Check,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface FeedbackItem {
  id: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  stageNumber: number | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    plan: string;
    profession: string | null;
    nationality: string | null;
  };
  word?: {
    word: string;
  } | null;
}

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  plan: string;
  role: string;
  isLocked: boolean;
  lockReason: string | null;
  createdAt: string;
  updatedAt: string;
  currentStreak: number;
  wordsLearned: number;
  totalScore: number;
  dayCount: number;
  profession: string | null;
  nationality: string | null;
  dob: string | null;
  reason: string | null;
  avatarUrl: string | null;
}

export default function AdminFeedbackPage() {
  const { getAuthHeaders } = useAuthStore();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStatus, setIsLoadingStatus] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fetchFeedback = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/admin/feedback", { headers });
      if (res.ok) {
        const data = await res.json();
        setFeedback(data.feedback);
      }
    } catch (error) {
      console.error("Failed to fetch feedback", error);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  const handleStatusUpdate = async (id: string, status: string) => {
    setIsLoadingStatus(id);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await fetchFeedback();
      }
    } catch (error) {
      console.error("Failed to update feedback status", error);
    } finally {
      setIsLoadingStatus(null);
    }
  };

  useEffect(() => {
    let isActive = true;

    const loadFeedback = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/admin/feedback", { headers });
        if (res.ok && isActive) {
          const data = await res.json();
          setFeedback(data.feedback);
        }
      } catch (error) {
        console.error("Failed to fetch feedback", error);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadFeedback();

    return () => {
      isActive = false;
    };
  }, [getAuthHeaders]);

  const openFullProfile = async (userId: string) => {
    setIsProfileLoading(true);
    setProfileError(null);
    setSelectedUser(null);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/users/${userId}`, { headers });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load profile");
      }

      const data = await res.json();
      setSelectedUser(data.user);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Failed to load profile");
    } finally {
      setIsProfileLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'BUG_REPORT': return <Bug className="w-4 h-4 text-rose-500 animate-pulse" />;
      case 'FEATURE_REQUEST': return <Lightbulb className="w-4 h-4 text-amber-500 animate-pulse" />;
      case 'STAGE_FEEDBACK': return <Zap className="w-4 h-4 text-cyan-400" />;
      default: return <MessageSquare className="w-4 h-4 text-[#fb731f]" />;
    }
  };

  const filteredFeedback = feedback.filter(f => filter === "ALL" || f.category === filter);

  // Real-time Visual metrics calculated dynamically
  const totalCount = feedback.length;
  const newCount = feedback.filter(item => item.status === "NEW").length;
  const bugCount = feedback.filter(item => item.category === "BUG_REPORT").length;
  const featureCount = feedback.filter(item => item.category === "FEATURE_REQUEST").length;
  const stageCount = feedback.filter(item => item.category === "STAGE_FEEDBACK").length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 sm:px-6 lg:px-8 relative font-sans overflow-hidden">
      
      {/* Premium ambient light glowing blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#fb731f]/10 via-indigo-600/5 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-indigo-500/10 via-[#fb731f]/5 to-transparent blur-[140px] pointer-events-none" />

      {/* Hero Header Title Block */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-6 relative z-10">
        <div className="space-y-2">
          <Badge className="bg-[#fb731f]/10 text-[#fb731f] border border-[#fb731f]/20 font-bold px-3 py-1.5 rounded-xl uppercase text-[9px] tracking-widest font-sans">
            Administrative Console
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-white uppercase italic leading-none">
            User Intelligence Hub
          </h1>
          <p className="text-white/40 text-xs font-semibold tracking-wider uppercase flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-[#fb731f]" />
            Community reports, staging audits, bugs & feedback metrics
          </p>
        </div>
        
        {/* Dynamic Category Pill Filters */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
          {[
            'ALL',
            'GENERAL',
            'BUG_REPORT',
            'FEATURE_REQUEST',
            'STAGE_FEEDBACK',
            'OTHER',
          ].map((cat) => (
            <Button
              key={cat}
              onClick={() => setFilter(cat)}
              variant="ghost"
              className={`h-9 px-4 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border ${filter === cat ? 'bg-[#fb731f] border-0 text-white shadow-lg shadow-[#fb731f]/20' : 'bg-transparent border-transparent text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              {cat === 'ALL' ? 'Total' : cat.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Visual Metrics Cards Dashboard Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5 relative z-10">
        {[
          { label: "Total Reports", value: totalCount, icon: MessageSquare, color: "text-[#fb731f] bg-[#fb731f]/10 border-[#fb731f]/20" },
          { label: "New Alerts", value: newCount, icon: TrendingUp, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
          { label: "Bugs Logged", value: bugCount, icon: Bug, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
          { label: "Feature Requests", value: featureCount, icon: Lightbulb, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
          { label: "Lesson Feedback", value: stageCount, icon: Zap, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="bg-white/[0.01] border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 rounded-[22px] overflow-hidden backdrop-blur-md">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">{stat.label}</p>
                  <p className="text-xl font-serif font-black text-white italic tracking-tight leading-none mt-0.5">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main List Layout */}
      <div className="relative z-10">
        {isLoading ? (
          <div className="py-48 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-[#fb731f] animate-spin" />
            <p className="text-xs font-black text-white/20 uppercase tracking-widest">Aggregating Global Reports...</p>
          </div>
        ) : filteredFeedback.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center gap-6 text-center">
            <div className="w-20 h-20 rounded-[32px] bg-white/[0.02] flex items-center justify-center border border-white/[0.06] shadow-xl">
              <CheckCircle2 className="w-10 h-10 text-white/10" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-black text-white uppercase italic">No Active Reports</h3>
              <p className="text-white/20 text-xs font-semibold uppercase tracking-widest mt-1">All systems operating within optimal margins.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredFeedback.map((item) => (
              <Card key={item.id} className="bg-white/[0.01] border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02] rounded-[32px] overflow-hidden transition-all duration-500 shadow-xl hover:shadow-2xl relative group/card">
                
                {/* Glowing status line indicator */}
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1 pointer-events-none",
                  item.status === "RESOLVED" ? "bg-emerald-500/50" : 
                  item.status === "IN_PROGRESS" ? "bg-cyan-500/50" : "bg-[#fb731f]/50"
                )} />

                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/[0.06]">
                    
                    {/* Left Panel: Detailed Feedback Context */}
                    <div className="flex-[1.5] p-6 sm:p-8 space-y-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="bg-white/[0.04] text-white/50 border border-white/[0.08] text-[9px] font-black uppercase px-2.5 py-1 flex items-center gap-1.5 rounded-lg">
                              {getCategoryIcon(item.category)}
                              {item.category.replace('_', ' ')}
                            </Badge>
                            {item.stageNumber && (
                              <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg">
                                Stage {item.stageNumber}
                              </Badge>
                            )}
                          </div>
                          <h2 className="text-xl sm:text-2xl font-serif font-black text-white tracking-tight uppercase italic leading-none">
                            {item.subject}
                          </h2>
                        </div>
                        
                        <div className="text-right shrink-0">
                          <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Audit Status</div>
                          <Badge className={cn(
                            "rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-widest border",
                            item.status === 'NEW' ? 'bg-[#fb731f]/10 text-[#fb731f] border-[#fb731f]/20' : 
                            item.status === 'IN_PROGRESS' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-white/5 text-white/40 border-white/5'
                          )}>
                            {item.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      {/* User's exact message blockquote */}
                      <div className="bg-black/40 rounded-2xl p-5 border border-white/[0.04] relative">
                        <p className="text-sm text-white/60 font-medium leading-relaxed italic pr-4">
                          &quot;{item.message}&quot;
                        </p>
                        {item.word && (
                          <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-2">
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Cognitive Word Reference:</span>
                            <span className="text-xs font-serif font-black text-[#fb731f] uppercase tracking-tight italic">
                              {item.word.word}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5 text-[9px] text-white/30 font-black uppercase tracking-widest font-sans">
                        <Clock className="w-3.5 h-3.5 text-[#fb731f]" />
                        Aggregation Log: {formatDate(item.createdAt)}
                      </div>
                    </div>

                    {/* Right Panel: Reporter Details & Actions */}
                    <div className="flex-1 bg-white/[0.01] p-6 sm:p-8 space-y-6">
                      <div className="flex items-center gap-2 text-[9px] font-black text-white/30 uppercase tracking-[0.25em]">
                        <User className="w-3.5 h-3.5 text-[#fb731f]" />
                        Reporter Account Details
                      </div>

                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shrink-0 border transition-transform duration-300 group-hover/card:scale-105",
                          item.user.plan === 'PRO' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-lg shadow-amber-500/5' : 'bg-white/5 text-white/40 border-white/5'
                        )}>
                          {item.user.name ? item.user.name[0].toUpperCase() : <User className="w-5 h-5 text-white/30" />}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="font-black text-white tracking-tight text-sm truncate max-w-[140px]">
                              {item.user.name || "Anonymous User"}
                            </h3>
                            {item.user.plan === 'PRO' && (
                              <Badge className="bg-amber-500/20 text-amber-500 border-0 text-[8px] font-black uppercase px-1.5 h-4.5 rounded">
                                Pro
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-white/40 font-semibold truncate flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-[#fb731f]" />
                            {item.user.email}
                          </p>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/[0.06] space-y-3.5">
                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-white/20">
                          <span>Governance Actions</span>
                          <span className="text-white/40">{item.status}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            onClick={() => handleStatusUpdate(item.id, 'IN_PROGRESS')}
                            disabled={isLoadingStatus === item.id || item.status === 'IN_PROGRESS'}
                            variant="ghost" 
                            className="h-9 rounded-xl bg-white/5 border border-white/10 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 text-[9px] font-black uppercase tracking-widest cursor-pointer disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]"
                          >
                            {isLoadingStatus === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'In Progress'}
                          </Button>
                          <Button 
                            onClick={() => handleStatusUpdate(item.id, 'RESOLVED')}
                            disabled={isLoadingStatus === item.id || item.status === 'RESOLVED'}
                            variant="ghost" 
                            className="h-9 rounded-xl bg-white/5 border border-white/10 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 text-[9px] font-black uppercase tracking-widest cursor-pointer disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]"
                          >
                            {isLoadingStatus === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Resolve'}
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          onClick={() => openFullProfile(item.user.id)}
                          className="w-full h-9 rounded-xl bg-white/5 border border-white/10 text-white/30 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest cursor-pointer active:scale-[0.98]"
                        >
                          View Full Profile
                        </Button>
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={Boolean(selectedUser) || isProfileLoading || Boolean(profileError)} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent showCloseButton={false} className="w-[min(96vw,64rem)] max-w-none sm:max-w-none gap-0 max-h-[85vh] border border-white/[0.08] bg-[#0c0a17] text-white rounded-[24px] p-0 overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.6)] group">
          
          {/* Accent mesh background glowing spots in dialog */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#fb731f]/10 via-indigo-600/5 to-transparent blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-indigo-500/10 via-[#fb731f]/5 to-transparent blur-[120px] pointer-events-none" />

          {/* Dialog Sticky Header */}
          <div className="relative z-10 sticky top-0 flex items-center justify-between border-b border-white/[0.06] bg-[#0c0a17]/95 px-6 sm:px-8 py-5 backdrop-blur-xl">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-[#fb731f]/10 border border-[#fb731f]/20 flex items-center justify-center text-[#fb731f] shrink-0">
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#fb731f]">Reporter Intelligence Panel</p>
                <p className="text-xs text-white/50 truncate font-medium">Comprehensive account standing, study performance, and lock records</p>
              </div>
            </div>

            <Button variant="ghost" className="h-10 px-5 rounded-2xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 text-xs font-black uppercase tracking-widest cursor-pointer active:scale-95 transition-all" onClick={() => setSelectedUser(null)}>
              Close View
            </Button>
          </div>

          {/* Dialog Content Area (Scrollbar Hidden & Centered View Height) */}
          <div className="relative z-10 h-[calc(85vh-83px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="max-w-7xl mx-auto p-6 sm:p-8 space-y-6">
              
              {isProfileLoading && (
                <div className="py-32 flex flex-col items-center justify-center gap-4 text-white/40">
                  <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                  <p className="text-sm font-black uppercase tracking-widest text-center">Aggregating User Intelligence...</p>
                </div>
              )}

              {profileError && !isProfileLoading && (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-100 flex items-center gap-3">
                  <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
                  {profileError}
                </div>
              )}

              {selectedUser && !isProfileLoading && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
                  
                  {/* High-Fidelity Header Avatar Banner */}
                  <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 border-b border-white/[0.08] pb-8">
                    <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                      <div className="w-20 h-20 rounded-[28px] bg-gradient-to-tr from-orange-500 to-indigo-600 p-0.5 shadow-lg shadow-indigo-500/20">
                        <div className="w-full h-full rounded-[26px] bg-[#0c0a17] flex items-center justify-center text-4xl font-black text-white italic">
                          {selectedUser.name ? selectedUser.name[0].toUpperCase() : <User className="w-9 h-9 text-white/40" />}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                          <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">{selectedUser.name || "Anonymous Reporter"}</h2>
                          <Badge className={cn("border-0 text-[9px] font-black uppercase px-2.5 h-6 rounded-md", selectedUser.plan === "PRO" ? "bg-amber-500/15 text-amber-500 border border-amber-500/20" : "bg-white/10 text-white/50")}>
                            {selectedUser.plan} Plan
                          </Badge>
                          <Badge className={cn("border-0 text-[9px] font-black uppercase px-2.5 h-6 rounded-md", selectedUser.isLocked ? "bg-rose-500/15 text-rose-300 border border-rose-500/20" : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20")}>
                            {selectedUser.isLocked ? "Locked" : "Active"}
                          </Badge>
                        </div>
                        <p className="text-sm text-white/50 font-semibold flex items-center gap-2 justify-center md:justify-start">
                          <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                          {selectedUser.email}
                        </p>
                      </div>
                    </div>

                    {/* Reference Copy Action block */}
                    <div className="flex flex-col items-center md:items-end gap-1.5 bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all rounded-2xl p-4 max-w-xs w-full sm:w-auto">
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/30">Account Reference ID</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-white/60 truncate max-w-[160px]">{selectedUser.id}</code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedUser.id);
                          }}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-[#fb731f] text-white/40 transition-all cursor-pointer active:scale-95"
                          title="Copy User ID"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* High-Fidelity Performance Metrics Grid */}
                  <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    {[
                      { label: "Study Streak", value: `${selectedUser.currentStreak} Days`, icon: Flame, color: "text-[#fb731f] bg-[#fb731f]/10 border-[#fb731f]/20 animate-pulse" },
                      { label: "Words Learned", value: `${selectedUser.wordsLearned} Words`, icon: BookOpen, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
                      { label: "Total Score", value: `${selectedUser.totalScore} Pts`, icon: Trophy, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                      { label: "Days Active", value: `${selectedUser.dayCount} Days`, icon: Calendar, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
                    ].map((m) => {
                      const Icon = m.icon;
                      return (
                        <div key={m.label} className="rounded-[24px] border border-white/[0.06] bg-white/[0.01] p-5 flex items-center gap-4 hover:border-white/[0.12] hover:bg-white/[0.03] transition-all duration-300">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${m.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{m.label}</p>
                            <p className="mt-0.5 text-xl font-black text-white italic tracking-tight">{m.value}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Two Column Structured Sections */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    
                    {/* User Demographic Details */}
                    <div className="rounded-[32px] border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8 space-y-5">
                      <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/[0.06] pb-3">
                        <User className="w-4 h-4 text-orange-500" />
                        Personal Profile Details
                      </div>
                      <div className="space-y-4 text-sm font-semibold">
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-white/40 shrink-0">Profession:</span>
                          <span className="text-white/85 text-right">{selectedUser.profession || "Not provided"}</span>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-white/40 shrink-0">Nationality:</span>
                          <span className="text-white/85 text-right">{selectedUser.nationality || "Not provided"}</span>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-white/40 shrink-0">Date of Birth:</span>
                          <span className="text-white/85 text-right">
                            {selectedUser.dob ? new Date(selectedUser.dob).toLocaleDateString(undefined, { dateStyle: 'long' }) : "Not provided"}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2 pt-4 border-t border-white/[0.06]">
                          <span className="text-white/40 font-semibold">Motivation for Studying:</span>
                          <p className="text-white/70 italic text-xs leading-relaxed bg-black/20 rounded-2xl p-4 border border-white/5 font-medium">
                            {selectedUser.reason ? `"${selectedUser.reason}"` : "No specific reason provided."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Security state and lock information */}
                    <div className="rounded-[32px] border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8 space-y-5">
                      <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/[0.06] pb-3">
                        <ShieldAlert className="w-4 h-4 text-orange-500" />
                        Account Security & Lock State
                      </div>
                      
                      {selectedUser.isLocked ? (
                        <div className="rounded-[20px] border border-rose-500/20 bg-rose-500/10 p-5 text-xs text-rose-300 space-y-2.5">
                          <div className="flex items-center gap-2 font-black uppercase tracking-wider text-[10px]">
                            <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
                            Account Suspended / Locked
                          </div>
                          <p className="font-semibold leading-relaxed">
                            Reason: {selectedUser.lockReason || "No suspension reason specified by administrative governance."}
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-[20px] border border-emerald-500/20 bg-emerald-500/10 p-5 text-xs text-emerald-300 space-y-1">
                          <div className="flex items-center gap-2 font-black uppercase tracking-wider text-[10px]">
                            <ShieldCheck className="w-4.5 h-4.5 shrink-0 animate-pulse" />
                            Account Standing Active
                          </div>
                          <p className="font-semibold leading-relaxed">
                            The user account has successfully passed session integrity checks.
                          </p>
                        </div>
                      )}

                      <div className="space-y-4 text-sm font-semibold pt-2">
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-white/40">Role Privilege:</span>
                          <Badge className="bg-white/10 text-white/60 border-0 text-[9px] font-black px-2.5 py-0.5 rounded">{selectedUser.role}</Badge>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-white/40">Registered:</span>
                          <span className="text-xs text-white/60">{formatDate(selectedUser.createdAt)}</span>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-white/40">Last Profile Update:</span>
                          <span className="text-xs text-white/60">{formatDate(selectedUser.updatedAt)}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
