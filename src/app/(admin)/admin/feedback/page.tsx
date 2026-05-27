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
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
      case 'BUG_REPORT': return <Bug className="w-4 h-4 text-rose-500" />;
      case 'FEATURE_REQUEST': return <Lightbulb className="w-4 h-4 text-amber-500" />;
      case 'STAGE_FEEDBACK': return <Zap className="w-4 h-4 text-sky-500" />;
      default: return <MessageSquare className="w-4 h-4 text-emerald-500" />;
    }
  };

  const filteredFeedback = feedback.filter(f => filter === "ALL" || f.category === filter);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">User Intelligence</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1 flex items-center gap-2">
            <MessageSquare className="w-3 h-3 text-primary" />
            Monitoring reports, bugs & community suggestions
          </p>
        </div>
        
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/5">
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
              className={`h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === cat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/20 hover:text-white'}`}
            >
              {cat === 'ALL' ? 'Total' : cat.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-48 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-xs font-black text-white/20 uppercase tracking-widest">Aggregating Global Reports...</p>
        </div>
      ) : filteredFeedback.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center gap-6 px-4">
          <div className="w-20 h-20 rounded-[32px] bg-white/5 flex items-center justify-center border border-white/5">
            <CheckCircle2 className="w-10 h-10 text-white/10" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-black text-white uppercase italic">No Active Reports</h3>
            <p className="text-white/20 text-sm font-medium mt-1">The system is currently operating within optimal parameters.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 px-4">
          {filteredFeedback.map((item) => (
            <Card key={item.id} className="bg-white/5 border-white/5 rounded-[32px] overflow-hidden hover:bg-white/8 transition-all duration-300">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/5">
                  {/* Report Details */}
                  <div className="flex-[1.5] p-8 space-y-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-white/10 text-white/40 border-0 text-[9px] font-black uppercase px-2 py-1 flex items-center gap-1.5">
                            {getCategoryIcon(item.category)}
                            {item.category.replace('_', ' ')}
                          </Badge>
                          {item.stageNumber && (
                            <Badge className="bg-sky-500/10 text-sky-500 border-0 text-[9px] font-black uppercase px-2 py-1">Stage {item.stageNumber}</Badge>
                          )}
                        </div>
                        <h2 className="text-xl font-black text-white tracking-tight uppercase italic underline decoration-primary/30 underline-offset-8 decoration-2">{item.subject}</h2>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Status</div>
                        <Badge className={`rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${item.status === 'NEW' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-white/5 text-white/40'}`}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                      <p className="text-sm text-white/60 font-medium leading-relaxed italic">&quot;{item.message}&quot;</p>
                      {item.word && (
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Related Word:</span>
                          <span className="text-xs font-black text-primary uppercase tracking-tighter italic">{item.word.word}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-white/20 font-black uppercase tracking-widest">
                      <Clock className="w-3 h-3" />
                      Submitted: {formatDate(item.createdAt)}
                    </div>
                  </div>

                  {/* Reporter Profile */}
                  <div className="flex-1 bg-white/2 p-8 space-y-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">
                      <User className="w-3 h-3" />
                      Reported By
                    </div>

                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${item.user.plan === 'PRO' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-white/10 text-white/40'}`}>
                        {item.user.name ? item.user.name[0].toUpperCase() : <User className="w-6 h-6" />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-white tracking-tight">{item.user.name || "Anonymous"}</h3>
                          {item.user.plan === 'PRO' && <Badge className="bg-amber-500/20 text-amber-500 border-0 text-[8px] font-black uppercase px-1.5 h-4">Pro</Badge>}
                        </div>
                        <p className="text-xs text-white/30 font-medium flex items-center gap-1.5">
                          <Mail className="w-3 h-3" />
                          {item.user.email}
                        </p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">
                        <span>Governance Actions</span>
                        <Badge variant="outline" className={cn(
                          "border-none text-[8px] px-2 h-4",
                          item.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-500' : 
                          item.status === 'IN_PROGRESS' ? 'bg-sky-500/10 text-sky-500' : 'bg-white/5 text-white/40'
                        )}>
                          {item.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          onClick={() => handleStatusUpdate(item.id, 'IN_PROGRESS')}
                          disabled={isLoadingStatus === item.id || item.status === 'IN_PROGRESS'}
                          variant="ghost" 
                          className="h-9 rounded-xl bg-white/5 border border-white/5 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 text-[9px] font-black uppercase tracking-widest"
                        >
                          {isLoadingStatus === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'In Progress'}
                        </Button>
                        <Button 
                          onClick={() => handleStatusUpdate(item.id, 'RESOLVED')}
                          disabled={isLoadingStatus === item.id || item.status === 'RESOLVED'}
                          variant="ghost" 
                          className="h-9 rounded-xl bg-white/5 border border-white/5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 text-[9px] font-black uppercase tracking-widest"
                        >
                          {isLoadingStatus === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Resolve'}
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        onClick={() => openFullProfile(item.user.id)}
                        className="w-full h-9 rounded-xl bg-white/5 border border-white/5 text-white/20 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
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

      <Dialog open={Boolean(selectedUser) || isProfileLoading || Boolean(profileError)} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent showCloseButton={false} className="w-[min(96vw,78rem)] max-w-none max-h-[90vh] border-white/10 bg-[#0b0b0c] text-white rounded-[32px] p-0 overflow-hidden shadow-2xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-[#0b0b0c]/95 px-5 sm:px-6 py-4 backdrop-blur-xl">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/25">Reporter Profile</p>
                <p className="text-sm text-white/55 truncate">Full account information in one place</p>
              </div>
            </div>

            <Button variant="ghost" className="rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white text-[10px] font-black uppercase tracking-widest" onClick={() => setSelectedUser(null)}>
              Close
            </Button>
          </div>

          <div className="max-h-[calc(90vh-73px)] overflow-y-auto">
            <div className="p-5 sm:p-6 lg:p-8 space-y-6">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Full Profile
              </DialogTitle>
              <DialogDescription className="text-white/45">
                Complete account details for the reporter.
              </DialogDescription>
            </DialogHeader>

            {isProfileLoading && (
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-white/40">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                Loading profile...
              </div>
            )}

            {profileError && !isProfileLoading && (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                {profileError}
              </div>
            )}

              {selectedUser && !isProfileLoading && (
                <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
                      <div className="rounded-[28px] bg-white/5 border border-white/5 p-5 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20">Identity</p>
                          <Badge className="bg-white/10 text-white/50 border-0 text-[9px] font-black uppercase px-2">{selectedUser.plan}</Badge>
                        </div>
                        <div className="space-y-2">
                          <p className="text-2xl font-black text-white">{selectedUser.name || "Anonymous"}</p>
                          <p className="text-sm text-white/50 break-all">{selectedUser.email}</p>
                          <p className="text-sm text-white/50">Phone: {selectedUser.phone || "Not provided"}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={`border-0 text-[9px] font-black uppercase px-2 ${selectedUser.isLocked ? "bg-rose-500/15 text-rose-300" : "bg-emerald-500/10 text-emerald-300"}`}>
                            {selectedUser.isLocked ? "Locked" : "Active"}
                          </Badge>
                          <Badge className="border-0 text-[9px] font-black uppercase px-2 bg-white/10 text-white/50">{selectedUser.role}</Badge>
                        </div>
                      </div>

                      <div className="rounded-[28px] bg-linear-to-br from-primary/15 via-white/5 to-transparent border border-primary/15 p-5 space-y-3">
                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20">Summary</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="rounded-2xl bg-black/20 border border-white/5 p-3">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Streak</p>
                            <p className="mt-1 text-lg font-black text-white">{selectedUser.currentStreak}</p>
                          </div>
                          <div className="rounded-2xl bg-black/20 border border-white/5 p-3">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Score</p>
                            <p className="mt-1 text-lg font-black text-white">{selectedUser.totalScore}</p>
                          </div>
                          <div className="rounded-2xl bg-black/20 border border-white/5 p-3">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Words</p>
                            <p className="mt-1 text-lg font-black text-white">{selectedUser.wordsLearned}</p>
                          </div>
                          <div className="rounded-2xl bg-black/20 border border-white/5 p-3">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Days</p>
                            <p className="mt-1 text-lg font-black text-white">{selectedUser.dayCount}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[28px] bg-white/5 border border-white/5 p-5 space-y-2">
                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20">Profile</p>
                        <p className="text-sm text-white/50">Profession: {selectedUser.profession || "Not provided"}</p>
                        <p className="text-sm text-white/50">Nationality: {selectedUser.nationality || "Not provided"}</p>
                        <p className="text-sm text-white/50">DOB: {selectedUser.dob ? new Date(selectedUser.dob).toLocaleDateString() : "Not provided"}</p>
                        <p className="text-sm text-white/50">Reason: {selectedUser.reason || "Not provided"}</p>
                      </div>

                      <div className="rounded-[28px] bg-black/30 border border-white/5 p-5 space-y-2">
                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20">Lock State</p>
                        <p className="text-sm text-white/50">{selectedUser.isLocked ? `Locked: ${selectedUser.lockReason || "No reason provided"}` : "Unlocked"}</p>
                        <p className="text-sm text-white/30">Created {formatDate(selectedUser.createdAt)}</p>
                        <p className="text-sm text-white/30">Updated {formatDate(selectedUser.updatedAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[28px] bg-white/5 border border-white/5 p-5 space-y-4 sticky top-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20">Actionable snapshot</p>
                      <div className="space-y-3 text-sm text-white/55 leading-relaxed">
                        <p><span className="text-white/80 font-bold">User ID:</span> {selectedUser.id}</p>
                        <p><span className="text-white/80 font-bold">Email:</span> {selectedUser.email}</p>
                        <p><span className="text-white/80 font-bold">Phone:</span> {selectedUser.phone || "Not provided"}</p>
                        <p><span className="text-white/80 font-bold">Plan:</span> {selectedUser.plan}</p>
                        <p><span className="text-white/80 font-bold">Role:</span> {selectedUser.role}</p>
                        <p><span className="text-white/80 font-bold">Status:</span> {selectedUser.isLocked ? "Locked" : "Active"}</p>
                      </div>
                      <div className="rounded-2xl bg-black/30 border border-white/5 p-4 text-sm text-white/45">
                        This panel is scrollable and intentionally wider so long profile values stay readable.
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
