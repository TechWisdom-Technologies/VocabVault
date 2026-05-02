"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  Lock, 
  CheckCircle2, 
  Play, 
  Sparkles, 
  BookOpen,
  ChevronRight,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Word {
  id: string;
  word: string;
  status: "IN_PROGRESS" | "RETRY" | "COMPLETED" | "FAILED" | "LOCKED";
  currentStage: number;
}

interface DayData {
  dayIndex: number;
  label: string;
  date: string;
  words: Word[];
}

export default function WordsPage() {
  const { getAuthHeaders } = useAuthStore();
  const [days, setDays] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFutureWords = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/words/future", { headers });
        if (res.ok) {
          const data = await res.json();
          setDays(data.days || []);
        }
      } catch (error) {
        console.error("Failed to fetch words:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFutureWords();
  }, [getAuthHeaders]);

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Aesthetic */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/5 blur-[100px] rounded-full pointer-events-none" />

      <motion.div 
        className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Your Learning <span className="text-primary">Curriculum</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-bold tracking-[0.2em] text-xs uppercase opacity-70">
            Preview the next 7 days of vocabulary mastery
          </p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-12">
            {[1, 2, 3].map((n) => (
              <div key={n} className="space-y-4">
                <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map((m) => (
                    <div key={m} className="h-32 bg-muted animate-pulse rounded-2xl border border-border/50" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-16">
            {days.map((day) => (
              <motion.section key={day.dayIndex} variants={itemVariants} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tight">{day.label}</h2>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{day.date}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="w-fit h-7 px-4 rounded-full border-primary/20 bg-primary/5 font-bold text-[10px] uppercase tracking-wider text-primary">
                    {day.words.length} Words Assigned
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {day.words.map((word) => {
                    const isLocked = word.status === "LOCKED";
                    const isCompleted = word.status === "COMPLETED";
                    
                    if (isLocked) {
                      return (
                        <div key={word.id} className="p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-md flex flex-col justify-between h-36 relative overflow-hidden group">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Locked Entry</span>
                            <Lock className="w-4 h-4 text-primary/30" />
                          </div>
                          <div className="text-xl font-bold text-muted-foreground/30 blur-[3px] select-none capitalize tracking-tight">
                            {word.word}
                          </div>
                          <div className="mt-auto flex items-center gap-2 opacity-30">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Awaiting Sequence</span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <Link 
                        href={isCompleted ? `/stage/${word.id}/summary` : `/stage/${word.id}/${word.currentStage || 1}`} 
                        key={word.id}
                      >
                        <motion.div 
                          className={cn(
                            "p-6 rounded-2xl border flex flex-col justify-between h-36 relative overflow-hidden group transition-all",
                            isCompleted 
                              ? "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10" 
                              : "border-primary/20 bg-background/50 backdrop-blur-md hover:shadow-xl hover:shadow-primary/5"
                          )}
                          whileHover={{ y: -5, scale: 1.02 }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-widest",
                              isCompleted ? "text-emerald-600" : "text-primary"
                            )}>
                              {isCompleted ? "Mastered" : "Active"}
                            </span>
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                <Play className="w-3 h-3 fill-current" />
                              </div>
                            )}
                          </div>
                          <div className={cn(
                            "text-2xl font-black capitalize tracking-tight",
                            isCompleted ? "text-emerald-700" : "text-foreground"
                          )}>
                            {word.word}
                          </div>
                          <div className="mt-auto flex items-center justify-between">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                              {isCompleted ? "Summary Available" : `Stage ${word.currentStage || 1} / 10`}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </motion.section>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
