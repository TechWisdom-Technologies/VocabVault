"use client";

import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Brain, Type, Shuffle, Sparkles, Target, Zap } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { loadStageSessionState, saveStageSessionState } from "./stage-session";
import { motion, AnimatePresence } from "framer-motion";

interface Stage6Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  word: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onComplete: (score: number, mistakes: any[], timeSpent: number) => void;
}

export default function Stage6Recall2({ word, onComplete }: Stage6Props) {
  const { getAuthHeaders } = useAuthStore();
  const startTime = useRef<number>(0);
  useEffect(() => {
    startTime.current = Date.now();
  }, []);

  const [phase, setPhase] = useState<"spelling" | "matching" | "done">("spelling");
  const [spellingAttempt, setSpellingAttempt] = useState(0);
  const [spellingInput, setSpellingInput] = useState("");
  const [spellingResults, setSpellingResults] = useState<boolean[]>([]);
  const [spellingFeedback, setSpellingFeedback] = useState<string | null>(null);
  const [hasLoadedState, setHasLoadedState] = useState(false);
  const [matchedPairs, setMatchedPairs] = useState<Map<string, string>>(new Map());
  const [selectedDefinition, setSelectedDefinition] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const initialize = async () => {
      const saved = await loadStageSessionState<{
        phase?: "spelling" | "matching" | "done";
        spellingAttempt?: number;
        spellingInput?: string;
        spellingResults?: boolean[];
        spellingFeedback?: string | null;
        matchedPairs?: Array<[string, string]>;
        selectedDefinition?: string | null;
      }>(getAuthHeaders, word.id);

      if (cancelled) return;
      if (saved) {
        setPhase(saved.phase || "spelling");
        setSpellingAttempt(saved.spellingAttempt || 0);
        setSpellingInput(saved.spellingInput || "");
        setSpellingResults(saved.spellingResults || []);
        setSpellingFeedback(saved.spellingFeedback || null);
        setMatchedPairs(new Map(saved.matchedPairs || []));
        setSelectedDefinition(saved.selectedDefinition || null);
      }
      setHasLoadedState(true);
    };

    void initialize();
    return () => { cancelled = true; };
  }, [getAuthHeaders, word.id]);

  useEffect(() => {
    if (!hasLoadedState) return;
    void saveStageSessionState(getAuthHeaders, word.id, {
      phase,
      spellingAttempt,
      spellingInput,
      spellingResults,
      spellingFeedback,
      matchedPairs: Array.from(matchedPairs.entries()),
      selectedDefinition,
    });
  }, [hasLoadedState, phase, spellingAttempt, spellingInput, spellingResults, spellingFeedback, matchedPairs, selectedDefinition, getAuthHeaders, word.id]);

  const matchingData = useMemo(() => {
    // Priority: Custom Pairs from Admin
    if (word.recall2Pairs && word.recall2Pairs.length > 0) {
      const items = word.recall2Pairs.map((p: any) => ({
        word: p.word,
        definition: p.definition,
      }));
      const shuffledDefs = [...items].map((i) => i.definition).sort(() => Math.random() - 0.5);
      return { items, shuffledDefs };
    }

    // Fallback: Algorithmic selection
    const synonyms = (word.synonyms || []).slice(0, 3);
    const antonyms = (word.antonyms || []).slice(0, 2);
    const items = [...synonyms, ...antonyms].map((item: any) => ({
      word: item.word || item,
      definition: item.sentence || item.definition || `Context for "${word.word}"`,
    }));
    const shuffledDefs = [...items].map((i) => i.definition).sort((a, b) => a.localeCompare(b));
    return { items, shuffledDefs };
  }, [word]);

  const handleSpellingSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const isCorrect = spellingInput.trim().toLowerCase() === word.word.toLowerCase();
    
    if (isCorrect) {
      const newResults = [...spellingResults, true];
      setSpellingResults(newResults);
      setSpellingFeedback("Precision Matched");
      
      setTimeout(() => {
        setSpellingInput("");
        setSpellingFeedback(null);
        if (newResults.length >= 3) {
          setPhase("matching");
        } else {
          setSpellingAttempt((prev) => prev + 1);
        }
      }, 800);
    } else {
      setSpellingFeedback("Mistake Detected — Streak Reset");
      setSpellingResults([]);
      setSpellingAttempt(0);
      
      setTimeout(() => {
        setSpellingInput("");
        setSpellingFeedback(null);
      }, 1200);
    }
  };

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

  const handleSelectWord = (itemWord: string) => {
    if (!selectedDefinition || matchedPairs.has(itemWord)) return;
    const newPairs = new Map(matchedPairs);
    newPairs.set(itemWord, selectedDefinition);
    setMatchedPairs(newPairs);
    setSelectedDefinition(null);
  };

  const handleSelectDefinition = (def: string) => {
    if (Array.from(matchedPairs.values()).includes(def)) return;
    setSelectedDefinition(def === selectedDefinition ? null : def);
  };

  const allMatched = matchedPairs.size === matchingData.items.length && matchingData.items.length > 0;

  const handleComplete = useCallback(() => {
    const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
    const correctSpellings = spellingResults.filter((r) => r).length;
    const spellingScore = Math.round((correctSpellings / 3) * 5);
    let matchCorrect = 0;
    matchedPairs.forEach((def, w) => {
      const item = matchingData.items.find((i: { word: string; definition: string }) => i.word === w);
      if (item && item.definition === def) matchCorrect++;
    });
    const matchScore = Math.round((matchCorrect / (matchingData.items.length || 1)) * 5);
    const totalScore = spellingScore + matchScore;
    onComplete(totalScore, [], elapsed);
  }, [matchingData, matchedPairs, onComplete, spellingResults]);

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center relative bg-background pt-20">
      <div className="absolute inset-0 pointer-events-none overflow-hidden bg-background">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px]" />
      </div>

      {/* Main Experience Surface */}
      <div className="flex-1 w-full relative flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden">
        {/* Phase Indicator HUD */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20">
            <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">Recall Phasing</span>
            <div className="flex gap-1.5">
              <div className={`h-1 w-12 rounded-full transition-all duration-500 ${phase === "spelling" ? "bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" : "bg-emerald-500"}`} />
              <div className={`h-1 w-12 rounded-full transition-all duration-500 ${phase === "matching" ? "bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" : allMatched ? "bg-emerald-500" : "bg-muted/20"}`} />
            </div>
          </div>
        </div>
        <AnimatePresence mode="wait">
          {phase === "spelling" ? (
            <motion.div
              key="spelling-surface"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-4xl flex flex-col items-center gap-12"
            >
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-3 opacity-30">
                  <div className="h-px w-6 bg-border/50" />
                  <Sparkles className="w-3 h-3" />
                  <div className="h-px w-6 bg-border/50" />
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
                    Spelling Recall
                </h2>
                <p className="text-[10px] sm:text-sm text-muted-foreground font-bold uppercase tracking-[0.2em]">Verify accuracy from memory</p>
              </div>

              <div className="flex gap-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl border-2 flex items-center justify-center text-xl font-black transition-all ${i < spellingResults.length ? (spellingResults[i] ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : "bg-rose-500/10 border-rose-500 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]") : i === spellingAttempt ? "border-violet-500 text-violet-500" : "border-border/50 text-muted-foreground"}`}>
                    {i < spellingResults.length ? (spellingResults[i] ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />) : i + 1}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSpellingSubmit} className="w-full max-w-xl relative group">
                  <Input
                  autoFocus
                  value={spellingInput}
                  onChange={(e) => setSpellingInput(e.target.value)}
                  className="text-center text-3xl sm:text-7xl h-20 sm:h-32 font-black border-0 bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground"
                  placeholder="..."
                  disabled={!!spellingFeedback}
                />
                <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 w-[60%] sm:w-[40%] h-[2px] bg-linear-to-r from-transparent via-violet-500 to-transparent opacity-50 group-focus-within:w-[80%] group-focus-within:opacity-100 transition-all duration-700" />
                
                <AnimatePresence>
                  {spellingFeedback && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`absolute -bottom-8 left-0 w-full text-center text-xs font-black uppercase tracking-[0.5em] ${spellingFeedback === "Precision Matched" ? "text-emerald-400" : "text-rose-400"}`}>
                      {spellingFeedback}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="matching-surface"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full max-w-4xl h-full flex flex-col gap-6 min-h-0"
            >
              <div className="text-center sm:text-left space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-foreground leading-tight tracking-tight">Context Linkage</h3>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Connect terms to their correct descriptions</p>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-3 sm:gap-4 min-h-0 overflow-hidden">
                <div className="flex flex-col min-h-0">
                  <div className="flex-1 space-y-1.5 pr-1">
                    {matchingData.shuffledDefs.map((def: string, idx: number) => {
                      const isUsed = Array.from(matchedPairs.values()).includes(def);
                      const isSelected = selectedDefinition === def;
                      return (
                        <button key={idx} onClick={() => handleSelectDefinition(def)} disabled={isUsed} className={`w-full p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border-2 text-left text-[9px] sm:text-xs transition-all relative group ${isUsed ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500/40" : isSelected ? "bg-violet-600 border-violet-400 text-foreground shadow-lg shadow-violet-600/20" : "bg-muted/20 border-border/50 hover:border-violet-500/40 hover:bg-muted/30"}`}>
                          {isUsed && <CheckCircle2 className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 h-2 sm:w-3 sm:h-3" />}
                          <span className="line-clamp-3">{def}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col min-h-0">
                  <div className="flex-1 space-y-1.5 pr-1">
                    {matchingData.items.map((item: { word: string; definition: string }, idx: number) => {
                      const isMatched = matchedPairs.has(item.word);
                      return (
                        <button key={idx} onClick={() => handleSelectWord(item.word)} disabled={isMatched || !selectedDefinition} className={`w-full h-10 sm:h-12 rounded-lg sm:rounded-xl border-2 flex items-center justify-center font-black text-[10px] sm:text-sm transition-all ${isMatched ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : selectedDefinition ? "bg-violet-500/5 border-violet-500/40 hover:bg-violet-500/10 hover:border-violet-500 cursor-pointer shadow-lg shadow-violet-600/5" : "bg-muted/10 border-border/50 opacity-90"}`}>
                          <span className="truncate px-1">{item.word}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex justify-center py-2">
                <Button
                  onClick={allMatched ? handleComplete : undefined}
                  disabled={!allMatched}
                  size="lg"
                  className={`w-full max-w-sm h-12 rounded-xl text-sm font-black transition-all shadow-xl ${
                    allMatched
                      ? "bg-linear-to-r from-violet-600 to-indigo-600 text-white shadow-violet-600/20"
                      : "bg-muted/20 text-muted-foreground border border-border/50 cursor-not-allowed"
                  }`}
                >
                  {allMatched ? <div className="flex items-center gap-2">Complete Recall II <ArrowRight className="w-4 h-4" /></div> : <span className="text-[9px] font-black uppercase tracking-widest opacity-20">Awaiting Linkage</span>}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
