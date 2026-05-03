"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  History, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft 
} from "lucide-react";
import Link from "next/link";
import { cn, formatDate } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: string;
  word: string;
  stageIndex: number;
  score: number;
  timestamp: string;
}

interface ProgressItem {
  id: string;
  status: "IN_PROGRESS" | "RETRY" | "COMPLETED" | "FAILED";
  currentStage: number;
  totalScore: number;
  word: {
    id: string;
    word: string;
    partOfSpeech: string;
  };
  startedAt: string;
  stageScores: any[];
}

import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, TrendingUp, Calendar, Zap, Target } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ActivitiesPage() {
  const { user, getAuthHeaders } = useAuthStore();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [progressList, setProgressList] = useState<ProgressItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedWordId, setExpandedWordId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"history" | "feed">("history");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = await getAuthHeaders();
        const [activityRes, progressRes] = await Promise.all([
          fetch("/api/user/activity", { headers }),
          fetch("/api/user/progress", { headers })
        ]);

        if (activityRes.ok) {
          const data = await activityRes.json();
          setActivities(data.activities);
        }
        if (progressRes.ok) {
          const data = await progressRes.json();
          setProgressList(data.progress.filter((p: any) => p.stageScores && p.stageScores.length > 0));
        }
      } catch (error) {
        console.error("Failed to fetch activities", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchData();
  }, [user, getAuthHeaders]);

  const filteredProgress = progressList.filter(item => 
    item.word.word.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalWords: progressList.length,
    completedWords: progressList.filter(p => p.status === "COMPLETED").length,
    avgScore: progressList.length > 0 
      ? Math.round(progressList.reduce((acc, p) => acc + p.totalScore, 0) / progressList.length) 
      : 0
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin mb-6 text-primary" />
        <p className="text-sm font-bold uppercase tracking-wider opacity-50">Syncing your vault...</p>
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
              <h1 className="text-3xl font-bold tracking-tight text-gradient">Activity Vault</h1>
              <p className="text-muted-foreground font-medium text-sm">Chronicle of your linguistic journey</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search words..." 
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: "Words in Progress", value: stats.totalWords, icon: Target, color: "text-blue-500" },
            { label: "Mastery Level", value: stats.completedWords, icon: Zap, color: "text-amber-500" },
            { label: "Vault Average", value: `${stats.avgScore}%`, icon: TrendingUp, color: "text-emerald-500" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-border/50 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                <div className={`absolute top-0 left-0 w-1 h-full bg-linear-to-b from-primary/20 to-transparent`} />
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-2 px-2">
              <History className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold uppercase tracking-tight">Word Mastery Log</h2>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredProgress.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Card className="border-border/50 bg-muted/10 py-20 text-center">
                      <p className="text-muted-foreground font-medium italic">No matches found in your vault.</p>
                    </Card>
                  </motion.div>
                ) : (
                  filteredProgress.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card 
                        className={cn(
                          "border-border/50 overflow-hidden transition-all group cursor-pointer",
                          expandedWordId === item.id ? "ring-2 ring-primary/20 shadow-xl" : "hover:border-primary/30"
                        )}
                        onClick={() => setExpandedWordId(expandedWordId === item.id ? null : item.id)}
                      >
                        <div className="p-5 flex items-center justify-between bg-card group-hover:bg-muted/5">
                          <div className="flex items-center gap-5">
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-110",
                              item.status === "COMPLETED" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                            )}>
                              {item.status === "COMPLETED" ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="font-bold text-xl capitalize tracking-tight">{item.word.word}</h3>
                                <Badge variant="secondary" className="bg-muted text-[10px] uppercase font-bold tracking-wider">{item.word.partOfSpeech}</Badge>
                              </div>
                              <div className="flex items-center gap-4 mt-1">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${item.totalScore}%` }} />
                                  </div>
                                  <span className="text-[11px] font-bold text-muted-foreground">{item.totalScore}/100</span>
                                </div>
                                <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 opacity-60">
                                  <Calendar className="w-3 h-3" /> {new Date(item.startedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                            expandedWordId === item.id ? "bg-primary/10 text-primary" : "text-muted-foreground"
                          )}>
                            {expandedWordId === item.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedWordId === item.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="bg-muted/10 border-t border-border/50 p-6 space-y-6">
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                  {Array.from({ length: 10 }, (_, i) => i + 1).map((stageNum) => {
                                    const scoreObj = item.stageScores.find(s => s.stageNumber === stageNum);
                                    return (
                                      <div key={stageNum} className={cn(
                                        "p-4 rounded-[1.25rem] border flex flex-col items-center justify-center text-center gap-1.5 transition-all shadow-xs",
                                        scoreObj ? "bg-background border-primary/20" : "bg-muted/20 border-border/10 opacity-30"
                                      )}>
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Stage {stageNum}</span>
                                        <span className="text-base font-bold tracking-tight">{scoreObj ? `${scoreObj.score}` : "-"}</span>
                                        <div className="w-8 h-1 bg-muted rounded-full overflow-hidden">
                                          {scoreObj && <div className="h-full bg-primary" style={{ width: `${(scoreObj.score / 10) * 100}%` }} />}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                
                                <div className="flex items-center justify-between pt-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider opacity-60">Status: {item.status}</Badge>
                                  </div>
                                  <Link href={`/stage/${item.word.id}/summary`}>
                                    <Button variant="link" size="sm" className="text-primary font-bold text-xs uppercase tracking-wider">
                                      View mastery summary <ArrowLeft className="w-3 h-3 ml-1 rotate-180" />
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Activity Feed Area (Right Column) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2 px-2">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold uppercase tracking-tight">Real-time Feed</h2>
            </div>
            
            <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur-xs">
              <CardContent className="p-0">
                {activities.length === 0 ? (
                  <div className="p-16 text-center text-muted-foreground italic">
                    <p className="text-sm">No recent activity detected.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {activities.slice(0, 15).map((item, i) => (
                      <motion.div 
                        key={item.id} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-5 hover:bg-primary/5 transition-all flex items-start gap-4 group"
                      >
                        <div className={cn(
                          "mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:rotate-12",
                          item.score >= 80 ? 'bg-success/10 text-success' : 'bg-amber-500/10 text-amber-500'
                        )}>
                          {item.score >= 80 ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold leading-tight group-hover:text-primary transition-colors">
                            Mastered <span className="text-foreground">Stage {item.stageIndex}</span>
                          </p>
                          <p className="text-sm font-bold capitalize tracking-tight mt-0.5">"{item.word}"</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.score}/100 pts</span>
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground/60">{formatDate(item.timestamp)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
