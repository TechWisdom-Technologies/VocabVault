"use client";

import { useEffect, useState } from "react";

import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertTriangle, Clock, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface StageScore {
  id: string;
  stageNumber: number;
  score: number;
  timeSpentSeconds: number;
  isRetry: boolean;
  createdAt: string;
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
  stageScores: StageScore[];
}

export default function HistoryPage() {
  const { user, getAuthHeaders } = useAuthStore();
  const [progressList, setProgressList] = useState<ProgressItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedWordId, setExpandedWordId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/user/progress", { headers });
        if (res.ok) {
          const data = await res.json();
          // Filter to only show words that have some stage scores or are completed
          setProgressList(data.progress.filter((p: ProgressItem) => p.stageScores && p.stageScores.length > 0));
        }
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchHistory();
  }, [user, getAuthHeaders]);

  const toggleExpand = (id: string) => {
    setExpandedWordId(prev => prev === id ? null : id);
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-40 hidden sm:block">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-12 max-w-4xl mx-auto space-y-8 mt-12 sm:mt-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Word History</h1>
          <p className="text-muted-foreground mt-1">
            Detailed breakdown of every word you've learned.
          </p>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
              <p>Loading history...</p>
            </div>
          ) : progressList.length === 0 ? (
            <Card className="border-border/50 bg-muted/20">
              <CardContent className="p-12 text-center text-muted-foreground">
                <p>No word history found. Complete some stages to see them here!</p>
              </CardContent>
            </Card>
          ) : (
            progressList.map((item) => (
              <Card 
                key={item.id} 
                className={`border-border/50 overflow-hidden transition-all ${
                  expandedWordId === item.id ? "ring-2 ring-primary/20" : "hover:border-primary/30"
                }`}
              >
                {/* Header (Clickable) */}
                <div 
                  className="p-4 sm:p-6 cursor-pointer flex items-center justify-between bg-card hover:bg-muted/10 transition-colors"
                  onClick={() => toggleExpand(item.id)}
                >
                  <div className="flex items-center gap-4">
                    {item.status === "COMPLETED" ? (
                      <CheckCircle2 className="w-8 h-8 text-success" />
                    ) : item.status === "RETRY" ? (
                      <AlertTriangle className="w-8 h-8 text-amber-500" />
                    ) : (
                      <Clock className="w-8 h-8 text-primary" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-xl capitalize">{item.word.word}</h3>
                        <span className="text-xs text-muted-foreground uppercase">{item.word.partOfSpeech}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Started {new Date(item.startedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium">Total Score</p>
                      <p className={`text-xl font-black ${item.status === "COMPLETED" ? "text-success" : "text-primary"}`}>
                        {item.totalScore}/100
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground pointer-events-none">
                      {expandedWordId === item.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>

                {/* Expanded Stage Breakdown */}
                {expandedWordId === item.id && (
                  <div className="bg-muted/10 border-t border-border/50 p-4 sm:p-6">
                    <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">Stage Breakdown</h4>
                    
                    <div className="space-y-3">
                      {/* Group stage scores by stage number to show retries correctly */}
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((stageNum) => {
                        const scores = item.stageScores.filter(s => s.stageNumber === stageNum).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                        
                        if (scores.length === 0) {
                          // Uncompleted stage
                          return (
                            <div key={stageNum} className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-background/50 opacity-50">
                              <span className="text-sm font-medium">Stage {stageNum}</span>
                              <span className="text-xs uppercase text-muted-foreground">Not started</span>
                            </div>
                          );
                        }

                        // Display the most recent score as primary, and older scores as history if any
                        const latestScore = scores[scores.length - 1];
                        const isPassed = latestScore.score >= 8;

                        return (
                          <div key={stageNum} className="flex flex-col p-3 rounded-lg border border-border/50 bg-background">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Stage {stageNum}</span>
                                {latestScore.isRetry && (
                                  <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20 px-1.5 py-0">Retried</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatTime(latestScore.timeSpentSeconds)}</span>
                                <span className={`font-bold w-12 text-right ${isPassed ? "text-success" : "text-destructive"}`}>{latestScore.score}/10</span>
                              </div>
                            </div>
                            
                            {/* Show previous failed attempts if any */}
                            {scores.length > 1 && (
                              <div className="mt-2 pt-2 border-t border-border/30 pl-4 space-y-1">
                                {scores.slice(0, -1).map((oldScore, idx) => (
                                  <div key={oldScore.id} className="flex justify-between items-center text-xs text-muted-foreground/70">
                                    <span>Attempt {idx + 1}</span>
                                    <div className="flex items-center gap-3">
                                      <span>{formatTime(oldScore.timeSpentSeconds)}</span>
                                      <span className="w-10 text-right">{oldScore.score}/10</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
