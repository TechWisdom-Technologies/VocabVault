"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, CheckCircle2, AlertCircle, ArrowRight, Loader2, RotateCcw, Brain } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { loadStageSessionState, saveStageSessionState } from "./stage-session";
import { motion, AnimatePresence } from "framer-motion";

interface Stage2Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  word: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onComplete: (score: number, mistakes: any[], timeSpent: number) => void;
}

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

export default function Stage2Immersion({ word, onComplete }: Stage2Props) {
  const { getAuthHeaders } = useAuthStore();
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [results, setResults] = useState<{ passed: boolean; accuracy: number; feedback: string }[]>([]);
  const [timeLeft, setTimeLeft] = useState(120);
  const [hasLoadedState, setHasLoadedState] = useState(false);
  const startTime = useRef<number>(0);
  
  const sentences = word.sentences || [];
  const currentSentence = sentences[currentSentenceIndex];

  useEffect(() => {
    startTime.current = Date.now();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const initialize = async () => {
      const saved = await loadStageSessionState<{
        currentSentenceIndex?: number;
        isRecording?: boolean;
        isEvaluating?: boolean;
        results?: { passed: boolean; accuracy: number; feedback: string }[];
        timeLeft?: number;
      }>(getAuthHeaders, word.id);

      if (cancelled) return;

      if (saved) {
        setCurrentSentenceIndex(saved.currentSentenceIndex || 0);
        setIsRecording(saved.isRecording || false);
        setIsEvaluating(saved.isEvaluating || false);
        setResults(saved.results || []);
        setTimeLeft(saved.timeLeft ?? 120);
        startTime.current = Date.now() - (120 - (saved.timeLeft ?? 120)) * 1000;
      }
      setHasLoadedState(true);
    };

    void initialize();
    return () => { cancelled = true; };
  }, [getAuthHeaders, word.id]);

  useEffect(() => {
    if (!hasLoadedState) return;
    void saveStageSessionState(getAuthHeaders, word.id, {
      currentSentenceIndex,
      isRecording,
      isEvaluating,
      results,
      timeLeft,
    });
  }, [hasLoadedState, currentSentenceIndex, isRecording, isEvaluating, results, timeLeft, getAuthHeaders, word.id]);

  useEffect(() => {
    if (timeLeft > 0 && results.length < sentences.length) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft <= 0 && results.length < sentences.length) {
      handleComplete();
    }
  }, [timeLeft, results.length, sentences.length]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  }, []);

  const stopRecordingAndEvaluate = useCallback(async () => {
    if (!mediaRecorderRef.current) return;
    setIsRecording(false);
    setIsEvaluating(true);
    const recorder = mediaRecorderRef.current;
    await new Promise<void>((resolve) => { recorder.onstop = () => resolve(); recorder.stop(); });
    recorder.stream.getTracks().forEach((track) => track.stop());
    const audioBlob = new Blob(chunksRef.current, { type: recorder.mimeType });

    try {
      const headers = await getAuthHeaders();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (headers as any)["Content-Type"];
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("sentence", currentSentence?.sentence || "");
      formData.append("targetWord", word.word);
      formData.append("stageType", "immersion");

      const res = await fetch("/api/stage/evaluate/speech", {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) throw new Error("Evaluation failed");

      const data = await res.json();
      const accuracy = data.accuracy || Math.round((data.score / 10) * 100);
      const passed = data.score >= 8;

      const newResults = [...results, { passed, accuracy, feedback: data.feedback || "" }];
      setResults(newResults);
      setIsEvaluating(false);

      if (currentSentenceIndex < sentences.length - 1) {
        setTimeout(() => setCurrentSentenceIndex((prev) => prev + 1), 2000);
      }
    } catch (error) {
      console.error("Evaluation error:", error);
      setIsEvaluating(false);
      const newResults = [...results, { passed: false, accuracy: 0, feedback: "Evaluation failed. Please try again." }];
      setResults(newResults);
      if (currentSentenceIndex < sentences.length - 1) {
        setTimeout(() => setCurrentSentenceIndex((prev) => prev + 1), 2000);
      }
    }
  }, [currentSentenceIndex, currentSentence, getAuthHeaders, results, sentences.length, word.word]);

  const handleRecordToggle = () => {
    if (isRecording) stopRecordingAndEvaluate();
    else startRecording();
  };

  const handleComplete = () => {
    const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
    const totalAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0);
    const avgAccuracy = results.length > 0 ? totalAccuracy / results.length : 0;
    const score = Math.round(avgAccuracy / 10);
    const mistakes = results
      .map((r, i) => ({
        sentence: sentences[i]?.sentence,
        accuracy: r.accuracy,
        feedback: r.feedback,
        passed: r.passed,
      }))
      .filter((r) => !r.passed);

    onComplete(score, mistakes, elapsed);
  };

  const handleRepeat = async () => {
    await saveStageSessionState(getAuthHeaders, word.id, {});
    window.location.reload();
  };

  const isFinished = results.length === sentences.length && sentences.length > 0;
  const timeFormatted = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, "0")}`;

  return (
    <div className="flex-1 w-full h-full flex flex-col overflow-hidden bg-background relative pt-20">
      <div className="flex-1 flex flex-col sm:flex-row w-full h-full overflow-hidden bg-background">
        {/* Target Word Focus */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="shrink-0 sm:flex-1 flex flex-col items-center justify-center p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-border/30 bg-muted/5 relative min-h-[30%] sm:min-h-0"
      >
        <div className="absolute top-4 sm:top-8 w-full flex justify-between px-4 sm:px-8 items-center text-primary/40">
          <div className="flex items-center gap-2 sm:gap-3">
            <Brain className="w-4 h-4 sm:w-5 h-5" />
            <span className="text-[9px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">Immersion Phase</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-white/5 border border-white/10">
            <span className="text-[9px] font-black text-violet-400">{results.length}/{sentences.length}</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 sm:gap-8 mt-4 sm:mt-0">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <h1 className="text-4xl sm:text-7xl font-black capitalize text-gradient tracking-tighter leading-none mb-2 sm:mb-6">
              {word.word}
            </h1>
            <div className="inline-flex items-center gap-2 sm:gap-4 bg-background/50 backdrop-blur-md border border-border/50 px-3 py-1 sm:px-6 sm:py-2 rounded-xl sm:rounded-2xl shadow-lg">
              <span className="text-lg sm:text-2xl font-mono text-muted-foreground/80">{word.phonetic}</span>
              <div className="w-px h-4 sm:h-6 bg-border/50" />
              <span className="text-[10px] sm:text-sm font-bold text-primary uppercase tracking-widest">{word.partOfSpeech}</span>
            </div>
          </motion.div>
          
          <div className="flex gap-1.5 sm:gap-2">
            {sentences.map((_: any, idx: number) => (
              <div 
                key={idx}
                className={`h-1 sm:h-1.5 w-6 sm:w-8 rounded-full transition-all duration-500 ${
                  idx < results.length 
                    ? results[idx].passed ? "bg-success" : "bg-destructive" 
                    : idx === currentSentenceIndex ? "bg-primary w-8 sm:w-12" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Sentence Interaction */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col p-4 sm:p-12 bg-background/40 backdrop-blur-3xl overflow-hidden"
      >
        <div className="flex-1 flex flex-col min-h-0 justify-center">
          <AnimatePresence mode="wait">
            {!isFinished ? (
              <motion.div 
                key={currentSentenceIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 flex flex-col justify-center gap-4 sm:gap-8 min-h-0"
              >
                <div className="space-y-2 sm:space-y-4">
                  <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3">
                    <div className="h-px w-6 sm:w-8 bg-primary/40" />
                    <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">
                      {TENSE_NAME_MAP[currentSentence?.tense] || currentSentence?.tense || "Context"}
                    </span>
                  </div>
                  <p className="text-lg sm:text-4xl font-medium leading-relaxed text-foreground/90 italic text-center sm:text-left pr-0 sm:pr-2">
                    {currentSentence?.sentence
                      .split(new RegExp(`(${word.word})`, "i"))
                      .map((part: string, i: number) =>
                        part.toLowerCase() === word.word.toLowerCase() 
                          ? <span key={i} className="text-primary font-black not-italic border-b-2 border-primary/20">{part}</span>
                          : <span key={i}>{part}</span>
                      )}
                  </p>
                </div>

                {/* AI Result Feedback Overlay */}
                {results.length > currentSentenceIndex && !isEvaluating && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${
                      results[currentSentenceIndex].passed 
                        ? "bg-success/5 border-success/20 text-success" 
                        : "bg-destructive/5 border-destructive/20 text-destructive"
                    }`}
                  >
                    {results[currentSentenceIndex].passed ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> : <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
                    <div>
                      <p className="text-[10px] sm:text-sm font-bold">{results[currentSentenceIndex].accuracy}% Accuracy</p>
                      {results[currentSentenceIndex].feedback && (
                        <p className="text-[8px] sm:text-xs opacity-80 line-clamp-1 sm:line-clamp-none">{results[currentSentenceIndex].feedback}</p>
                      )}
                    </div>
                  </motion.div>
                )}

                <div className="flex flex-col items-center gap-2 sm:gap-4 mt-2 sm:mt-4">
                  {isEvaluating ? (
                    <div className="flex flex-col items-center gap-2 sm:gap-3 py-4 sm:py-6">
                      <div className="relative">
                        <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 animate-spin text-primary" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Brain className="w-3 h-3 sm:w-5 sm:h-5 text-primary/40" />
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Analyzing...</span>
                    </div>
                  ) : (
                    <Button
                      onClick={handleRecordToggle}
                      size="icon"
                      className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full transition-all duration-500 border-4 ${
                        isRecording
                          ? "bg-destructive border-destructive/20 scale-110 shadow-[0_0_20px_rgba(239,68,68,0.4)] ring-4 sm:ring-8 ring-destructive/5"
                          : "bg-primary border-primary/20 shadow-lg"
                      }`}
                    >
                      <Mic className={`w-6 h-6 sm:w-10 sm:h-10 text-white ${isRecording ? "animate-pulse" : ""}`} />
                    </Button>
                  )}
                  {!isEvaluating && (
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                      {isRecording ? "Tap to Stop" : "Tap to Speak"}
                    </p>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="finished"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center gap-4 sm:gap-6 overflow-y-auto custom-scrollbar"
              >
                <div className="w-12 h-12 sm:w-20 sm:h-20 bg-success/10 rounded-full flex items-center justify-center mb-1 sm:mb-2">
                  <CheckCircle2 className="w-6 h-6 sm:w-10 sm:h-10 text-success" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl sm:text-3xl font-black tracking-tight mb-1 uppercase">Immersion Complete</h3>
                  <p className="text-muted-foreground text-[10px] sm:text-sm">Review your pronunciation accuracy.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full max-w-sm">
                  {results.map((r, i) => (
                    <div key={i} className="flex flex-col p-2 sm:p-4 bg-muted/20 rounded-xl border border-border/40">
                      <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 mb-0.5">S{i + 1}</span>
                      <span className={`text-[10px] sm:text-sm font-bold ${r.passed ? "text-success" : "text-destructive"}`}>{r.accuracy}%</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Controls */}
        <div className="mt-4 sm:mt-auto pt-4 sm:pt-8 border-t border-border/30 flex gap-2 sm:gap-4 shrink-0">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleRepeat} 
            className="flex-1 rounded-xl h-10 sm:h-14 text-xs sm:text-sm font-bold border-border/60"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5 sm:mr-2" /> Repeat
          </Button>
          <Button
            onClick={isFinished ? handleComplete : undefined}
            size="lg"
            disabled={!isFinished}
            className={`flex-[2] rounded-xl h-10 sm:h-14 text-sm sm:text-lg font-black transition-all shadow-xl ${
              isFinished
                ? "bg-linear-to-r from-violet-600 to-purple-600 text-white shadow-violet-500/30"
                : "bg-muted text-muted-foreground grayscale cursor-not-allowed border border-border/60"
            }`}
          >
            {isFinished ? (
              <div className="flex items-center gap-2">Continue <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6" /></div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-[8px] sm:text-[10px] uppercase tracking-widest opacity-60">
                  {results.length + 1}/{sentences.length} • {timeFormatted}
                </span>
                <div className="w-20 sm:w-32 h-1 bg-border/40 rounded-full mt-1 sm:mt-1.5 overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary" 
                    animate={{ width: `${(results.length / sentences.length) * 100}%` }} 
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
