"use client";

import { useEffect, useState } from "react";

import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp, 
  Target, 
  Zap, 
  BarChart3, 
  Activity as ActivityIcon, 
  Calendar as CalendarIcon,
  Search,
  LayoutGrid,
  List,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths, isSameMonth } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
}

interface Analytics {
  averageTimePerStage: number;
  averageScorePerStage: number;
  averageTimePerDay: number;
  stageByStageAverages: {
    stage: number;
    stageName: string;
    averageScore: number;
  }[];
  hourlyHeatmap: number[];
}

export default function ProgressPage() {
  const { getAuthHeaders, user } = useAuthStore();
  const [progressList, setProgressList] = useState<ProgressItem[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/user/progress", { headers });
        if (res.ok) {
          const data = await res.json();
          setProgressList(data.progress);
          setAnalytics(data.analytics);
        }
      } catch (error) {
        console.error("Failed to fetch progress", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchProgress();
  }, [user, getAuthHeaders]);

  const completedWords = progressList.filter(p => p.status === "COMPLETED");
  const inProgressWords = progressList.filter(p => p.status !== "COMPLETED");

  const averageScore = completedWords.length > 0 
    ? Math.round(completedWords.reduce((acc, p) => acc + p.totalScore, 0) / completedWords.length)
    : 0;

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Cumulative Progress
  const cumulativeData = progressList
    .filter(p => p.status === "COMPLETED")
    .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
    .map((p, idx) => ({
      date: format(new Date(p.startedAt), "MMM dd"),
      totalWords: idx + 1,
    }));

  // Daily Progress
  const dailyDataMap = new Map<string, number>();
  progressList
    .filter(p => p.status === "COMPLETED")
    .forEach((p) => {
      const day = format(new Date(p.startedAt), "MMM dd");
      dailyDataMap.set(day, (dailyDataMap.get(day) || 0) + 1);
    });
  
  const dailyData = Array.from(dailyDataMap.entries()).map(([date, count]) => ({
    date,
    wordsLearned: count,
  }));

  const vocabStrength = (() => {
    if (completedWords.length === 0) return 0;
    let totalStrength = 0;
    completedWords.forEach(word => {
      const daysSinceCompletion = Math.floor((new Date().getTime() - new Date(word.startedAt).getTime()) / (1000 * 3600 * 24));
      totalStrength += Math.max(0, 100 - (daysSinceCompletion * 5));
    });
    return Math.round(totalStrength / completedWords.length);
  })();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin mb-6 text-primary" />
        <p className="text-sm font-bold uppercase tracking-widest opacity-50">Calculating your impact...</p>
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
              <h1 className="text-3xl font-bold tracking-tight text-gradient">Mastery Analytics</h1>
              <p className="text-muted-foreground font-medium text-sm">Quantifying your linguistic evolution</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-2xl border border-border/50">
            <Badge variant="ghost" className="rounded-xl px-4 py-2 bg-background shadow-sm text-xs font-bold uppercase tracking-widest">Global Progress</Badge>
            <Badge variant="ghost" className="rounded-xl px-4 py-2 text-muted-foreground text-xs font-bold uppercase tracking-widest hover:text-foreground cursor-pointer">Weekly Detail</Badge>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto space-y-10">
        {/* Core KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[
            { label: "Mastered Words", value: completedWords.length, icon: Sparkles, color: "text-violet-500", bg: "bg-violet-500/10" },
            { label: "Learning Path", value: inProgressWords.length, icon: ActivityIcon, color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "Vocab Strength", value: `${vocabStrength}%`, icon: Zap, color: "text-emerald-500", bg: "bg-emerald-500/10", hasProgress: true },
            { label: "Success Rate", value: `${averageScore}%`, icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-border/50 shadow-sm hover:shadow-md transition-all group overflow-hidden relative h-full">
                <div className={cn("absolute top-0 left-0 w-1 h-full bg-linear-to-b from-transparent to-transparent", stat.color.replace('text-', 'bg-'))} />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-bold mb-3">{stat.value}</h3>
                  {stat.hasProgress && (
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        className={cn("h-full", stat.color.replace('text-', 'bg-'))} 
                        initial={{ width: 0 }}
                        animate={{ width: `${vocabStrength}%` }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Stage Analysis */}
          {analytics && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-8"
            >
              <Card className="border-border/50 shadow-sm overflow-hidden h-full">
                <CardHeader className="border-b border-border/50 bg-muted/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Stage Performance Delta
                      </CardTitle>
                      <p className="text-xs text-muted-foreground font-medium mt-1">Average efficiency across the 10-stage learning pipeline</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.stageByStageAverages}>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/50" vertical={false} />
                        <XAxis 
                          dataKey="stageName" 
                          stroke="currentColor" 
                          className="text-muted-foreground"
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                        />
                        <YAxis
                          stroke="currentColor"
                          className="text-muted-foreground"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          domain={[0, 10]}
                        />
                        <RechartsTooltip 
                          cursor={{ fill: 'rgba(var(--primary), 0.05)' }}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        />
                        <Bar 
                          dataKey="averageScore" 
                          fill="url(#barGradient)"
                          radius={[6, 6, 0, 0]} 
                          name="Avg Score"
                          maxBarSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Time Analysis Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2 px-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold uppercase tracking-tight">Efficiency</h2>
            </div>
            
            {analytics && (
              <div className="space-y-4">
                {[
                  { label: "Avg Time / Stage", value: formatTime(analytics.averageTimePerStage), icon: ActivityIcon, trend: "-12%" },
                  { label: "Avg Time / Day", value: formatTime(analytics.averageTimePerDay), icon: CalendarIcon, trend: "+5%" },
                  { label: "Peak Performance", value: "2 PM - 4 PM", icon: Zap, trend: "Optimal" },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (i * 0.1) }}
                  >
                    <Card className="border-border/50 shadow-xs hover:bg-muted/10 transition-colors">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{item.label}</p>
                            <p className="text-lg font-bold">{item.value}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-muted/50 text-[10px] font-bold">{item.trend}</Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Hourly Heatmap Card */}
            {analytics && analytics.hourlyHeatmap && (
              <Card className="border-border/50 shadow-sm bg-linear-to-br from-card to-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Activity Rhythm</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-end gap-1 h-20">
                      {analytics.hourlyHeatmap.map((count, hour) => {
                        const maxCount = Math.max(...analytics.hourlyHeatmap, 1);
                        const intensity = count / maxCount;
                        return (
                          <div 
                            key={hour} 
                            className={cn(
                              "flex-1 rounded-sm transition-all relative group/hour",
                              count > 0 ? "bg-primary" : "bg-muted/30"
                            )}
                            style={{ 
                              height: `${Math.max(intensity * 100, 10)}%`,
                              opacity: count > 0 ? Math.max(intensity, 0.4) : 1
                            }}
                          >
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-[9px] font-bold rounded opacity-0 group-hover/hour:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                              {hour}:00 — {count} hits
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[9px] font-bold text-muted-foreground">12 AM</span>
                      <span className="text-[9px] font-bold text-muted-foreground">12 PM</span>
                      <span className="text-[9px] font-bold text-muted-foreground">11 PM</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Growth Curves */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="border-border/50 shadow-sm h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg tracking-tight font-bold uppercase">Growth Curve</CardTitle>
                    <p className="text-xs text-muted-foreground font-medium">Cumulative mastery evolution</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cumulativeData}>
                      <CartesianGrid strokeDasharray="3 3" className="text-border/30" vertical={false} />
                      <XAxis dataKey="date" hide />
                      <YAxis hide />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Line 
                        type="stepAfter" 
                        dataKey="totalWords" 
                        stroke="#8b5cf6" 
                        strokeWidth={4} 
                        dot={false}
                        activeDot={{ r: 8, strokeWidth: 0, fill: "#8b5cf6" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="border-border/50 shadow-sm h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg tracking-tight font-bold uppercase">Daily Momentum</CardTitle>
                    <p className="text-xs text-muted-foreground font-medium">Words learned per calendar day</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" className="text-border/30" vertical={false} />
                      <XAxis dataKey="date" hide />
                      <YAxis hide />
                      <Bar dataKey="wordsLearned" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
