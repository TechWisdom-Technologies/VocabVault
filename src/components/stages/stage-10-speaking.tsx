"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, CheckCircle2, ArrowRight, Loader2, Bot, Trophy , RotateCcw } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { loadStageSessionState, saveStageSessionState } from "./stage-session";

interface Stage10Props {
  word: any;
  onComplete: (score: number, mistakes: any[], timeSpent: number) => void;
}

export default function Stage10Speaking({ word, onComplete }: Stage10Props) {
  const { getAuthHeaders } = useAuthStore();
  const startTime = useRef(Date.now());
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [hasLoadedState, setHasLoadedState] = useState(false);
  const [result, setResult] = useState<{
    passed: boolean;
    score: number;
    fluency: number;
    vocabulary: number;
    feedback: string;
    transcript: string;
  } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let cancelled = false;
    const initialize = async () => {
      const saved = await loadStageSessionState<{
        recordingSeconds?: number;
        result?: typeof result;
        isEvaluating?: boolean;
        elapsedSeconds?: number;
      }>(getAuthHeaders, word.id);

      if (cancelled) return;

      if (saved) {
        setIsRecording(false);
        setIsEvaluating(saved.isEvaluating || false);
        setRecordingSeconds(saved.recordingSeconds || 0);
        if (saved.result) {
          setResult(saved.result);
        }
        const elapsed = saved.elapsedSeconds ?? saved.recordingSeconds ?? 0;
        startTime.current = Date.now() - elapsed * 1000;
      }
      setHasLoadedState(true);
    };

    void initialize();
    return () => {
      cancelled = true;
    };
  }, [getAuthHeaders, word.id]);

  useEffect(() => {
    if (!hasLoadedState) return;
    void saveStageSessionState(getAuthHeaders, word.id, {
      recordingSeconds,
      result,
      isEvaluating,
      elapsedSeconds: Math.floor((Date.now() - startTime.current) / 1000),
    });
  }, [hasLoadedState, recordingSeconds, result, isEvaluating, getAuthHeaders, word.id]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 59) {
            // Auto-stop at 60 seconds
            stopRecordingAndEvaluate();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Please allow microphone access to continue.");
    }
  }, []);

  const stopRecordingAndEvaluate = useCallback(async () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== "recording") return;

    setIsRecording(false);
    setIsEvaluating(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const recorder = mediaRecorderRef.current;

    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      recorder.stop();
    });

    recorder.stream.getTracks().forEach((track) => track.stop());

    const audioBlob = new Blob(chunksRef.current, { type: recorder.mimeType });

    try {
      const headers = await getAuthHeaders();
      delete (headers as any)["Content-Type"];

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("targetWord", word.word);
      formData.append("stageType", "performance");

      const res = await fetch("/api/stage/evaluate/speech", {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) throw new Error("Evaluation failed");

      const data = await res.json();

      setResult({
        passed: data.passed ?? data.score >= 8,
        score: data.score ?? 5,
        fluency: data.fluency ?? 70,
        vocabulary: data.vocabulary ?? 70,
        feedback: data.feedback ?? "Evaluation completed.",
        transcript: data.transcript ?? "",
      });
    } catch (error) {
      console.error("Speech evaluation error:", error);
      setResult({
        passed: false,
        score: 0,
        fluency: 0,
        vocabulary: 0,
        feedback: "Evaluation failed due to a network error. Please try again.",
        transcript: "",
      });
    } finally {
      setIsEvaluating(false);
    }
  }, [getAuthHeaders, word.word]);

  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecordingAndEvaluate();
    } else {
      startRecording();
    }
  };

  const handleComplete = () => {
    if (!result) return;
    const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
    onComplete(result.score, [], elapsed);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto w-full">
      <div className="text-center mb-8">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          Final Stage: Spoken Performance
        </h2>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Speak freely for up to 1 minute using the word{" "}
          <strong className="text-foreground">"{word.word}"</strong> at least 3
          times. AI will evaluate your fluency and vocabulary usage.
        </p>
      </div>

      <Card className="w-full border-border/50 shadow-2xl shadow-violet-500/10 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-violet-600 via-pink-500 to-amber-500" />
        <CardContent className="p-8 sm:p-12 flex flex-col items-center min-h-100 justify-center">
          {!result && !isEvaluating && (
            <div className="w-full flex flex-col items-center animate-in fade-in duration-500">
              {isRecording && (
                <div className="mb-8 text-center">
                  <div className="text-5xl font-mono font-bold text-primary mb-2">
                    {formatTime(recordingSeconds)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recording... (max 1 minute)
                  </p>
                  <div className="w-full max-w-xs bg-muted rounded-full h-2 mt-3">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(recordingSeconds / 60) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {!isRecording && (
                <div className="bg-muted/50 p-6 rounded-2xl border border-border text-center max-w-lg mb-12">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                    Instructions
                  </p>
                  <p className="text-lg sm:text-xl font-medium leading-relaxed">
                    Speak naturally about any topic. Use the word "
                    {word.word}" at least 3 times in different, natural
                    sentences.
                  </p>
                </div>
              )}

              <Button
                onClick={handleRecordToggle}
                size="icon"
                className={`w-24 h-24 rounded-full transition-all duration-300 ${
                  isRecording
                    ? "bg-destructive hover:bg-destructive/90 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.6)] animate-pulse"
                    : "bg-linear-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-xl"
                }`}
              >
                <Mic
                  className={`w-10 h-10 text-foreground ${isRecording ? "animate-bounce" : ""}`}
                />
              </Button>
              <p className="mt-6 text-sm text-muted-foreground font-medium">
                {isRecording
                  ? "Speak now... Tap to stop and evaluate"
                  : "Tap the mic when you're ready"}
              </p>
            </div>
          )}

          {isEvaluating && (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground w-full py-20">
              <div className="relative mb-8">
                <Bot className="w-20 h-20 text-primary relative z-10" />
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-xl font-bold text-foreground">
                    AI evaluating your speech...
                  </span>
                </div>
                <p className="text-sm">
                  Transcribing audio and analyzing fluency, pronunciation, and
                  vocabulary.
                </p>
              </div>
            </div>
          )}

          {result && !isEvaluating && (
            <div className="flex-1 flex flex-col items-center justify-center w-full py-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-linear-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(245,158,11,0.4)]">
                <Trophy className="w-12 h-12 text-foreground" />
              </div>

              <h3 className="text-4xl font-black mb-1 bg-linear-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                {result.score}/10
              </h3>
              <p className="text-muted-foreground mb-4 text-lg">
                {result.passed ? "Outstanding!" : "Keep practicing!"}
              </p>

              <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-6">
                <div className="p-4 bg-muted/30 border border-border/50 rounded-xl">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Fluency
                  </p>
                  <p className="text-2xl font-bold text-success">
                    {result.fluency}%
                  </p>
                </div>
                <div className="p-4 bg-muted/30 border border-border/50 rounded-xl">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Context
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {result.vocabulary}%
                  </p>
                </div>
              </div>

              {/* AI Feedback */}
              <div className="bg-muted p-5 rounded-xl border border-border/50 max-w-lg mb-6 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background border px-3 py-0.5 rounded-full text-xs font-bold text-muted-foreground flex items-center gap-1">
                  <Bot className="w-3 h-3" /> AI Feedback
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {result.feedback}
                </p>
              </div>

              {/* Transcript */}
              {result.transcript && (
                <details className="w-full max-w-lg mb-8 text-left">
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                    View transcript
                  </summary>
                  <p className="mt-2 p-3 bg-muted/30 rounded-lg text-sm border border-border/50">
                    {result.transcript}
                  </p>
                </details>
              )}

              
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-lg mx-auto">
        <Button
          variant="outline"
          size="lg"
          onClick={async () => {
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
          }}
          className="tap-target px-8 rounded-full h-14 text-lg border-primary/20 hover:bg-primary/5 text-primary w-full sm:w-auto"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Repeat Stage
        </Button>
        <Button
                onClick={handleComplete}
                size="lg"
                className="tap-target bg-foreground text-background hover:bg-foreground/90 px-12 rounded-full h-14 text-lg w-full sm:w-auto"
              >
                Complete Word
                <CheckCircle2 className="w-5 h-5 ml-2" />
              </Button>
      </div>
    
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
