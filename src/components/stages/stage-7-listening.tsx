"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Volume2, ArrowRight, Globe, CheckCircle2, RotateCcw, Brain, Waves, Play, Pause, Headphones, HeadphonesIcon, HeadphonesIcon as HeadphoneIcon } from "lucide-react";
import { Howl } from "howler";
import { useAuthStore } from "@/stores/auth-store";
import { loadStageSessionState, saveStageSessionState } from "./stage-session";
import { motion, AnimatePresence } from "framer-motion";

interface Stage7Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  word: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onComplete: (score: number, mistakes: any[], timeSpent: number) => void;
}

export default function Stage7Listening({ word, onComplete }: Stage7Props) {
  const { getAuthHeaders } = useAuthStore();
  const startTime = useRef<number>(0);
  useEffect(() => {
    startTime.current = Date.now();
  }, []);
  
  const [submitted, setSubmitted] = useState(false);
  const [hasLoadedState, setHasLoadedState] = useState(false);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [listenedSet, setListenedSet] = useState<Set<number>>(new Set());
  
  const accents = word.audioClipUrls || [];
  const correctCounts = useMemo(() => word.correctAudioCounts || [], [word.correctAudioCounts]);
  const [counts, setCounts] = useState<string[]>(() => new Array(accents.length).fill(""));
  const [currentIdx, setCurrentIdx] = useState(0);

  const howlRef = useRef<Howl | null>(null);

  useEffect(() => {
    let cancelled = false;
    const initialize = async () => {
      const saved = await loadStageSessionState<{
        submitted?: boolean;
        playingIdx?: number | null;
        listenedSet?: number[];
        counts?: string[];
        currentIdx?: number;
      }>(getAuthHeaders, word.id);

      if (cancelled) return;
      if (saved) {
        setSubmitted(saved.submitted || false);
        setListenedSet(new Set(saved.listenedSet || []));
        setCounts(saved.counts || new Array(accents.length).fill(""));
        setCurrentIdx(saved.currentIdx || 0);
      }
      setHasLoadedState(true);
    };

    void initialize();
    return () => { cancelled = true; };
  }, [accents.length, getAuthHeaders, word.id]);

  useEffect(() => {
    if (!hasLoadedState) return;
    void saveStageSessionState(getAuthHeaders, word.id, {
      submitted,
      listenedSet: Array.from(listenedSet),
      counts,
      currentIdx
    });
  }, [hasLoadedState, submitted, listenedSet, counts, currentIdx, getAuthHeaders, word.id]);

  const finalizeListen = (idx: number) => {
    setPlayingIdx(null);
    setListenedSet((prev) => {
      const newSet = new Set(prev);
      newSet.add(idx);
      return newSet;
    });
  };

  const playFallbackTTS = (text: string, count: number, idx: number) => {
    if (!("speechSynthesis" in window)) { finalizeListen(idx); return; }
    let played = 0;
    const playNext = () => {
      if (played >= count) { finalizeListen(idx); return; }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) utterance.voice = voices[idx % voices.length];
      utterance.onend = () => { played++; setTimeout(playNext, 800); };
      utterance.onerror = () => finalizeListen(idx);
      window.speechSynthesis.speak(utterance);
    };
    playNext();
  };

  const handlePlay = (idx: number) => {
    if (playingIdx !== null) return;
    const clip = accents[idx];
    const expectedCount = correctCounts[idx]?.count || 2;

    if (!clip?.url) {
      setPlayingIdx(idx);
      playFallbackTTS(word.word, expectedCount, idx);
      return;
    }

    setPlayingIdx(idx);
    if (howlRef.current) howlRef.current.unload();
    const howl = new Howl({
      src: [clip.url],
      html5: true,
      onend: () => finalizeListen(idx),
      onloaderror: () => playFallbackTTS(word.word, expectedCount, idx),
    });
    howlRef.current = howl;
    howl.play();
  };

  const updateCount = (idx: number, value: string) => {
    const newCounts = [...counts];
    newCounts[idx] = value;
    setCounts(newCounts);
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

  const allListened = listenedSet.size === accents.length && accents.length > 0;
  const allCounted = counts.every((c) => c !== "" && !isNaN(parseInt(c)));
  const canSubmit = allListened && allCounted;

  const handleComplete = useCallback(() => {
    setSubmitted(true);
    const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
    let totalDiff = 0;
    counts.forEach((countStr, idx) => {
      const sub = parseInt(countStr, 10) || 0;
      const cor = correctCounts[idx]?.count || 2;
      totalDiff += Math.abs(sub - cor);
    });
    let score = 10;
    if (totalDiff === 0) score = 10;
    else if (totalDiff <= 1) score = 9;
    else if (totalDiff <= 2) score = 8;
    else if (totalDiff <= 3) score = 6;
    else if (totalDiff <= 5) score = 4;
    else score = 2;
    onComplete(score, [], elapsed);
  }, [correctCounts, counts, onComplete]);

  useEffect(() => {
    return () => { if (howlRef.current) howlRef.current.unload(); };
  }, []);

  return (
    <div className="flex-1 w-full h-full flex flex-col sm:flex-row overflow-hidden bg-background relative pt-20">
      {/* Sidebar: Audio Clips (Left) */}
      <div className="hidden sm:flex flex-col w-72 border-r border-border/50 bg-muted/10 p-6 shrink-0">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <Headphones className="w-5 h-5 text-violet-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Audio Archive</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted/20 border border-border/50">
            <span className="text-[9px] font-black text-violet-400">{listenedSet.size}/{accents.length}</span>
          </div>
        </div>

          <div className="space-y-4 mb-6">
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full bg-violet-600 shadow-[0_0_8px_rgba(139,92,246,0.4)]" animate={{ width: `${(listenedSet.size / accents.length) * 100}%` }} />
          </div>
        </div>

        <div className="space-y-2 flex-1 pr-1">
          {accents.map((item: any, idx: number) => {
            const hasListened = listenedSet.has(idx);
            const isCurrent = currentIdx === idx;
            const isPlaying = playingIdx === idx;
            return (
                <button
                key={idx}
                onClick={() => setCurrentIdx(idx)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all relative overflow-hidden group ${
                  isCurrent 
                    ? "bg-violet-600 border-violet-400 shadow-lg shadow-violet-600/20" 
                    : "bg-muted/20 border-border/50 hover:border-violet-500/40"
                }`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <div className={`w-1 h-1 rounded-full ${hasListened ? "bg-emerald-400" : isPlaying ? "bg-muted animate-pulse" : "bg-muted/40"}`} />
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>Clip {idx + 1}</span>
                </div>
                <p className={`text-[11px] font-bold ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>{item.accent}</p>
                {hasListened && <CheckCircle2 className="absolute top-3.5 right-3.5 w-2.5 h-2.5 text-emerald-400/50" />}
              </button>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-border/50">
          <Button variant="ghost" onClick={handleRepeat} className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/20 text-[9px] font-black uppercase tracking-widest gap-2 p-0 px-3 h-10">
            <RotateCcw className="w-3.5 h-3.5" /> Reset Module
          </Button>
        </div>
      </div>

      {/* Main Experience (Center) */}
      <div className="flex-1 flex flex-col relative min-w-0 bg-background">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/5 blur-[120px]" />
        </div>

        {/* Header HUD */}
        <div className="flex items-center justify-between p-6 sm:px-12 sm:py-8 border-b border-border/50 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <Brain className="w-4 h-4 text-violet-400" />
            <h1 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">Stage 7: Auditory Precision</h1>
          </div>
          <div className="flex items-center gap-3 bg-muted/20 px-4 py-1.5 rounded-full border border-border/50">
            <div className="w-20 h-1 bg-muted/30 rounded-full overflow-hidden">
              <motion.div className="h-full bg-violet-500" animate={{ width: `${(listenedSet.size / accents.length) * 100}%` }} />
            </div>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{listenedSet.size}/{accents.length} Listened</span>
          </div>
        </div>

        {/* Task Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-20 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl flex flex-col items-center gap-10 sm:gap-16"
            >
              <div className="text-center space-y-2 sm:space-y-3">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
                  <Globe className="w-3 h-3 text-violet-400" />
                  <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest">{accents[currentIdx]?.accent} Accent</span>
                </div>
                <h2 className="text-xl sm:text-3xl font-black text-foreground leading-tight tracking-tight">
                  Log the word frequency.
                </h2>
              </div>

              {/* Audio Control Station */}
              <div className="w-full flex flex-col items-center gap-6 sm:gap-8">
                <div className="relative group">
                  <div className="absolute inset-0 bg-violet-600/20 blur-xl group-hover:bg-violet-600/40 transition-all rounded-full" />
                  <Button
                    onClick={() => handlePlay(currentIdx)}
                    disabled={playingIdx !== null}
                    className={`w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-card text-foreground hover:bg-muted/30 relative z-10 transition-all active:scale-95 shadow-xl ${playingIdx === currentIdx ? "animate-pulse" : ""}`}
                  >
                    {playingIdx === currentIdx ? <Waves className="w-8 h-8 sm:w-12 sm:h-12 animate-bounce" /> : listenedSet.has(currentIdx) ? <CheckCircle2 className="w-8 h-8 sm:w-12 sm:h-12" /> : <Play className="w-8 h-8 sm:w-12 sm:h-12 ml-1" />}
                  </Button>
                </div>

                <div className="flex items-center gap-4 w-full max-w-[240px]">
                  <div className="flex-1 h-[1px] bg-border/40" />
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] whitespace-nowrap">{playingIdx === currentIdx ? "Analyzing..." : "Standby"}</span>
                  <div className="flex-1 h-[1px] bg-border/40" />
                </div>

                <AnimatePresence>
                  {listenedSet.has(currentIdx) && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full"
                    >
                      <div className="relative max-w-[120px] mx-auto">
                          <Input
                          type="number"
                          value={counts[currentIdx] || ""}
                          onChange={(e) => updateCount(currentIdx, e.target.value)}
                          className="text-center text-3xl sm:text-5xl h-14 sm:h-20 font-black bg-muted/20 border-2 border-border/50 focus:border-violet-500/50 rounded-xl transition-all shadow-xl placeholder:text-muted-foreground"
                          placeholder="0"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global Action Bar */}
        <div className="px-6 py-4 sm:px-12 sm:py-6 border-t border-border/50 bg-muted/5 flex flex-col sm:flex-row items-center justify-between gap-4 z-20 shrink-0">
          <div className="hidden sm:flex flex-col gap-0.5 text-left">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Mastery Status</span>
            <p className="text-[10px] font-bold text-muted-foreground">Complete counts for all modules.</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!allListened || !allCounted ? (
              <div className="flex items-center gap-4 w-full">
                {currentIdx < accents.length - 1 && listenedSet.has(currentIdx) && counts[currentIdx] !== "" && (
                   <Button onClick={() => setCurrentIdx(currentIdx + 1)} className="h-11 px-6 rounded-xl bg-muted/20 border border-border/50 text-muted-foreground text-xs font-bold hover:bg-muted/30 w-full sm:w-auto">Next Module <ArrowRight className="w-3 h-3 ml-2" /></Button>
                )}
              </div>
            ) : (
              <Button
                onClick={handleComplete}
                className="w-full sm:w-auto h-12 px-10 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 text-white font-black text-sm shadow-xl shadow-violet-600/20"
              >
                Finalize results <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
