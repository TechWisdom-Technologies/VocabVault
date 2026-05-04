"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Lock,
  CheckCircle2,
  Play,
  Sparkles,
  BookOpen,
  ChevronRight,
  Clock,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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
  const { getAuthHeaders, user } = useAuthStore();
  const [days, setDays] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaywalled, setIsPaywalled] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/words/future", { headers });
        if (res.ok) {
          const data = await res.json();
          setDays(data.days || []);
          setIsPaywalled(data.isPaywalled || false);
        }
      } catch (error) {
        console.error("Failed to fetch words:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWords();
  }, [getAuthHeaders]);

  const handleUpgrade = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers,
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Upgrade failed:", error);
    }
  };

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
            Your Vocabulary <span className="text-primary">Journey</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-bold tracking-[0.2em] text-xs uppercase opacity-70">
            {isPaywalled ? "Upgrade to unlock full curriculum" : "Explore the complete vocabulary mastery path"}
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
        ) : isPaywalled ? (
          <motion.div variants={itemVariants}>
            <Card className="border-primary/20 bg-background/50 backdrop-blur-md shadow-2xl overflow-hidden rounded-[2.5rem] border-t-white/20">
              <CardContent className="p-12 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-linear-to-br from-primary to-primary-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-primary/20">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tighter">Mastery Threshold Reached!</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-10 font-bold tracking-tight text-lg leading-relaxed">
                  You&apos;ve completed your first 25 words! To continue mastering the remaining 5,000+ words and unlock all 10 cognitive stages, upgrade to VocabVault PRO.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mb-10">
                  {[
                    "Unlimited Vocabulary Access",
                    "Advanced Mastery Analytics",
                    "Personalized Learning Paths",
                    "Lifetime Pro Features"
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold uppercase tracking-wider text-left">{feat}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleUpgrade}
                  className="bg-primary hover:bg-primary/90 text-white px-12 h-16 text-sm font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98] border-t border-white/20"
                >
                  Upgrade to PRO <ArrowRight className="w-5 h-5 ml-3" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
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
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Word Group {((day.dayIndex - 1) * 5) + 1} - {day.dayIndex * 5}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="w-fit h-7 px-4 rounded-full border-primary/20 bg-primary/5 font-bold text-[10px] uppercase tracking-wider text-primary">
                    {day.words.length} Words
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {day.words.map((word: any) => {
                    const isCompleted = word.status === "COMPLETED";
                    const isFirstGroup = day.dayIndex === 1;

                    // Force LOCKED status if orderIndex is beyond maxUnlockedIndex
                    const effectiveMaxIndex = Math.max(1, user?.maxUnlockedIndex ?? 0);
                    const isSequentiallyLocked = word.orderIndex > effectiveMaxIndex && !isCompleted;
                    const isLocked = word.status === "LOCKED" || isSequentiallyLocked;

                    if (isLocked) {
                      return (
                        <div 
                          key={word.id} 
                          onClick={() => setIsLockModalOpen(true)}
                          className="p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-md flex flex-col justify-between h-40 relative overflow-hidden group transition-all cursor-pointer hover:border-primary/30"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Lock className="w-3.5 h-3.5 text-primary/40 group-hover:text-primary transition-colors" />
                              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                {isFirstGroup ? "Locked" : "Restricted"}
                              </span>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-muted-foreground/20 group-hover:bg-primary/20 transition-colors" />
                          </div>
                          <div className={cn(
                            "text-xl font-bold capitalize tracking-tight select-none transition-all duration-300",
                            isFirstGroup 
                              ? "text-muted-foreground/40 group-hover:text-muted-foreground" 
                              : "text-muted-foreground/20 blur-[2px] opacity-40 group-hover:blur-0 transition-all duration-500"
                          )}>
                            {word.word}
                          </div>
                          <div className="mt-auto flex items-center gap-2 opacity-30 group-hover:opacity-60 transition-opacity text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest italic">
                              {isFirstGroup ? "Protocol Lock" : "Curriculum Sequence"}
                            </span>
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
                            "p-6 rounded-2xl border flex flex-col justify-between h-40 relative overflow-hidden group transition-all shadow-sm",
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
                              {isCompleted ? "Accuracy High" : `Stage ${word.currentStage || 1} / 10`}
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

      {/* Lock Modal */}
      <Dialog open={isLockModalOpen} onOpenChange={setIsLockModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] border-primary/20 bg-background/95 backdrop-blur-xl">
          <DialogHeader className="flex flex-col items-center pt-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-center">Entry Locked</DialogTitle>
            <DialogDescription className="text-center font-bold text-muted-foreground uppercase tracking-wider text-[10px] mt-2">
              Sequential Learning Protocol Active
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center">
            <p className="text-sm text-foreground/70 leading-relaxed font-medium">
              You must complete the previous unlocked word in your curriculum before accessing this one. We follow a strict sequential path to ensure your mastery builds correctly.
            </p>
          </div>
          <DialogFooter className="sm:justify-center pb-6">
            <Button
              onClick={() => setIsLockModalOpen(false)}
              className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl shadow-xl shadow-primary/20"
            >
              Acknowledged
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
