"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Clock, Zap, Target, BarChart3, TrendingUp } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  stage: number;
  avgScore: number;
  avgTime: number;
}

export default function PerformanceAnalytics() {
  const { getAuthHeaders } = useAuthStore();
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"score" | "time">("score");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/user/analytics", { headers });
        if (res.ok) {
          const json = await res.json();
          setData(json.analytics);
        }
      } catch (e) {
        console.error("Failed to fetch analytics", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [getAuthHeaders]);

  if (loading) {
    return (
      <div className="w-full h-[300px] rounded-3xl border border-border/50 bg-background/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Calculating Performance...</p>
        </div>
      </div>
    );
  }

  const maxScore = 10;
  const maxTime = Math.max(...data.map(d => d.avgTime), 60);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-muted-foreground">
            <BarChart3 className="w-4 h-4 text-primary" />
            Cognitive Diagnostics
          </h2>
          <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">Stage-by-stage mastery evolution</p>
        </div>

        <div className="flex bg-muted/20 p-1 rounded-xl border border-border/50">
          <button 
            onClick={() => setView("score")}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
              view === "score" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Efficiency
          </button>
          <button 
            onClick={() => setView("time")}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
              view === "time" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Velocity
          </button>
        </div>
      </div>

      <div className="relative p-8 rounded-[2.5rem] border border-border/50 bg-background/50 backdrop-blur-md overflow-hidden group">
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
        </div>

        <div className="relative flex items-end justify-between h-[200px] gap-2 sm:gap-4">
          {data.map((item, i) => {
            const heightPercent = view === "score" 
              ? (item.avgScore / maxScore) * 100 
              : (item.avgTime / maxTime) * 100;
            
            return (
              <div key={item.stage} className="flex-1 flex flex-col items-center gap-3 group/bar h-full justify-end">
                <div className="relative w-full flex flex-col items-center justify-end h-full">
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all bg-foreground text-background px-2 py-1 rounded-md text-[9px] font-black whitespace-nowrap z-20 pointer-events-none">
                    {view === "score" ? `${item.avgScore}/10` : `${item.avgTime}s`}
                  </div>

                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ duration: 1, delay: i * 0.05, ease: "circOut" }}
                    className={cn(
                      "w-full max-w-[40px] rounded-t-lg relative transition-all group-hover/bar:brightness-110",
                      view === "score" 
                        ? "bg-linear-to-t from-primary/20 to-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]" 
                        : "bg-linear-to-t from-primary/10 to-primary/60 shadow-[0_0_15px_rgba(var(--primary),0.1)]"
                    )}
                  />
                </div>
                <span className="text-[9px] font-black text-muted-foreground group-hover/bar:text-foreground transition-colors">
                  S{item.stage}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-10 pt-6 border-t border-border/50 flex flex-wrap gap-6 justify-center">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    {view === "score" ? "Avg Score Per Phase" : "Avg Engagement Time"}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    Live Diagnostics Active
                </span>
            </div>
        </div>
      </div>
    </div>
  );
}
