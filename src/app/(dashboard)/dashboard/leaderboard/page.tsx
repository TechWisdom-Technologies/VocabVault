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
    <div className="min-h-screen bg-muted/20 pb-20 overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-primary/5 to-transparent -z-10" />
      <div className="absolute top-20 right-[10%] w-64 h-64 bg-amber-500/10 blur-3xl rounded-full -z-10" />
      <div className="absolute top-40 left-[10%] w-64 h-64 bg-violet-500/10 blur-3xl rounded-full -z-10" />

      <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto space-y-12">
        {/* Navigation & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-primary/5 group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gradient">The Hall of Fame</h1>
              <p className="text-muted-foreground font-medium text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                {filter === "global" ? "Competing with the world" : "Rivalry among followers"}
              </p>
            </div>
          </div>

          <div className="flex bg-muted/30 p-1 rounded-2xl border border-border/50">
            {[
              { id: "global", label: "Global", icon: Globe },
              { id: "friends", label: "Following", icon: Users }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFilter(opt.id as any)}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                  filter === opt.id 
                    ? "bg-background text-primary shadow-sm ring-1 ring-border/50" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <opt.icon className="w-3.5 h-3.5" />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sorting Section */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            { id: "totalScore", label: "Total XP", icon: Zap },
            { id: "wordsLearned", label: "Mastery", icon: Target },
            { id: "currentStreak", label: "Momentum", icon: TrendingUp }
          ].map((opt) => (
            <Button
              key={opt.id}
              variant={sortBy === opt.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy(opt.id as any)}
              className="rounded-full px-5 h-9 font-bold text-xs gap-2"
            >
              <opt.icon className="w-3.5 h-3.5" />
              {opt.label}
            </Button>
          ))}
        </div>

        {/* Podium Section */}
        <AnimatePresence mode="wait">
          {!isLoading && users.length >= 3 && (
            <motion.div 
              key={`${filter}-${sortBy}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-12 pb-6 max-w-4xl mx-auto"
            >
              {/* 2nd Place */}
              <div className="order-2 md:order-1 flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gray-400/20 blur-2xl rounded-full" />
                  <Avatar className="w-24 h-24 border-4 border-slate-300 relative z-10 shadow-2xl">
                    <AvatarImage src={podiumUsers[1].avatarUrl || undefined} />
                    <AvatarFallback className="text-2xl font-bold bg-slate-100">{podiumUsers[1].name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-slate-400 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg z-20 border-2 border-background">2</div>
                </div>
                <p className="font-bold text-lg text-center line-clamp-1">{podiumUsers[1].name}</p>
                <div className="flex items-center gap-1.5 text-slate-500 font-bold text-sm mb-4">
                  <Zap className="w-3.5 h-3.5" />
                  {podiumUsers[1].totalScore.toLocaleString()}
                </div>
                <div className="w-full h-24 bg-slate-200/50 rounded-t-3xl border-x border-t border-slate-300/50 backdrop-blur-sm" />
              </div>

              {/* 1st Place */}
              <div className="order-1 md:order-2 flex flex-col items-center scale-110 md:scale-125 z-20">
                <div className="relative mb-6">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-4 bg-linear-to-r from-amber-400 via-yellow-200 to-amber-600 rounded-full blur-xl opacity-30" 
                  />
                  <Avatar className="w-32 h-32 border-4 border-amber-400 relative z-10 shadow-[0_0_50px_rgba(251,191,36,0.3)]">
                    <AvatarImage src={podiumUsers[0].avatarUrl || undefined} />
                    <AvatarFallback className="text-3xl font-bold bg-amber-50">{podiumUsers[0].name[0]}</AvatarFallback>
                  </Avatar>
                  <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 z-20"
                  >
                    <Trophy className="w-10 h-10 text-amber-500 fill-amber-500/20 drop-shadow-lg" />
                  </motion.div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg z-20 border-2 border-background">1</div>
                </div>
                <p className="font-bold text-xl text-center line-clamp-1">{podiumUsers[0].name}</p>
                <div className="flex items-center gap-1.5 text-amber-600 font-bold text-base mb-6">
                  <Zap className="w-4 h-4" />
                  {podiumUsers[0].totalScore.toLocaleString()}
                </div>
                <div className="w-full h-32 bg-amber-400/20 rounded-t-3xl border-x border-t border-amber-400/50 backdrop-blur-md relative overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-b from-amber-400/10 to-transparent" />
                </div>
              </div>

              {/* 3rd Place */}
              <div className="order-3 flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-amber-700/20 blur-2xl rounded-full" />
                  <Avatar className="w-24 h-24 border-4 border-amber-700/50 relative z-10 shadow-2xl">
                    <AvatarImage src={podiumUsers[2].avatarUrl || undefined} />
                    <AvatarFallback className="text-2xl font-bold bg-amber-50">{podiumUsers[2].name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-amber-700 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg z-20 border-2 border-background">3</div>
                </div>
                <p className="font-bold text-lg text-center line-clamp-1">{podiumUsers[2].name}</p>
                <div className="flex items-center gap-1.5 text-amber-700 font-bold text-sm mb-4">
                  <Zap className="w-3.5 h-3.5" />
                  {podiumUsers[2].totalScore.toLocaleString()}
                </div>
                <div className="w-full h-20 bg-amber-700/20 rounded-t-3xl border-x border-t border-amber-700/30 backdrop-blur-sm" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table Section */}
        <Card className="border-border/50 shadow-2xl bg-card/50 backdrop-blur-xl rounded-3xl overflow-hidden relative border-t-primary/20">
          <div className="p-6 border-b border-border/50 bg-muted/20 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Rising Stars
            </h2>
            <div className="text-xs font-bold text-muted-foreground bg-background/50 px-3 py-1 rounded-full border border-border/50">
              {users.length} Learners Found
            </div>
          </div>
          
          <CardContent className="p-0">
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
              <div className="divide-y divide-border/30">
                {users.map((leader, index) => {
                  const isCurrentUser = user?.id === leader.id;
                  const isFollowing = leader.isFollowing;
                  const rank = index + 1;
                  
                  return (
                    <motion.div 
                      key={leader.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "group grid grid-cols-[50px_1fr_auto] sm:grid-cols-[60px_1fr_120px_120px_auto] gap-4 items-center p-4 sm:p-5 transition-all hover:bg-muted/30",
                        isCurrentUser && "bg-primary/5 border-l-4 border-l-primary",
                        isFollowing && !isCurrentUser && "bg-emerald-500/5 border-l-4 border-l-emerald-500/30"
                      )}
                    >
                      {/* Rank */}
                      <div className="flex justify-center">
                        <span className={cn(
                          "text-lg font-bold italic tabular-nums",
                          rank === 1 ? "text-amber-500" :
                          rank === 2 ? "text-slate-400" :
                          rank === 3 ? "text-amber-700" :
                          "text-muted-foreground opacity-30"
                        )}>
                          #{rank}
                        </span>
                      </div>
                      
                      {/* User Info */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="relative">
                          <Avatar className={cn(
                            "w-10 h-10 sm:w-12 sm:h-12 border-2 transition-transform group-hover:scale-105",
                            isCurrentUser ? "border-primary" : "border-border/50"
                          )}>
                            <AvatarImage src={leader.avatarUrl || undefined} />
                            <AvatarFallback className={cn(
                              "font-bold",
                              isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}>
                              {leader.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {leader.currentStreak >= 5 && (
                            <div className="absolute -top-1 -right-1 bg-orange-500 rounded-full p-0.5 border-2 border-background">
                              <Zap className="w-2.5 h-2.5 text-white fill-white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={cn(
                            "font-bold tracking-tight truncate flex items-center gap-2",
                            isCurrentUser ? "text-primary" : "text-foreground"
                          )}>
                            {leader.name}
                            {isCurrentUser && <span className="bg-primary/10 text-primary text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">You</span>}
                            {isFollowing && !isCurrentUser && <span className="bg-emerald-500/10 text-emerald-600 text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">Following</span>}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                            <Target className="w-3 h-3" />
                            {leader.wordsLearned} Mastered
                          </p>
                        </div>
                      </div>

                      {/* Streak */}
                      <div className="hidden sm:flex justify-center">
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Streak</span>
                          <div className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5",
                            leader.currentStreak > 0 ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground"
                          )}>
                            <Zap className={cn("w-3 h-3", leader.currentStreak > 0 && "fill-amber-500")} />
                            {leader.currentStreak}
                          </div>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="hidden sm:flex justify-end">
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Experience</span>
                          <span className="text-lg font-bold tracking-tighter tabular-nums">
                            {leader.totalScore.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Score Mobile */}
                      <div className="sm:hidden text-right pr-2">
                        <span className="text-base font-black tabular-nums">
                          {leader.totalScore.toLocaleString()}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-2 pl-2">
                        {!isCurrentUser && (
                          <>
                            <Button 
                              variant="ghost"
                              size="icon"
                              className="rounded-xl h-10 w-10 text-primary hover:bg-primary/5 transition-all active:scale-95"
                              onClick={() => {
                                setTargetUser(leader);
                                setChallengeModalOpen(true);
                              }}
                              title="Challenge"
                            >
                              <Swords className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "rounded-xl h-10 w-10 transition-all active:scale-95",
                                leader.isFollowing ? "text-emerald-500 hover:bg-emerald-50" : "text-muted-foreground hover:bg-muted"
                              )}
                              onClick={() => toggleFollow(leader.id)}
                              title={leader.isFollowing ? "Unfollow" : "Follow"}
                            >
                              {leader.isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                            </Button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
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
    </div>
  );
}
