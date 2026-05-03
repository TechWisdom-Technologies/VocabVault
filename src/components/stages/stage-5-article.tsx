"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, RotateCcw, Brain, CheckCircle2, BookOpen, Clock, FileText, Sparkles, Hash } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { loadStageSessionState, saveStageSessionState } from "./stage-session";
import { motion, AnimatePresence } from "framer-motion";

interface Stage5Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  word: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onComplete: (score: number, mistakes: any[], timeSpent: number) => void;
}

export default function Stage5Article({ word, onComplete }: Stage5Props) {
  const { getAuthHeaders } = useAuthStore();
  const articles = word.articles || [];
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [hasLoadedState, setHasLoadedState] = useState(false);
  const startTime = useRef<number>(0);

  const currentArticle = articles[currentArticleIndex];

  useEffect(() => {
    startTime.current = Date.now();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const initialize = async () => {
      const saved = await loadStageSessionState<{ currentArticleIndex?: number; timeLeft?: number }>(getAuthHeaders, word.id);
      if (cancelled) return;
      if (saved) {
        setCurrentArticleIndex(saved.currentArticleIndex || 0);
        setTimeLeft(saved.timeLeft ?? 300);
        startTime.current = Date.now() - (300 - (saved.timeLeft ?? 300)) * 1000;
      }
      setHasLoadedState(true);
    };

    void initialize();
    return () => { cancelled = true; };
  }, [getAuthHeaders, word.id]);

  useEffect(() => {
    if (!hasLoadedState) return;
    void saveStageSessionState(getAuthHeaders, word.id, {
      currentArticleIndex,
      timeLeft,
    });
  }, [hasLoadedState, currentArticleIndex, timeLeft, getAuthHeaders, word.id]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleRepeat = async () => {
    try {
      setHasLoadedState(false);
      const headers = await getAuthHeaders();
      await fetch("/api/progress/state", {
        method: "POST",
        headers,
        body: JSON.stringify({ wordId: word.id, sessionState: null }),
      });
      window.location.href = window.location.pathname;
    } catch (e) {
      console.error(e);
      window.location.reload();
    }
  };

  const handleComplete = () => {
    if (timeLeft === 0 && currentArticleIndex === articles.length - 1) {
      const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
      onComplete(10, [], elapsed);
    }
  };

  const renderContent = (content: string) => {
    const targetWord = word.word.toLowerCase();
    const regex = new RegExp(`\\b(${targetWord})\\b`, 'gi');
    const parts = content.split(regex);

    return parts.map((part, idx) => {
      if (part.toLowerCase() === targetWord) {
        return <span key={idx} className="font-black text-primary bg-primary/10 px-1 rounded ring-1 ring-primary/20">{part}</span>;
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const isFinished = currentArticleIndex === articles.length - 1;
  const progress = ((300 - timeLeft) / 300) * 100;
  const timeFormatted = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex-1 w-full h-full flex flex-col sm:flex-row overflow-hidden bg-background relative pt-20">
      {/* Sidebar: Article Navigation (Left) */}
      <div className="hidden sm:flex flex-col w-72 border-r border-border/50 bg-muted/10 p-6 shrink-0">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <BookOpen className="w-5 h-5 text-violet-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Article Set</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted/20 border border-border/50">
            <span className="text-[9px] font-black text-violet-400">{currentArticleIndex + 1}/{articles.length}</span>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full bg-violet-600 shadow-[0_0_8px_rgba(139,92,246,0.4)]" animate={{ width: `${((currentArticleIndex + 1) / articles.length) * 100}%` }} />
          </div>
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2">
          {articles.map((article: any, idx: number) => (
                <button
              key={idx}
              onClick={() => setCurrentArticleIndex(idx)}
              className={`w-full text-left p-4 rounded-2xl transition-all border ${
                idx === currentArticleIndex
                  ? "bg-violet-600 border-violet-400 shadow-lg shadow-violet-600/20"
                  : "bg-muted/20 border-border/50 hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <Hash className={`w-3 h-3 ${idx === currentArticleIndex ? "text-muted-foreground" : "text-muted-foreground"}`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${idx === currentArticleIndex ? "text-foreground" : "text-muted-foreground"}`}>Reading {idx + 1}</span>
              </div>
              <p className={`text-xs font-bold truncate ${idx === currentArticleIndex ? "text-foreground" : "text-muted-foreground"}`}>
                {article.title || "Untitled Context"}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-border/50">
          <Button variant="ghost" onClick={handleRepeat} className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/20 text-[10px] font-black uppercase tracking-widest gap-3 px-4">
            <RotateCcw className="w-4 h-4" /> Reset Stage
          </Button>
        </div>
      </div>

      {/* Main Reading Area (Center) */}
      <div className="flex-1 flex flex-col relative min-w-0">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-violet-600/5 blur-[100px]" />
        </div>

        {/* Mobile Header */}
          <div className="sm:hidden flex items-center justify-between p-4 border-b border-border/50 bg-muted/10 backdrop-blur-md shrink-0">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reading {currentArticleIndex + 1}/{articles.length}</span>
          <span className="text-sm font-mono font-bold text-violet-400">{timeFormatted}</span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-12 lg:p-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentArticleIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl mx-auto"
            >
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-violet-500/40" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-violet-500/60">Authentic Context</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground leading-tight tracking-tight mb-6 sm:mb-8">
                {currentArticle?.title || "Reading Article"}
              </h1>
              <div className="prose prose-lg sm:prose-xl max-w-none">
                <p className="text-base sm:text-xl text-muted-foreground leading-relaxed sm:leading-loose font-medium italic sm:not-italic">
                  {currentArticle ? renderContent(currentArticle.content) : "No content available."}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Floating Action Bar */}
        <div className="p-6 sm:p-10 shrink-0 flex justify-center">
          <div className="w-full max-w-3xl bg-muted/20 backdrop-blur-3xl border border-border/50 rounded-[32px] p-4 flex items-center gap-4 shadow-2xl">
              <div className="flex-1 flex flex-col gap-2 pl-4">
              <div className="flex justify-between items-center pr-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Session Progress</span>
                <span className="text-[10px] font-mono font-bold text-violet-400">{timeFormatted}</span>
              </div>
              <div className="w-full h-1.5 bg-muted/20 rounded-full overflow-hidden">
                <motion.div className="h-full bg-violet-600" animate={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isFinished ? (
                  <Button 
                  onClick={() => setCurrentArticleIndex(prev => prev + 1)}
                  size="lg"
                  className="rounded-2xl h-14 px-8 bg-muted/30 hover:bg-muted/40 text-foreground font-bold transition-all"
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                ) : (
                <Button
                  onClick={timeLeft === 0 ? handleComplete : undefined}
                  size="lg"
                  disabled={timeLeft > 0}
                  className={`rounded-2xl h-14 px-10 text-lg font-black transition-all shadow-xl ${
                    timeLeft === 0
                      ? "bg-violet-600 text-white shadow-violet-600/30"
                      : "bg-muted/20 text-muted-foreground border border-border/50 cursor-not-allowed"
                  }`}
                >
                  {timeLeft === 0 ? (
                    <div className="flex items-center gap-2">Finish <CheckCircle2 className="w-5 h-5 text-foreground" /></div>
                  ) : (
                    "Reading..."
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
