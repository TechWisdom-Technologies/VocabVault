"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  ArrowRight, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Trophy, 
  ArrowLeft,
  Target,
  Zap,
  Shield,
  Star,
  Sparkles,
  Brain
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface StageScore {
  stageNumber: number;
  score: number;
}

const STAGE_NAMES: Record<number, string> = {
  1: "Word Briefing",
  2: "Sentence Immersion",
  3: "Contextual Map",
  4: "Active Recall I",
  5: "Article Study",
  6: "Active Recall II",
  7: "Listening Drill",
  8: "Paragraph Construction",
  9: "Writing Workshop",
  10: "Speaking Practice",
};

export default function SummaryPage({ params }: { params: Promise<{ wordId: string }> }) {
  const router = useRouter();
  const { wordId } = use(params);
  const { getAuthHeaders, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [scores, setScores] = useState<StageScore[]>([]);
  const [lastResult, setLastResult] = useState<{ stage: number; score: number; passed: boolean } | null>(null);
  const [nextStage, setNextStage] = useState<number | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [wordData, setWordData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const lastStageNum = parseInt(urlParams.get("lastStage") || "0", 10);
        const nextStageNum = parseInt(urlParams.get("nextStage") || "0", 10);
        
        const headers = await getAuthHeaders();
        const res = await fetch(`/api/progress/word/${wordId}`, { headers });
        if (res.ok) {
          const data = await res.json();
          
          const bestScores = new Map<number, number>();
          data.progress.stageScores.forEach((s: any) => {
            const currentBest = bestScores.get(s.stageNumber) || 0;
            if (s.score > currentBest) {
              bestScores.set(s.stageNumber, s.score);
            }
          });

          const latestScore = [...data.progress.stageScores]
            .filter((s: any) => s.stageNumber === lastStageNum)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

          if (latestScore) {
            setLastResult({ 
              stage: lastStageNum, 
              score: latestScore.score, 
              passed: latestScore.score >= 8 
            });
          }

          if (nextStageNum > 0) {
            setNextStage(nextStageNum);
          }

          const scoresArray = Array.from({ length: 10 }, (_, i) => ({
            stageNumber: i + 1,
            score: bestScores.get(i + 1) || 0
          }));

          setScores(scoresArray);
          setWordData(data.progress.word);
          
          let total = 0;
          bestScores.forEach(v => total += v);
          setTotalScore(total);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (user && wordId) fetchData();
  }, [user, wordId, getAuthHeaders]);

  const handleFinish = async () => {
    if (totalScore < 80) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/progress/complete", {
        method: "POST",
        headers,
        body: JSON.stringify({ wordId })
      });
      if (res.ok) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse rounded-full" />
          <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Compiling Intelligence Report...</p>
      </div>
    );
  }

  const hasLowScores = scores.some(s => s.score < 8);
  const passed = totalScore >= 80 && !hasLowScores;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white relative overflow-hidden pb-24">
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Header Navigation */}
      <header className="fixed top-0 left-0 w-full h-20 border-b border-white/5 bg-[#0a0a0b]/80 backdrop-blur-xl flex items-center justify-between px-6 z-50">
        <motion.div whileTap={{ scale: 0.9 }}>
          <Link href="/dashboard">
            <Button variant="ghost" className="rounded-xl text-white/40 hover:text-white hover:bg-white/5 font-bold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Base
            </Button>
          </Link>
        </motion.div>
        
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic">Encryption Stable</span>
        </div>
      </header>

      <div className="relative z-10 pt-32 px-4 max-w-4xl mx-auto space-y-12">
        {/* Main Status Hero */}
        <section className="text-center space-y-6">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex relative"
          >
            <div className={cn(
              "absolute inset-0 blur-[40px] opacity-40 rounded-full",
              passed ? "bg-primary" : "bg-amber-500"
            )} />
            <div className={cn(
              "relative w-24 h-24 rounded-3xl flex items-center justify-center border-2 shadow-2xl backdrop-blur-md",
              passed ? "bg-primary/20 border-primary/50 text-primary" : "bg-amber-500/20 border-amber-500/50 text-amber-500"
            )}>
              {passed ? <Trophy className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
            </div>
            {passed && (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 border border-dashed border-primary/30 rounded-full pointer-events-none" 
              />
            )}
          </motion.div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase italic leading-none">
              {passed ? "Mission Complete" : "Intelligence Gap"}
            </h1>
            <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-[10px] sm:text-xs">
              Status: {passed ? "MASTERED & ARCHIVED" : "RE-EVALUATION REQUIRED"}
            </p>
          </div>

          {/* Word & Overall Score */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20 block mb-1">Target Identity</span>
              <span className="text-xl font-black capitalize tracking-tight text-primary">{wordData?.word}</span>
            </div>
            <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20 block mb-1">Cumulative XP</span>
              <span className="text-xl font-black tracking-tighter">
                <span className={passed ? "text-emerald-400" : "text-amber-400"}>{totalScore}</span>
                <span className="text-white/20"> / 100</span>
              </span>
            </div>
          </div>
        </section>

        {/* Latest Session Card (If available) */}
        <AnimatePresence>
          {lastResult && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={cn(
                "relative group p-1 rounded-[2.5rem] overflow-hidden",
                lastResult.passed ? "bg-linear-to-r from-emerald-500/20 to-transparent" : "bg-linear-to-r from-rose-500/20 to-transparent"
              )}
            >
              <div className="bg-[#121214]/95 backdrop-blur-3xl rounded-[2.4rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-8 border border-white/5">
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <div className={cn("w-2 h-2 rounded-full", lastResult.passed ? "bg-emerald-500" : "bg-rose-500")} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Latest Operational Data</span>
                  </div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tight">
                    Stage {lastResult.stage}: {lastResult.passed ? "Success" : "Failed"}
                  </h3>
                  <p className="text-white/40 text-xs font-medium max-w-sm">
                    {lastResult.passed 
                      ? "Operational objectives met with high precision. Intelligence successfully extracted." 
                      : "Critical errors detected during extraction. Recalibration and retry required."}
                  </p>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Efficiency</p>
                    <p className={cn("text-3xl font-black tracking-tighter", lastResult.passed ? "text-emerald-400" : "text-rose-400")}>
                      {lastResult.score * 10}%
                    </p>
                  </div>
                  <div className="w-px h-12 bg-white/5" />
                  <div className="shrink-0">
                    {lastResult.passed && nextStage ? (
                      <Button 
                        size="lg" 
                        className="h-16 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all"
                        onClick={() => router.push(`/stage/${wordId}/${nextStage}`)}
                      >
                        Advance <ArrowRight className="w-5 h-5 ml-3" />
                      </Button>
                    ) : (
                      <Button 
                        size="lg" 
                        className="h-16 px-10 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest shadow-2xl shadow-rose-500/20 active:scale-95 transition-all"
                        onClick={() => router.push(`/stage/${wordId}/${lastResult.stage}`)}
                      >
                        Retry <RotateCcw className="w-5 h-5 ml-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Intelligence Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-2">
              <Brain className="w-3.5 h-3.5" /> Intelligence Matrix
            </h2>
            <div className="h-px flex-1 mx-4 bg-white/5" />
            <span className="text-[10px] font-black text-white/40">10 OPERATIONS</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {scores.map((s, i) => (
              <motion.div 
                key={s.stageNumber}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "relative p-4 rounded-3xl border transition-all hover:border-white/20 group overflow-hidden bg-[#121214]/50 backdrop-blur-md",
                  s.score < 8 
                    ? "border-amber-500/20" 
                    : "border-emerald-500/20"
                )}
              >
                {/* Score Fill Background */}
                <div 
                  className={cn(
                    "absolute bottom-0 left-0 w-full transition-all duration-1000 opacity-[0.05]",
                    s.score < 8 ? "bg-amber-500" : "bg-emerald-500"
                  )} 
                  style={{ height: `${s.score * 10}%` }}
                />

                <div className="relative z-10 flex flex-col items-center gap-1 text-center h-full">
                  <span className="text-[7px] font-black uppercase tracking-widest text-white/30 italic">OP-{s.stageNumber.toString().padStart(2, '0')}</span>
                  <p className="text-[9px] font-bold text-white/60 mb-2 leading-tight h-6 flex items-center">{STAGE_NAMES[s.stageNumber]}</p>
                  
                  <p className={cn(
                    "text-2xl font-black tracking-tighter mb-4",
                    s.score < 8 ? "text-amber-500" : "text-emerald-400"
                  )}>
                    {s.score}/10
                  </p>
                  
                  <div className="mt-auto w-full flex flex-col gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className={cn(
                        "w-full h-8 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all",
                        s.score >= 8 
                          ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                      )}
                      onClick={() => router.push(`/stage/${wordId}/${s.stageNumber}`)}
                    >
                      <RotateCcw className="w-3 h-3 mr-1.5" /> Retry
                    </Button>
                    
                    {s.score >= 8 && (
                      <div className="flex justify-center">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500/50" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Final Execution */}
        <footer className="pt-8 flex flex-col items-center gap-6">
          {passed ? (
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full max-w-sm relative group"
            >
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <Button 
                size="lg" 
                className="w-full h-16 rounded-3xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 relative z-10"
                onClick={handleFinish}
              >
                Seal Intelligence <Shield className="w-5 h-5 ml-3" />
              </Button>
            </motion.div>
          ) : (
            <div className="w-full max-w-sm text-center space-y-4">
              <Button 
                size="lg" 
                disabled 
                className="w-full h-16 rounded-3xl bg-white/5 text-white/20 border border-white/5 font-black uppercase tracking-[0.2em] cursor-not-allowed"
              >
                Mastery Locked
              </Button>
              <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500/50 animate-pulse">
                <Target className="w-3 h-3" /> Minimum 80 XP Required
              </div>
            </div>
          )}

          <div className="flex items-center gap-6 pt-4 text-white/20">
            <div className="flex flex-col items-center">
              <Brain className="w-4 h-4 mb-1" />
              <span className="text-[7px] font-black uppercase tracking-tighter">Neural Sync</span>
            </div>
            <div className="w-px h-8 bg-white/5" />
            <div className="flex flex-col items-center">
              <Zap className="w-4 h-4 mb-1" />
              <span className="text-[7px] font-black uppercase tracking-tighter">Fast Recall</span>
            </div>
            <div className="w-px h-8 bg-white/5" />
            <div className="flex flex-col items-center">
              <Target className="w-4 h-4 mb-1" />
              <span className="text-[7px] font-black uppercase tracking-tighter">Accuracy</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
