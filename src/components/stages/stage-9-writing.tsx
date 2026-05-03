"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowRight, CheckCircle2, XCircle, Bot, AlertTriangle, RotateCcw, FileText, Sparkles, Clock } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { loadStageSessionState, saveStageSessionState } from "./stage-session";
import { motion, AnimatePresence } from "framer-motion";

interface Stage9Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  word: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onComplete: (score: number, mistakes: any[], timeSpent: number) => void;
}

export default function Stage9Writing({ word, onComplete }: Stage9Props) {
  const { getAuthHeaders } = useAuthStore();
  const startTime = useRef<number>(0);
  const [text, setText] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [hasLoadedState, setHasLoadedState] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  useEffect(() => {
    startTime.current = Date.now();

    // Load session state
    const loadState = async () => {
      const saved = await loadStageSessionState<{
        text?: string;
        timeLeft?: number;
      }>(getAuthHeaders, word.id);
      if (saved) {
        if (saved.text) setText(saved.text);
        if (saved.timeLeft !== undefined) {
          setTimeLeft(saved.timeLeft);
          startTime.current = Date.now() - (600 - saved.timeLeft) * 1000;
        }
      }
      setHasLoadedState(true);
    };
    loadState();
  }, [word.id, getAuthHeaders]);

  useEffect(() => {
    if (!hasLoadedState) return;
    void saveStageSessionState(getAuthHeaders, word.id, {
      text,
      timeLeft,
    });
  }, [hasLoadedState, text, timeLeft, getAuthHeaders, word.id]);
  const [result, setResult] = useState<{
    passed: boolean;
    score: number;
    feedback: string;
    wordCount: number;
    blocked?: boolean;
  } | null>(null);

  // Count target word occurrences locally for UI feedback
  const targetRegex = new RegExp(`\\b${word.word}\\b`, "gi");
  const localWordCount = (text.match(targetRegex) || []).length;
  const totalWords = text.split(/\s+/).filter((w: string) => w.length > 0).length;
  const canSubmit = localWordCount >= 3 && totalWords >= 50;

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

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsEvaluating(true);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/stage/evaluate/writing", {
        method: "POST",
        headers,
        body: JSON.stringify({ text, targetWord: word.word }),
      });

      if (!res.ok) throw new Error("Evaluation failed");

      const data = await res.json();

      if (data.blocked) {
        // Should not happen since we check client-side, but handle it
        setResult({
          passed: false,
          score: 0,
          feedback: data.feedback,
          wordCount: data.wordCount,
          blocked: true,
        });
      } else {
        setResult({
          passed: data.passed,
          score: data.score,
          feedback: data.feedback,
          wordCount: data.wordCount,
        });
      }
    } catch (error) {
      console.error("Writing evaluation error:", error);
      setResult({
        passed: false,
        score: 0,
        feedback: "Evaluation failed due to a network error. Please try again.",
        wordCount: localWordCount,
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleComplete = () => {
    if (!result) return;
    const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
    const mistakes = result.passed ? [] : [{ text, feedback: result.feedback }];
    onComplete(result.score, mistakes, elapsed);
  };

  return (
    <div className="flex-1 w-full sm:h-full flex flex-col sm:overflow-hidden bg-background relative pt-20 overflow-y-auto sm:overflow-y-visible custom-scrollbar">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#312e8115,transparent)]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="flex-1 flex flex-col-reverse sm:flex-row w-full sm:h-full sm:overflow-hidden relative z-10">

        {/* Zone A: Intelligence Dossier (Sidebar / Bottom on Mobile) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="shrink-0 sm:w-[420px] flex flex-col p-6 sm:p-10 border-t sm:border-t-0 sm:border-r border-border/50 bg-muted/10 backdrop-blur-xl relative sm:h-full overflow-y-visible sm:overflow-y-auto custom-scrollbar"
        >
          {/* Header HUD */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-violet-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400">Phase 09</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Neural Draft</span>
              </div>
            </div>

            <div className={`px-3 py-1 rounded-lg border flex items-center gap-2 ${timeLeft < 60 ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-muted/20 border-border/50 text-muted-foreground"}`}>
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-mono font-black">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>

          {/* Word Focus Panel */}
          <div className="mb-12">
            <div className="relative group inline-block">
                <h1 className="text-5xl sm:text-6xl font-black capitalize text-foreground tracking-tighter mb-4 leading-none transition-all group-hover:text-violet-400">
                {word.word}
              </h1>
              <div className="absolute -inset-2 bg-violet-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full -z-10" />
            </div>

              <div className="flex flex-wrap gap-2 mt-4">
              <div className="px-3 py-1 rounded-full bg-muted/20 border border-border/50 flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground">{word.phonetic}</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
                <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">{word.partOfSpeech}</span>
              </div>
            </div>
          </div>

          {/* Verification Metrics */}
          <div className="space-y-10 flex-1">
              <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Occurrence Matrix</span>
                <span className={localWordCount >= 3 ? "text-emerald-400" : "text-violet-400"}>{localWordCount} / 3</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${localWordCount >= i
                        ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        : i === localWordCount + 1 ? "bg-violet-600/40 animate-pulse" : "bg-muted/20"
                      }`}
                  />
                ))}
              </div>
            </div>

              <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Syntactic Volume</span>
                <span className={totalWords >= 50 ? "text-emerald-400" : "text-violet-400"}>{totalWords} / 50 Words</span>
              </div>
              <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${totalWords >= 50 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-violet-600"}`}
                  animate={{ width: `${Math.min((totalWords / 50) * 100, 100)}%` }}
                />
              </div>
            </div>

          </div>

          {/* Action Footer */}
          <div className="mt-8 pt-8 border-t border-border/50 flex flex-col gap-4">
            <Button
              variant="outline"
              onClick={handleRepeat}
              className="w-full h-12 rounded-xl border-border/50 text-muted-foreground hover:text-foreground font-bold"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Repeat Stage
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isEvaluating}
              className={`w-full h-16 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group ${canSubmit
                  ? "bg-violet-600 text-white shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-muted/20 text-muted-foreground border border-border/50"
                }`}
            >
              {isEvaluating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-3 relative z-10">
                  <Bot className={`w-4 h-4 ${canSubmit ? "animate-bounce" : ""}`} />
                  Execute AI Evaluation
                </div>
              )}
              {canSubmit && !isEvaluating && (
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-muted/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              )}
            </Button>
          </div>
        </motion.div>

        {/* Zone B: Neural Drafting Canvas (Main Area) */}
        <div className="flex-1 flex flex-col relative bg-background min-h-[calc(100vh-80px)] sm:min-h-0">
          {/* Canvas Background Grid */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #8b5cf6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                key="editor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col relative"
              >
                <div className="flex-1 relative z-10 flex flex-col w-full h-full">
                  <textarea
                    autoFocus
                    placeholder="Focus deep. Draft your synthesis here..."
                    className="flex-1 bg-transparent border-0 focus:ring-0 text-foreground text-lg sm:text-xl leading-relaxed sm:leading-loose resize-none placeholder:text-muted-foreground custom-scrollbar font-medium caret-violet-500 selection:bg-violet-500/30 p-8 sm:p-16"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>

                {isEvaluating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-muted/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-12 text-center"
                  >
                    <div className="w-32 h-32 mb-10 relative">
                      <div className="absolute inset-0 rounded-full border border-violet-500/10" />
                      <div className="absolute inset-0 rounded-full border-t-2 border-violet-500 animate-spin" />
                      <div className="absolute inset-4 rounded-full border border-violet-500/10" />
                      <div className="absolute inset-4 rounded-full border-b-2 border-indigo-500 animate-spin-reverse" style={{ animationDuration: '3s' }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Bot className="w-10 h-10 text-violet-400" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-black text-foreground mb-3 uppercase tracking-tighter">Neural Evaluation</h3>
                    <div className="flex items-center gap-2 text-violet-400/60 font-mono text-[10px] uppercase tracking-widest">
                      <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                      Scanning Syntactic Integrity
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col p-8 sm:p-16 items-center justify-center text-center max-w-5xl mx-auto w-full"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
                  <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                    <div className={`w-20 h-20 rounded-[24px] flex items-center justify-center mb-6 shadow-2xl ${result.passed ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-emerald-500/10" : "bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-rose-500/10"}`}>
                      {result.passed ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                    </div>

                    <div className="mb-8">
                      <div className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground mb-3">Neural Feedback Score</div>
                      <div className="flex items-end gap-3 justify-center lg:justify-start">
                        <span className="text-8xl font-black text-foreground leading-none">{result.score}</span>
                        <span className="text-3xl text-muted-foreground font-black mb-2">/ 10</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 w-full max-w-sm">
                      {!result.passed ? (
                        <Button
                          onClick={() => setResult(null)}
                          className="h-16 rounded-2xl bg-muted/20 border border-border/50 text-muted-foreground font-black uppercase tracking-widest hover:bg-muted/30 transition-all"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" /> Revise Manuscript
                        </Button>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <Button
                            onClick={handleComplete}
                            className="h-16 rounded-2xl bg-violet-600 text-white font-black uppercase tracking-widest shadow-xl shadow-violet-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                          >
                            Proceed to Finale <ArrowRight className="w-5 h-5 ml-2" />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={handleRepeat}
                            className="h-14 rounded-2xl text-muted-foreground font-black uppercase tracking-widest hover:text-foreground"
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-2" /> Repeat Analysis
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-4 bg-violet-500/5 blur-2xl rounded-[40px] group-hover:bg-violet-500/10 transition-all" />
                    <div className="relative bg-card border border-border/50 p-10 rounded-[40px] backdrop-blur-xl">
                      <div className="flex items-center gap-3 mb-6">
                        <Sparkles className="w-5 h-5 text-violet-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">AI Intelligence Report</span>
                      </div>
                      <p className="text-xl text-muted-foreground leading-relaxed font-medium italic">
                        "{result.feedback}"
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
