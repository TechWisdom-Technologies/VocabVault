"use client";

import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle2, RotateCcw, Brain, Clock, FileText, Search, Activity, Sparkles, Target, Shuffle, BarChart3, Scan, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { loadStageSessionState, saveStageSessionState } from "./stage-session";
import { motion, AnimatePresence } from "framer-motion";

interface Stage8Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  word: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onComplete: (score: number, mistakes: any[], timeSpent: number) => void;
}

export default function Stage8Paragraph({ word, onComplete }: Stage8Props) {
  const { getAuthHeaders } = useAuthStore();
  const startTime = useRef<number>(0);
  useEffect(() => {
    startTime.current = Date.now();
  }, []);

  const paragraph = word.paragraph || "";
  const [timeLeft, setTimeLeft] = useState(300);
  const [hasLoadedState, setHasLoadedState] = useState(false);
  const [targetCount, setTargetCount] = useState<string>("");
  const [synonymCount, setSynonymCount] = useState<string>("");
  const [antonymCount, setAntonymCount] = useState<string>("");

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  useEffect(() => {
    let cancelled = false;
    const initialize = async () => {
      const saved = await loadStageSessionState<{
        timeLeft?: number;
        targetCount?: string;
        synonymCount?: string;
        antonymCount?: string;
      }>(getAuthHeaders, word.id);
      if (cancelled) return;
      if (saved) {
        setTimeLeft(saved.timeLeft ?? 300);
        setTargetCount(saved.targetCount || "");
        setSynonymCount(saved.synonymCount || "");
        setAntonymCount(saved.antonymCount || "");
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
      timeLeft,
      targetCount,
      synonymCount,
      antonymCount,
    });
  }, [hasLoadedState, timeLeft, targetCount, synonymCount, antonymCount, getAuthHeaders, word.id]);

  const { actualTargetCount, actualSynonymCount, actualAntonymCount } = useMemo(() => {
    if (!paragraph) return { actualTargetCount: 0, actualSynonymCount: 0, actualAntonymCount: 0 };
    const tWord = word.word.toLowerCase();
    const syns = (word.synonyms || []).map((s: any) => s.word.toLowerCase());
    const ants = (word.antonyms || []).map((a: any) => a.word.toLowerCase());
    const wordsInParagraph = paragraph.toLowerCase().split(/\b/);
    let tCount = 0, sCount = 0, aCount = 0;
    wordsInParagraph.forEach((w: string) => {
      if (w === tWord) tCount++;
      else if (syns.includes(w)) sCount++;
      else if (ants.includes(w)) aCount++;
    });
    return {
      actualTargetCount: word.paragraphTargetCount || tCount,
      actualSynonymCount: word.paragraphSynonymCount || sCount,
      actualAntonymCount: word.paragraphAntonymCount || aCount,
    };
  }, [paragraph, word]);

  const isFormComplete = targetCount !== "" && synonymCount !== "" && antonymCount !== "";

  const handleComplete = useCallback(() => {
    const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
    const submittedTarget = parseInt(targetCount, 10) || 0;
    const submittedSynonym = parseInt(synonymCount, 10) || 0;
    const submittedAntonym = parseInt(antonymCount, 10) || 0;
    const totalDiff = Math.abs(submittedTarget - actualTargetCount) + Math.abs(submittedSynonym - actualSynonymCount) + Math.abs(submittedAntonym - actualAntonymCount);
    const score = totalDiff === 0 ? 10 : totalDiff <= 2 ? 8 : totalDiff <= 4 ? 5 : 0;
    onComplete(score, [], elapsed);
  }, [targetCount, synonymCount, antonymCount, actualTargetCount, actualSynonymCount, actualAntonymCount, onComplete]);

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

  const timeFormatted = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex-1 w-full h-full flex flex-col overflow-hidden bg-background relative pt-20">
      <div className="flex-1 w-full h-full flex flex-col overflow-hidden relative">
        {/* Zone A: The Observation Deck (Top 50%) */}
        <div className="flex-[1] bg-violet-600/10 relative flex flex-col p-6 sm:p-12 min-h-0">
          <div className="absolute inset-0 bg-linear-to-b from-violet-600/5 to-transparent pointer-events-none" />

          <div className="flex justify-between items-start z-10 mb-6 shrink-0">
              <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <Scan className="w-4 h-4 text-violet-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Contextual Reference</span>
            </div>

            <div className={`px-4 py-1.5 rounded-full border border-border/50 flex items-center gap-2 ${timeLeft < 30 ? "bg-rose-500/20 border-rose-500/40" : "bg-muted/20"}`}>
              <Clock className={`w-3.5 h-3.5 ${timeLeft < 30 ? "text-rose-400 animate-pulse" : "text-violet-400"}`} />
              <span className={`text-sm font-mono font-black ${timeLeft < 30 ? "text-rose-400 animate-pulse" : "text-foreground"}`}>{timeFormatted}</span>
            </div>
          </div>

            <div className="max-w-4xl mx-auto w-full flex-1 overflow-y-auto custom-scrollbar relative z-10 pt-4">
            <p className="text-lg sm:text-2xl lg:text-3xl text-foreground font-medium leading-relaxed sm:leading-loose">
              {paragraph}
            </p>
          </div>
        </div>

        {/* Divider: The Transition Line */}
        <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent relative z-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 px-6 py-2 rounded-full bg-card border border-border/50 shadow-2xl">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Validation Phase</span>
          </div>
        </div>

        {/* Zone B: The Analysis Station (Bottom 50%) */}
          <div className="flex-[1] bg-background p-6 sm:p-12 flex flex-col min-h-0">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-12 max-w-6xl mx-auto w-full items-center">
            {[
              { label: "Primary Term", value: targetCount, setter: setTargetCount, icon: <Target className="w-6 h-6" />, color: "violet" },
              { label: "Supportive Terms", value: synonymCount, setter: setSynonymCount, icon: <Activity className="w-6 h-6" />, color: "emerald" },
              { label: "Opposition Terms", value: antonymCount, setter: setAntonymCount, icon: <Shuffle className="w-6 h-6" />, color: "amber" }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-6 group">
                <div className="flex flex-col items-center gap-2">
                  <div className={`p-3 rounded-2xl bg-muted/20 border border-border/50 text-muted-foreground group-hover:text-foreground group-hover:border-violet-500/50 transition-all shadow-xl`}>
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                </div>
                <Input
                  type="number"
                  value={item.value}
                  onChange={(e) => item.setter(e.target.value)}
                  className="text-center text-4xl sm:text-5xl font-black bg-transparent border-0 focus-visible:ring-0 placeholder:text-muted-foreground h-12 sm:h-16 p-0"
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          {/* Action Controls */}
          <div className="mt-auto flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-border/50 w-full max-w-6xl mx-auto shrink-0">
            <Button variant="ghost" onClick={handleRepeat} className="text-muted-foreground hover:text-foreground hover:bg-muted/20 text-[10px] font-black uppercase tracking-widest gap-2">
              <RotateCcw className="w-3.5 h-3.5" /> Repeat Analysis
            </Button>

            <Button
              onClick={isFormComplete ? handleComplete : undefined}
              disabled={!isFormComplete}
              className={`w-full sm:w-auto h-16 px-16 rounded-[24px] text-xl font-black transition-all shadow-2xl ${isFormComplete
                ? "bg-violet-600 text-white shadow-violet-600/30"
                : "bg-muted/20 text-muted-foreground border border-border/50 cursor-not-allowed"
                }`}
            >
              {isFormComplete ? (
                <div className="flex items-center gap-3">Submit Results <ArrowRight className="w-6 h-6" /></div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 opacity-40" />
                  <span className="text-sm uppercase tracking-widest opacity-40">Complete Counts</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
