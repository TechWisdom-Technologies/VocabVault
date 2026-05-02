"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, ArrowRight, RotateCcw, Brain } from "lucide-react";
import { loadStageSessionState, saveStageSessionState } from "./stage-session";
import { useAuthStore } from "@/stores/auth-store";
import { motion } from "framer-motion";

interface Stage1Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  word: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onComplete: (score: number, mistakes: any[], timeSpent: number) => void;
}

const REQUIRED_TIMER = 45;
const REQUIRED_PLAYS = 3;

const TENSE_NAME_MAP: Record<string, string> = {
  "0": "Present",
  "1": "Past",
  "2": "Past Participle",
  "3": "Present Participle",
  "present": "Present",
  "past": "Past",
  "pastParticiple": "Past Participle",
  "presentParticiple": "Present Participle"
};

export default function Stage1Briefing({ word, onComplete }: Stage1Props) {
  const { getAuthHeaders } = useAuthStore();
  const [isPlayingPronunciation, setIsPlayingPronunciation] = useState(false);
  const [isPlayingDefinition, setIsPlayingDefinition] = useState(false);
  const [pronunciationPlays, setPronunciationPlays] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [hasLoadedState, setHasLoadedState] = useState(false);
  const startTime = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const initialize = async () => {
      startTime.current = Date.now();
      const saved = await loadStageSessionState<{ pronunciationPlays?: number; secondsElapsed?: number }>(getAuthHeaders, word.id);
      if (saved) {
        setPronunciationPlays(saved.pronunciationPlays || 0);
        setSecondsElapsed(saved.secondsElapsed || 0);
        startTime.current = Date.now() - (saved.secondsElapsed || 0) * 1000;
      }
      setHasLoadedState(true);
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
        setSecondsElapsed(elapsed);
      }, 1000);
    };
    void initialize();
    return () => { if (interval) clearInterval(interval); };
  }, [getAuthHeaders, word.id]);

  useEffect(() => {
    if (!hasLoadedState) return;
    void saveStageSessionState(getAuthHeaders, word.id, { pronunciationPlays, secondsElapsed });
  }, [hasLoadedState, pronunciationPlays, secondsElapsed, getAuthHeaders, word.id]);

  const timerMet = secondsElapsed >= REQUIRED_TIMER;
  const audioMet = pronunciationPlays >= REQUIRED_PLAYS;
  const canProceed = timerMet && audioMet;
  const remainingSeconds = Math.max(0, REQUIRED_TIMER - secondsElapsed);
  const totalProgress = ((Math.min(1, secondsElapsed / REQUIRED_TIMER) + Math.min(1, pronunciationPlays / REQUIRED_PLAYS)) / 2) * 100;

  const playTTS = useCallback((text: string, setPlaying: (v: boolean) => void) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      utterance.onend = () => setPlaying(false);
      utterance.onerror = () => setPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setPlaying(false), 1500);
    }
  }, []);

  const playAudio = useCallback((url: string | null | undefined, type: "pronunciation" | "definition") => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const setPlaying = type === "pronunciation" ? setIsPlayingPronunciation : setIsPlayingDefinition;
    setPlaying(true);
    let fallbackTriggered = false;
    const handleFallback = () => {
      if (fallbackTriggered) return;
      fallbackTriggered = true;
      playTTS(type === "pronunciation" ? word.word : word.definition, setPlaying);
      if (type === "pronunciation") setPronunciationPlays((p) => p + 1);
    };
    if (url) {
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play().catch(() => handleFallback());
      audio.onended = () => { setPlaying(false); if (type === "pronunciation") setPronunciationPlays((p) => p + 1); };
      audio.onerror = () => handleFallback();
    } else {
      handleFallback();
    }
  }, [word.word, word.definition, playTTS]);

  const handleComplete = () => {
    if (!canProceed) return;
    const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
    onComplete(10, [], elapsed);
  };

  const handleRepeat = async () => {
    await saveStageSessionState(getAuthHeaders, word.id, {});
    window.location.reload();
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="flex-1 w-full h-full flex flex-col overflow-hidden bg-background relative pt-20">
      <div className="flex-1 flex flex-col sm:flex-row w-full h-full overflow-hidden bg-background">
        {/* Word Presentation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="shrink-0 sm:flex-1 flex flex-col items-center justify-center p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-border/30 bg-muted/5 relative min-h-[35%] sm:min-h-0"
      >
        <div className="absolute top-4 sm:top-6 w-full flex justify-between px-4 sm:px-6 items-center">
          <div className="flex flex-col items-start leading-none">
            <h2 className="text-[10px] sm:text-xs font-black text-primary uppercase tracking-widest mb-0.5">Briefing Alpha</h2>
            <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter opacity-50">Secure Channel</span>
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest italic">Intelligence Loaded</span>
          </div>
        </div>

        <div className="absolute top-12 sm:top-16 text-center w-full px-4 opacity-20">
          <h2 className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">Stage 1: Word Briefing</h2>
          <p className="hidden sm:block text-muted-foreground text-[10px]">Study the word and listen to its pronunciation.</p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:gap-6 mt-4 sm:mt-0">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <h1 className="text-4xl sm:text-7xl font-black capitalize text-gradient tracking-tighter leading-tight mb-2 sm:mb-4">
              {word.word}
            </h1>
            <div className="inline-flex items-center gap-2 sm:gap-3 bg-background/50 backdrop-blur-md border border-border/50 px-3 py-1 sm:px-4 sm:py-1.5 rounded-xl shadow-md">
              <span className="text-lg sm:text-xl font-mono text-muted-foreground/80">{word.phonetic}</span>
              <div className="w-px h-4 sm:h-5 bg-border/50" />
              <span className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-widest">{word.partOfSpeech}</span>
            </div>
          </motion.div>

          <Button
            variant="outline"
            size="icon"
            className={`rounded-full w-16 h-16 sm:w-20 sm:h-20 transition-all duration-700 border-4 ${isPlayingPronunciation
                ? "border-primary bg-primary/10 scale-110 shadow-[0_0_20px_rgba(124,58,237,0.3)] ring-4 ring-primary/5"
                : audioMet ? "border-success/40 bg-success/5" : "border-primary/20"
              }`}
            onClick={() => playAudio(word.pronunciationAudioUrl, "pronunciation")}
            disabled={isPlayingPronunciation}
          >
            <Volume2 className={`w-6 h-6 sm:w-8 sm:h-8 ${isPlayingPronunciation ? "animate-pulse text-primary" : audioMet ? "text-success" : "text-primary/60"}`} />
          </Button>
        </div>
      </motion.div>

      {/* Information & Action */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col p-4 sm:p-10 bg-background/40 backdrop-blur-3xl overflow-hidden"
      >
        <div className="flex-1 flex flex-col min-h-0 justify-center gap-4 sm:gap-8 overflow-y-auto custom-scrollbar">
          {/* Definition */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <div className="h-px w-4 sm:w-6 bg-primary/40" />
              <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Definition</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
              <p className="text-base sm:text-2xl font-medium leading-normal text-foreground/90 italic text-center sm:text-left">
                &quot;{word.definition}&quot;
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full shrink-0 text-muted-foreground/30 hover:text-primary h-7 w-7 sm:h-8 sm:w-8 border border-border/30"
                onClick={() => playAudio(word.definitionAudioUrl, "definition")}
                disabled={isPlayingDefinition}
              >
                <Volume2 className={`w-3.5 h-3.5 sm:w-4 h-4 ${isPlayingDefinition ? "animate-pulse text-primary" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Tense Forms */}
          {word.tenseForms && typeof word.tenseForms === "object" && (
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <div className="h-px w-4 sm:w-6 bg-primary/40" />
                <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tense Forms</p>
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                {Object.entries(word.tenseForms).map(([tense, form]) => (
                  <div key={tense} className="flex flex-col p-2 sm:p-3 bg-muted/20 rounded-lg sm:rounded-xl border border-border/40 transition-all text-center sm:text-left">
                    <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-primary/60 mb-0.5">
                      {TENSE_NAME_MAP[tense] || tense}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-foreground/80">{String(form)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="mt-4 sm:mt-auto pt-4 sm:pt-6 border-t border-border/30 flex flex-col gap-2 sm:gap-3 shrink-0">
          <div className="flex gap-2 sm:gap-3">
            <Button
              variant="outline" size="lg"
              onClick={handleRepeat}
              className="flex-1 rounded-lg sm:rounded-xl h-10 sm:h-12 text-xs sm:text-sm font-bold border-border/60"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 sm:mr-2" /> Repeat
            </Button>
            <div className="flex-[2] relative">
              <Button
                onClick={handleComplete} size="lg" disabled={!canProceed}
                className={`w-full rounded-lg sm:rounded-xl h-10 sm:h-12 text-sm sm:text-base font-bold transition-all shadow-xl relative z-10 ${canProceed
                    ? "bg-linear-to-r from-violet-600 to-purple-600 text-white"
                    : "bg-muted/50 text-muted-foreground border border-border/60 cursor-not-allowed"
                  }`}
              >
                {canProceed ? (
                  <span className="flex items-center gap-1.5 sm:gap-2">Continue <ArrowRight className="w-4 h-4 sm:w-5 h-5" /></span>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] sm:text-[10px]">
                      {!timerMet && !audioMet ? `${remainingSeconds}s & Listen ${REQUIRED_PLAYS - pronunciationPlays}x` : !audioMet ? `Listen ${REQUIRED_PLAYS - pronunciationPlays}x more` : `Wait ${remainingSeconds}s`}
                    </span>
                    <div className="w-16 sm:w-20 h-1 bg-border/40 rounded-full mt-0.5 sm:mt-1 overflow-hidden">
                      <motion.div className="h-full bg-primary" animate={{ width: `${totalProgress}%` }} />
                    </div>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
  );
}
