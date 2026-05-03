"use client";

import { motion } from "framer-motion";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowRight, RotateCcw, AlertTriangle, CheckCircle2, Trophy, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface StageScore {
  stageNumber: number;
  score: number;
}

export default function SummaryPage({ params }: { params: Promise<{ wordId: string }> }) {
  const router = useRouter();
  const { wordId } = use(params);
  const { getAuthHeaders, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [scores, setScores] = useState<StageScore[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [wordData, setWordData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`/api/progress/word/${wordId}`, { headers });
        if (res.ok) {
          const data = await res.json();
          
          // Get the best score for each stage
          const bestScores = new Map<number, number>();
          data.progress.stageScores.forEach((s: any) => {
            const currentBest = bestScores.get(s.stageNumber) || 0;
            if (s.score > currentBest) {
              bestScores.set(s.stageNumber, s.score);
            }
          });

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const passed = totalScore >= 80;

  return (
    <div className="min-h-screen bg-background relative pb-20">

      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-40">
        <motion.div whileTap={{ scale: 0.9 }}>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </motion.div>
      </div>
      <div className="px-4 py-8 max-w-3xl mx-auto space-y-8 mt-12 sm:mt-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            {passed ? (
              <Trophy className="w-10 h-10 text-primary" />
            ) : (
              <AlertTriangle className="w-10 h-10 text-amber-500" />
            )}
          </div>
          <h1 className="text-3xl font-bold">
            {passed ? "Word Mastered!" : "Almost There!"}
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            You scored <strong className={passed ? "text-success" : "text-amber-500"}>{totalScore}/100</strong> on <span className="font-bold text-primary capitalize">{wordData?.word}</span>.
            {!passed && " You need 80 points to unlock the next word."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {scores.map((s) => (
            <Card key={s.stageNumber} className={`border ${s.score < 8 ? "border-amber-500/50 bg-amber-500/5" : "border-success/30 bg-success/5"}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Stage {s.stageNumber}</h3>
                  <p className={`text-sm font-bold ${s.score < 8 ? "text-amber-600" : "text-success"}`}>
                    Score: {s.score}/10
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {s.score >= 8 && (
                    <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </div>
                  )}
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`border-border/50 hover:bg-muted/50 ${s.score < 8 ? "border-amber-500/50 text-amber-600" : "text-muted-foreground"}`}
                      onClick={() => router.push(`/stage/${wordId}/${s.stageNumber}`)}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 pt-8">
          {passed ? (
            <motion.div whileTap={{ scale: 0.95 }} className="w-full max-w-sm">
              <Button size="lg" className="w-full px-12 text-lg h-14 bg-linear-to-r from-primary to-primary-600 shadow-lg shadow-primary/25" onClick={handleFinish}>
                Mastery Complete <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          ) : (
            <div className="w-full max-w-sm space-y-3">
              <Button size="lg" variant="outline" className="w-full text-lg h-14 cursor-not-allowed opacity-80" disabled>
                {totalScore < 80 ? `Need ${80 - totalScore} more points` : "All stages must be 8/10"}
              </Button>
              <p className="text-[10px] text-center font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
                {totalScore < 80 ? "Improve stage scores to reach 80" : "Retry stages with scores below 8"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
