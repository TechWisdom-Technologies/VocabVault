"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, MoveRight, MoveLeft, RotateCcw, Brain, CheckCircle2, Info, Clock } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { loadStageSessionState, saveStageSessionState } from "./stage-session";
import { motion, AnimatePresence } from "framer-motion";

interface Stage3Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  word: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onComplete: (score: number, mistakes: any[], timeSpent: number) => void;
}

export default function Stage3Map({ word, onComplete }: Stage3Props) {
  const { getAuthHeaders } = useAuthStore();
  const synonyms = word.synonyms || [];
  const antonyms = word.antonyms || [];

  const [timeLeft, setTimeLeft] = useState(60);
  const [hasLoadedState, setHasLoadedState] = useState(false);
  const startTime = useRef<number>(0);

  useEffect(() => {
    startTime.current = Date.now();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const initialize = async () => {
      const saved = await loadStageSessionState<{ timeLeft?: number }>(getAuthHeaders, word.id);
      if (cancelled) return;
      if (saved?.timeLeft !== undefined) {
        setTimeLeft(saved.timeLeft);
        startTime.current = Date.now() - (60 - saved.timeLeft) * 1000;
      }
      setHasLoadedState(true);
    };

    void initialize();
    return () => { cancelled = true; };
  }, [getAuthHeaders, word.id]);

  useEffect(() => {
    if (!hasLoadedState) return;
    void saveStageSessionState(getAuthHeaders, word.id, { timeLeft });
  }, [hasLoadedState, timeLeft, getAuthHeaders, word.id]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleRepeat = async () => {
    await saveStageSessionState(getAuthHeaders, word.id, {});
    window.location.reload();
  };

  const handleComplete = () => {
    if (timeLeft === 0) {
      const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
      onComplete(10, [], elapsed);
    }
  };

  const progress = ((60 - timeLeft) / 60) * 100;

  return (
    <div className="flex-1 w-full h-full flex flex-col overflow-hidden bg-background relative pt-20">
      <div className="flex-1 flex flex-col sm:flex-row w-full h-full overflow-hidden bg-background">
        {/* Left Column: Word Anchor */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="shrink-0 sm:flex-[0.8] flex flex-col items-center justify-center p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-border/30 bg-muted/5 relative min-h-[25%] sm:min-h-0"
        >
          <div className="absolute top-4 sm:top-8 w-full flex justify-between px-4 sm:px-8 items-center text-primary/40">
            <div className="flex items-center gap-2 sm:gap-3">
              <Brain className="w-4 h-4 sm:w-5 h-5" />
              <span className="text-[9px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">Map Phase</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-white/5 border border-white/10">
              <Clock className="w-3 h-3 text-violet-400" />
              <span className="text-[9px] font-black text-violet-400">{timeLeft}s</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 sm:gap-6 mt-2 sm:mt-0">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              <h1 className="text-4xl sm:text-6xl font-black capitalize text-gradient tracking-tighter leading-none mb-2 sm:mb-4">
                {word.word}
              </h1>
              <div className="inline-flex items-center gap-2 sm:gap-3 bg-background/50 backdrop-blur-md border border-border/50 px-3 py-1 sm:px-4 sm:py-1.5 rounded-xl">
                <span className="text-lg sm:text-xl font-mono text-muted-foreground/80">{word.phonetic}</span>
                <div className="w-px h-4 sm:h-5 bg-border/50" />
                <span className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-widest">{word.partOfSpeech}</span>
              </div>
            </motion.div>

            <div className="hidden sm:flex flex-col items-center gap-2 text-center max-w-[200px]">
              <Info className="w-4 h-4 text-muted-foreground/30" />
              <p className="text-[10px] font-medium text-muted-foreground/60 leading-relaxed uppercase tracking-wider">
                Analyze relationships to lock the word in long-term memory.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Column: The Relationship Map */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col p-4 sm:p-10 bg-background/40 backdrop-blur-3xl overflow-hidden"
        >
          <div className="flex-1 flex flex-col min-h-0 justify-center gap-4 sm:gap-8 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

              {/* Synonyms */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <div className="h-px w-6 bg-success/40" />
                  <p className="text-[10px] font-bold text-success uppercase tracking-[0.2em]">Synonyms</p>
                  <MoveRight className="w-3 h-3 text-success/40" />
                </div>
                <div className="grid gap-2">
                  {synonyms.map((syn: any, idx: number) => (
                    <motion.div
                      key={`syn-${idx}`}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group p-3 sm:p-4 bg-success/5 border border-success/20 rounded-xl hover:bg-success/10 transition-all text-center lg:text-left"
                    >
                      <span className="block text-base sm:text-lg font-bold text-success capitalize mb-1">{syn.word}</span>
                      <span className="block text-[10px] sm:text-xs text-muted-foreground leading-relaxed italic">&quot;{syn.sentence}&quot;</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Antonyms */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <div className="h-px w-6 bg-destructive/40" />
                  <p className="text-[10px] font-bold text-destructive uppercase tracking-[0.2em]">Antonyms</p>
                  <MoveLeft className="w-3 h-3 text-destructive/40" />
                </div>
                <div className="grid gap-2">
                  {antonyms.map((ant: any, idx: number) => (
                    <motion.div
                      key={`ant-${idx}`}
                      initial={{ x: 10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group p-3 sm:p-4 bg-destructive/5 border border-destructive/20 rounded-xl hover:bg-destructive/10 transition-all text-center lg:text-left"
                    >
                      <span className="block text-base sm:text-lg font-bold text-destructive capitalize mb-1">{ant.word}</span>
                      <span className="block text-[10px] sm:text-xs text-muted-foreground leading-relaxed italic">&quot;{ant.sentence}&quot;</span>
                    </motion.div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Action Controls */}
          <div className="mt-4 sm:mt-auto pt-4 sm:pt-8 border-t border-border/30 flex gap-2 sm:gap-4 shrink-0">
            <Button
              variant="outline"
              size="lg"
              onClick={handleRepeat}
              className="flex-1 rounded-xl h-10 sm:h-14 text-xs sm:text-sm font-bold border-border/60 hover:bg-muted/50"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 sm:mr-2" /> Repeat
            </Button>
            <Button
              onClick={timeLeft === 0 ? handleComplete : undefined}
              size="lg"
              disabled={timeLeft > 0}
              className={`flex-[2] rounded-xl h-10 sm:h-14 text-sm sm:text-lg font-black transition-all shadow-xl relative overflow-hidden ${timeLeft === 0
                  ? "bg-linear-to-r from-violet-600 to-purple-600 text-white shadow-violet-500/30"
                  : "bg-muted text-muted-foreground grayscale cursor-not-allowed border border-border/60"
                }`}
            >
              {timeLeft === 0 ? (
                <span className="flex items-center gap-2">Continue to Stage 4 <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6" /></span>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-widest opacity-60">Wait {timeLeft}s to proceed</span>
                  <div className="w-20 sm:w-32 h-1 bg-border/40 rounded-full mt-1 sm:mt-1.5 overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
