"use client";

import { useEffect, useState } from "react";

import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Trophy, 
  Loader2, 
  Medal, 
  Zap, 
  Users, 
  Globe, 
  ArrowLeft, 
  ChevronRight,
  Target,
  Swords,
  Sparkles,
  TrendingUp,
  UserPlus,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface LeaderboardUser {
  id: string;
  name: string;
  avatarUrl: string | null;
  totalScore: number;
  wordsLearned: number;
  currentStreak: number;
  isFollowing?: boolean;
}

export default function LeaderboardPage() {
  const { user, getAuthHeaders } = useAuthStore();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"global" | "friends">("global");
  const [sortBy, setSortBy] = useState<"totalScore" | "wordsLearned" | "currentStreak">("totalScore");
  const [challengeModalOpen, setChallengeModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<LeaderboardUser | null>(null);
  const [masteredWords, setMasteredWords] = useState<any[]>([]);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [isChallenging, setIsChallenging] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user's mastered words for challenging others
    const fetchMastered = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/user/mastered", { headers });
        if (res.ok) {
          const data = await res.json();
          setMasteredWords(data.words);
        }
      } catch (err) {
        console.error("Failed to fetch mastered words", err);
      }
    };
    if (user) fetchMastered();
  }, [user, getAuthHeaders]);

  useEffect(() => {
    const fetchLeaderboard = async (currentFilter: "global" | "friends") => {
      setIsLoading(true);
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`/api/leaderboard?filter=${currentFilter}&sortBy=${sortBy}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setUsers(data.leaderboard);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard(filter);
    const interval = window.setInterval(() => fetchLeaderboard(filter), 30000);
    return () => window.clearInterval(interval);
  }, [filter, sortBy, getAuthHeaders]);

  const toggleFollow = async (targetId: string) => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/user/follow", {
        method: "POST",
        headers,
        body: JSON.stringify({ targetUserId: targetId }),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(prev => prev.map(u => u.id === targetId ? { ...u, isFollowing: data.isFollowing } : u));
      }
    } catch (err) {
      console.error("Failed to toggle follow", err);
    }
  };

  const handleChallenge = async () => {
    if (!targetUser || !selectedWordId) return;
    setIsChallenging(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers,
        body: JSON.stringify({ challengedId: targetUser.id, wordId: selectedWordId }),
      });
      if (res.ok) {
        setChallengeModalOpen(false);
        setTargetUser(null);
        setSelectedWordId(null);
        setSuccessMessage("Challenge sent successfully!");
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (err) {
      console.error("Failed to send challenge", err);
    } finally {
      setIsChallenging(false);
    }
  };

  const podiumUsers = users.slice(0, 3);
  const remainingUsers = users.slice(3);

  return (
    <>
    <div className="min-h-screen bg-background relative overflow-hidden pb-10">
      {/* Dynamic Background Aesthetic */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[20%] left-[-10%] w-[40%] h-[30%] bg-violet-500/10 blur-[100px] rounded-full" />
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-amber-500/5 blur-[80px] rounded-full" />
      </div>

      {/* Sticky Premium Header */}
      <div className="sticky top-0 z-50 w-full bg-background/60 backdrop-blur-xl border-b border-white/10 px-4 py-3 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-black tracking-tight bg-linear-to-r from-primary to-violet-500 bg-clip-text text-transparent">
              LEADERBOARD
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black text-[10px] tracking-widest px-2 py-0.5 rounded-lg hidden sm:flex">
              LIVE RANKINGS
            </Badge>
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-primary" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto space-y-8">
        {/* Main Filters & Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex bg-muted/40 p-1.5 rounded-[1.25rem] border border-white/5 backdrop-blur-md shadow-inner">
              {[
                { id: "global", label: "Global", icon: Globe },
                { id: "friends", label: "Following", icon: Users }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFilter(opt.id as any)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300",
                    filter === opt.id 
                      ? "bg-primary text-white shadow-lg shadow-primary/25" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <opt.icon className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar sm:pb-0">
              {[
                { id: "totalScore", label: "XP", icon: Zap },
                { id: "wordsLearned", label: "Mastery", icon: Target },
                { id: "currentStreak", label: "Streak", icon: TrendingUp }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id as any)}
                  className={cn(
                    "whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all",
                    sortBy === opt.id 
                      ? "bg-violet-500/10 border-violet-500/50 text-violet-500 shadow-xs" 
                      : "bg-background/50 border-white/5 text-muted-foreground hover:border-primary/30"
                  )}
                >
                  <opt.icon className="w-3 h-3" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Re-designed Podium Section */}
        <AnimatePresence mode="wait">
          {!isLoading && users.length >= 3 && (
            <motion.div 
              key={`${filter}-${sortBy}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative flex flex-col md:flex-row items-end justify-center gap-4 md:gap-0 pt-16 pb-8"
            >
              {/* 2nd Place */}
              <div className="order-2 md:order-1 flex flex-col items-center w-full md:w-64">
                <div className="relative mb-6">
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-slate-300 shadow-xl relative z-10">
                    <AvatarImage src={podiumUsers[1].avatarUrl || undefined} />
                    <AvatarFallback className="text-2xl font-black bg-slate-100">{podiumUsers[1].name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-400 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg z-20 border-2 border-background">
                    RANK 2
                  </div>
                </div>
                <div className="text-center mb-4">
                  <p className="font-black text-sm tracking-tight capitalize">{podiumUsers[1].name}</p>
                  <div className="flex items-center justify-center gap-1.5 text-muted-foreground font-black text-[10px]">
                    <Zap className="w-3 h-3 text-slate-400" />
                    {podiumUsers[1].totalScore.toLocaleString()} XP
                  </div>
                </div>
                <div className="hidden md:block w-full h-24 bg-slate-300/10 rounded-t-3xl border-x border-t border-slate-300/20" />
              </div>

              {/* 1st Place */}
              <div className="order-1 md:order-2 flex flex-col items-center w-full md:w-72 z-20">
                <div className="relative mb-8">
                  <div className="absolute -inset-6 bg-amber-500/20 blur-[40px] rounded-full animate-pulse" />
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 z-30"
                  >
                    <Trophy className="w-12 h-12 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                  </motion.div>
                  <Avatar className="w-28 h-28 sm:w-36 sm:h-36 border-4 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.3)] relative z-10">
                    <AvatarImage src={podiumUsers[0].avatarUrl || undefined} />
                    <AvatarFallback className="text-4xl font-black bg-amber-50">{podiumUsers[0].name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[11px] font-black px-4 py-1.5 rounded-full shadow-xl z-20 border-2 border-background animate-bounce">
                    CHAMPION
                  </div>
                </div>
                <div className="text-center mb-6">
                  <p className="font-black text-lg tracking-tighter capitalize">{podiumUsers[0].name}</p>
                  <div className="flex items-center justify-center gap-1.5 text-amber-600 font-black text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    {podiumUsers[0].totalScore.toLocaleString()} XP
                  </div>
                </div>
                <div className="hidden md:block w-full h-36 bg-amber-500/10 rounded-t-[3rem] border-x border-t border-amber-500/20 shadow-[0_-10px_40px_rgba(245,158,11,0.05)]" />
              </div>

              {/* 3rd Place */}
              <div className="order-3 flex flex-col items-center w-full md:w-64">
                <div className="relative mb-6">
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-amber-700/40 shadow-xl relative z-10">
                    <AvatarImage src={podiumUsers[2].avatarUrl || undefined} />
                    <AvatarFallback className="text-2xl font-black bg-amber-50">{podiumUsers[2].name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-700 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg z-20 border-2 border-background">
                    RANK 3
                  </div>
                </div>
                <div className="text-center mb-4">
                  <p className="font-black text-sm tracking-tight capitalize">{podiumUsers[2].name}</p>
                  <div className="flex items-center justify-center gap-1.5 text-muted-foreground font-black text-[10px]">
                    <Zap className="w-3 h-3 text-amber-700" />
                    {podiumUsers[2].totalScore.toLocaleString()} XP
                  </div>
                </div>
                <div className="hidden md:block w-full h-20 bg-amber-700/5 rounded-t-3xl border-x border-t border-amber-700/10" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Premium Table Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              RISING COMPETITORS
            </h2>
            <Badge variant="ghost" className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2.5 py-1 rounded-lg">
              {users.length} LEARNERS
            </Badge>
          </div>

          {isLoading ? (
            <div className="py-32 flex flex-col items-center justify-center text-muted-foreground">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse rounded-full" />
                <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10" />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider opacity-50">Syncing rankings...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center text-muted-foreground gap-4">
              <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center">
                <Users className="w-10 h-10 opacity-20" />
              </div>
              <p className="font-bold uppercase tracking-tight text-lg">No rivals found</p>
              <p className="text-sm max-w-xs text-center opacity-70">Start following other learners or earn points to appear on the global list!</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {users.map((leader, index) => {
                const isCurrentUser = user?.id === leader.id;
                const isFollowing = leader.isFollowing;
                const rank = index + 1;
                
                return (
                  <motion.div 
                    key={leader.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      "group relative p-4 sm:p-6 rounded-[1.5rem] bg-background/40 backdrop-blur-sm border border-white/5 shadow-sm transition-all hover:bg-white/10 hover:shadow-lg active:scale-[0.98] cursor-pointer",
                      isCurrentUser && "ring-2 ring-primary bg-primary/5",
                      isFollowing && !isCurrentUser && "border-emerald-500/20"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="flex flex-col items-center justify-center w-8">
                        <span className={cn(
                          "text-sm font-black tabular-nums",
                          rank === 1 ? "text-amber-500 scale-125" :
                          rank === 2 ? "text-slate-400" :
                          rank === 3 ? "text-amber-700" :
                          "text-muted-foreground/30"
                        )}>
                          {rank}
                        </span>
                      </div>

                      {/* Avatar */}
                      <div className="relative">
                        <Avatar className={cn(
                          "w-12 h-12 sm:w-14 sm:h-14 border-2 shadow-inner",
                          isCurrentUser ? "border-primary" : "border-white/10"
                        )}>
                          <AvatarImage src={leader.avatarUrl || undefined} />
                          <AvatarFallback className="font-black text-lg bg-muted">
                            {leader.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {leader.currentStreak >= 5 && (
                          <div className="absolute -top-1 -right-1 bg-orange-500 rounded-full p-1 border-2 border-background shadow-lg">
                            <Zap className="w-2.5 h-2.5 text-white fill-white" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className={cn(
                            "font-black text-sm sm:text-base tracking-tight truncate",
                            isCurrentUser ? "text-primary" : "text-foreground"
                          )}>
                            {leader.name}
                          </p>
                          {isCurrentUser && <Badge className="bg-primary text-white text-[8px] font-black px-1.5 py-0 rounded-md uppercase tracking-tighter shadow-sm">YOU</Badge>}
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-[10px] text-muted-foreground font-black flex items-center gap-1 uppercase tracking-widest opacity-70">
                            <Target className="w-3 h-3" />
                            {leader.wordsLearned} MASTERED
                          </p>
                          <p className="text-[10px] text-orange-500 font-black flex items-center gap-1 uppercase tracking-widest">
                            <Zap className="w-3 h-3 fill-orange-500" />
                            {leader.currentStreak}D STREAK
                          </p>
                        </div>
                      </div>

                      {/* Score Section */}
                      <div className="text-right">
                        <p className="text-lg sm:text-xl font-black tabular-nums tracking-tighter">
                          {leader.totalScore.toLocaleString()}
                        </p>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                          TOTAL XP
                        </p>
                      </div>

                      {/* Quick Actions (Desktop Hover) */}
                      {!isCurrentUser && (
                        <div className="hidden sm:flex items-center gap-1 ml-4 border-l border-white/5 pl-4">
                          <Button 
                            variant="ghost" size="icon" 
                            className="h-10 w-10 rounded-xl text-primary hover:bg-primary/10"
                            onClick={() => { setTargetUser(leader); setChallengeModalOpen(true); }}
                          >
                            <Swords className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" size="icon" 
                            className={cn("h-10 w-10 rounded-xl", leader.isFollowing ? "text-emerald-500" : "text-muted-foreground")}
                            onClick={() => toggleFollow(leader.id)}
                          >
                            {leader.isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Mobile Actions Drawer (Simulated) */}
                    {!isCurrentUser && (
                      <div className="mt-4 pt-4 border-t border-white/5 flex sm:hidden items-center justify-between">
                        <Button 
                          variant="ghost" 
                          className="flex-1 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary"
                          onClick={() => { setTargetUser(leader); setChallengeModalOpen(true); }}
                        >
                          <Swords className="w-3.5 h-3.5 mr-2" /> Challenge
                        </Button>
                        <div className="w-px h-4 bg-white/5" />
                        <Button 
                          variant="ghost"
                          className={cn("flex-1 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest", leader.isFollowing ? "text-emerald-500" : "text-muted-foreground")}
                          onClick={() => toggleFollow(leader.id)}
                        >
                          {leader.isFollowing ? <><UserCheck className="w-3.5 h-3.5 mr-2" /> Following</> : <><UserPlus className="w-3.5 h-3.5 mr-2" /> Follow</>}
                        </Button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>

      <Dialog open={challengeModalOpen} onOpenChange={setChallengeModalOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-[2rem] border-border/50 shadow-2xl">
          <DialogHeader className="space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-2">
              <Swords className="w-8 h-8" />
            </div>
            <div className="text-center">
              <DialogTitle className="text-2xl font-black tracking-tight">Issue Challenge</DialogTitle>
              <DialogDescription className="font-medium mt-2">
                Choose one of your mastered words to challenge <span className="text-foreground font-bold">{targetUser?.name}</span>. If they accept, you'll enter the arena.
              </DialogDescription>
            </div>
          </DialogHeader>
          
          <ScrollArea className="h-[300px] w-full rounded-2xl border bg-muted/20 p-2 my-4">
            {masteredWords.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center opacity-50">
                  <Target className="w-6 h-6" />
                </div>
                <p className="text-sm font-black uppercase tracking-widest text-muted-foreground opacity-50">No Arsenal Ready</p>
                <p className="text-xs font-medium text-muted-foreground leading-relaxed">You must complete all 10 stages of a word to unlock it for challenges.</p>
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {masteredWords.map((word) => (
                  <button
                    key={word.id}
                    onClick={() => setSelectedWordId(word.id)}
                    className={cn(
                      "w-full text-left px-4 py-4 rounded-xl border transition-all relative group overflow-hidden",
                      selectedWordId === word.id 
                        ? 'bg-primary border-primary text-primary-foreground shadow-lg' 
                        : 'bg-background border-border hover:border-primary/50 hover:bg-primary/5'
                    )}
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-black text-lg capitalize">{word.word}</span>
                        <Badge variant="ghost" className={cn(
                          "rounded-full px-2 text-[9px] uppercase font-black tracking-tighter",
                          selectedWordId === word.id ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                        )}>Mastered</Badge>
                      </div>
                      <p className={cn(
                        "text-xs font-medium line-clamp-2",
                        selectedWordId === word.id ? "opacity-80" : "text-muted-foreground"
                      )}>{word.definition}</p>
                    </div>
                    {selectedWordId === word.id && (
                      <motion.div 
                        layoutId="activeWord"
                        className="absolute inset-0 bg-primary -z-0"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setChallengeModalOpen(false)} className="rounded-xl font-bold">Retreat</Button>
            <Button 
              disabled={!selectedWordId || isChallenging || masteredWords.length === 0} 
              onClick={handleChallenge}
              className="rounded-xl font-black uppercase tracking-widest px-8 shadow-lg shadow-primary/25"
            >
              {isChallenging ? <Loader2 className="w-4 h-4 animate-spin" /> : "Deploy Challenge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
