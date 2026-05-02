"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Trophy, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap, 
  Target, 
  Swords, 
  Users, 
  Shield, 
  ArrowLeft,
  Loader2,
  Calendar
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function ChallengeHistoryPage() {
  const { user, getAuthHeaders } = useAuthStore();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/challenges/history", { headers });
        if (res.ok) {
          const data = await res.json();
          setChallenges(data.challenges);
        }
      } catch (err) {
        console.error("Failed to load challenge history", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchHistory();
  }, [user, getAuthHeaders]);

  const filteredChallenges = challenges.filter(c => 
    c.word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.challengerId === user?.id ? c.challenged.name : c.challenger.name).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = (() => {
    const completed = challenges.filter(c => c.status === "COMPLETED");
    const wins = completed.filter(c => {
      const isChallenger = c.challengerId === user?.id;
      return isChallenger 
        ? (c.challengerScore > (c.challengedScore || 0))
        : (c.challengedScore >= (c.challengerScore || 0));
    }).length;
    
    return {
      total: challenges.length,
      wins,
      losses: completed.length - wins,
      winRate: completed.length > 0 ? Math.round((wins / completed.length) * 100) : 0
    };
  })();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin mb-6 text-primary" />
        <p className="text-sm font-bold uppercase tracking-wider opacity-50">Loading word battles...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      {/* Header Section */}
      <div className="bg-background border-b border-border/50 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-primary/5 group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gradient">Challenge Arena</h1>
              <p className="text-muted-foreground font-medium text-sm">Review your history of word duels</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search duels..." 
                className="pl-10 rounded-2xl border-border/50 bg-muted/30 focus:bg-background transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto space-y-10">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[
            { label: "Total Duels", value: stats.total, icon: Swords, color: "text-blue-500" },
            { label: "Victories", value: stats.wins, icon: Trophy, color: "text-amber-500" },
            { label: "Defeats", value: stats.losses, icon: Shield, color: "text-rose-500" },
            { label: "Win Rate", value: `${stats.winRate}%`, icon: Zap, color: "text-emerald-500" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-border/50 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-primary/20 to-transparent" />
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</p>
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold uppercase tracking-tight text-foreground">Recent Battles</h2>
            </div>
            <Link href="/dashboard/leaderboard">
              <Button size="sm" className="rounded-2xl px-6 bg-primary shadow-lg shadow-primary/20 font-bold text-xs uppercase tracking-wider">
                New Challenge
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredChallenges.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="border-border/50 bg-muted/10 py-24 text-center">
                    <Trophy className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
                    <h3 className="text-xl font-bold mb-2">The arena is quiet</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto mb-8">No challenges found. Head over to the leaderboard to start your first duel!</p>
                    <Link href="/dashboard/leaderboard">
                      <Button className="rounded-2xl px-8 shadow-xl">Go to Leaderboard</Button>
                    </Link>
                  </Card>
                </motion.div>
              ) : (
                filteredChallenges.map((challenge, index) => {
                  const isChallenger = challenge.challengerId === user?.id;
                  const opponent = isChallenger ? challenge.challenged : challenge.challenger;
                  const isCompleted = challenge.status === "COMPLETED";
                  const youWon = isCompleted && (
                    isChallenger 
                      ? (challenge.challengerScore > (challenge.challengedScore || 0))
                      : (challenge.challengedScore >= (challenge.challengerScore || 0))
                  );

                  return (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="border-border/50 overflow-hidden hover:border-primary/30 group transition-all">
                        <CardContent className="p-0">
                          <div className="p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-6">
                            {/* Status Icon */}
                            <div className={cn(
                              "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-110",
                              !isCompleted ? 'bg-muted/50 text-muted-foreground' : youWon ? 'bg-success/10 text-success' : 'bg-rose-500/10 text-rose-500'
                            )}>
                              {!isCompleted ? <Clock className="w-8 h-8" /> : youWon ? <Trophy className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                            </div>

                            {/* Opponent & Word Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <Avatar className="w-8 h-8 border-2 border-background shadow-xs">
                                  <AvatarImage src={opponent.avatarUrl} />
                                  <AvatarFallback className="text-[10px] bg-linear-to-br from-violet-600 to-purple-600 text-white font-bold">
                                    {opponent.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-0.5">
                                    {isChallenger ? "You Challenged" : "Duel Request From"}
                                  </span>
                                  <span className="text-sm font-bold text-foreground">{opponent.name}</span>
                                </div>
                              </div>
                              <h3 className="text-2xl font-bold capitalize tracking-tight text-gradient mb-3">{challenge.word.word}</h3>
                              <div className="flex items-center gap-4">
                                <Badge variant="secondary" className="text-[9px] uppercase font-bold tracking-[0.1em] px-2.5 py-0.5">
                                  {challenge.status}
                                </Badge>
                                <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 opacity-60">
                                  <Calendar className="w-3.5 h-3.5" /> {new Date(challenge.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            {/* Scores */}
                            <div className="flex items-center gap-6 sm:px-10 sm:border-x border-border/50 py-4 sm:py-0">
                              <div className="flex flex-col items-center">
                                <span className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Your Score</span>
                                <span className={cn("text-2xl font-bold", youWon ? "text-success" : "text-foreground")}>
                                  {isChallenger ? (challenge.challengerScore || 0) : (challenge.challengedScore || 0)}
                                </span>
                              </div>
                              <div className="h-8 w-px bg-border/50" />
                              <div className="flex flex-col items-center opacity-60">
                                <span className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Opponent</span>
                                <span className="text-2xl font-bold">
                                  {isChallenger ? (challenge.challengedScore || 0) : (challenge.challengerScore || 0)}
                                </span>
                              </div>
                            </div>

                            {/* Action */}
                            <div className="flex items-center justify-end">
                              {isCompleted ? (
                                <Link href={`/dashboard/challenges/results/${challenge.id}`}>
                                  <Button className="rounded-2xl bg-muted/50 hover:bg-primary hover:text-white text-foreground transition-all group/btn px-6 font-bold text-xs uppercase tracking-wider h-12 shadow-sm">
                                    Full Results <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                  </Button>
                                </Link>
                              ) : (
                                <div className="flex flex-col items-center gap-1.5 px-4">
                                  <Badge className="bg-amber-500/10 text-amber-500 border-none animate-pulse">Pending</Badge>
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-40">Awaiting results</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
