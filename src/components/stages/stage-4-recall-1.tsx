"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle2, XCircle, RotateCcw, Brain, Sparkles, Layers } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { loadStageSessionState, saveStageSessionState } from "./stage-session";
import { motion, AnimatePresence } from "framer-motion";

interface Stage4Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  word: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onComplete: (score: number, mistakes: any[], timeSpent: number) => void;
}

type QuestionType = "fill_blank" | "mcq" | "true_false";

type Question = {
  id: number;
  type: QuestionType;
  text: string;
  correctAnswer?: string;
  options?: string[];
  correctIndex?: number;
  isTrue?: boolean;
};

export default function Stage4Recall1({ word, onComplete }: Stage4Props) {
  const { getAuthHeaders } = useAuthStore();
  const startTime = useRef<number>(0);
  const [hasLoadedState, setHasLoadedState] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | boolean>>({});
  const [showResult, setShowResult] = useState(false);
  const [fillBlankInput, setFillBlankInput] = useState("");

  useEffect(() => {
    startTime.current = Date.now();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const initialize = async () => {
      const saved = await loadStageSessionState<{
        currentQIndex?: number;
        answers?: Record<number, string | boolean>;
        showResult?: boolean;
        fillBlankInput?: string;
      }>(getAuthHeaders, word.id);

      if (cancelled) return;
      if (saved) {
        setCurrentQIndex(saved.currentQIndex || 0);
        setAnswers(saved.answers || {});
        setShowResult(saved.showResult || false);
        setFillBlankInput(saved.fillBlankInput || "");
      }
      setHasLoadedState(true);
    };

    void initialize();
    return () => { cancelled = true; };
  }, [getAuthHeaders, word.id]);

  useEffect(() => {
    if (!hasLoadedState) return;
    void saveStageSessionState(getAuthHeaders, word.id, {
      currentQIndex,
      answers,
      showResult,
      fillBlankInput,
    });
  }, [hasLoadedState, currentQIndex, answers, showResult, fillBlankInput, getAuthHeaders, word.id]);

  const questions: Question[] = useMemo(() => {
    const syns = (word.synonyms || []).map((s: any) => s.word || s);
    const ants = (word.antonyms || []).map((a: any) => a.word || a);
    const sentences = word.sentences || [];

    const fillBlanks: Question[] = [];
    // Custom Questions from Admin
    const customQs = (word.recall1Questions || []).map((q: any, i: number) => ({
      ...q,
      id: `custom-${i}`
    }));

    // Algorithmic Questions
    for (let i = 0; i < 4; i++) {
      const sent = sentences[i];
      if (sent?.sentence) {
        const blanked = sent.sentence.replace(new RegExp(`\\b${word.word}\\b`, "gi"), "________");
        fillBlanks.push({ id: i + 1, type: "fill_blank", text: blanked, correctAnswer: word.word.toLowerCase() });
      } else {
        fillBlanks.push({ id: i + 1, type: "fill_blank", text: `The word that means "${word.definition}" is ________.`, correctAnswer: word.word.toLowerCase() });
      }
    }

    const mcqs: Question[] = [];
    const defOptions = [word.definition, `A type of ${syns[0] || "object"} used rarely`, `Opposite of ${ants[0] || "something"}`, `Term for being ${ants[1] || "different"}`];
    const defShuffled = shuffleWithCorrect(defOptions, 0);
    mcqs.push({ id: 5, type: "mcq", text: `What is the definition of "${word.word}"?`, options: defShuffled.options, correctIndex: defShuffled.correctIndex });

    const synOptions = [syns[0] || "similar", ants[0] || "opposite", ants[1] || "unrelated", "None of the above"];
    const synShuffled = shuffleWithCorrect(synOptions, 0);
    mcqs.push({ id: 6, type: "mcq", text: `Which is a synonym of "${word.word}"?`, options: synShuffled.options, correctIndex: synShuffled.correctIndex });

    const antOptions = [ants[0] || "opposite", syns[0] || "similar", syns[1] || "alike", word.word];
    const antShuffled = shuffleWithCorrect(antOptions, 0);
    mcqs.push({ id: 7, type: "mcq", text: `Which is an antonym of "${word.word}"?`, options: antShuffled.options, correctIndex: antShuffled.correctIndex });

    const posOptions = [word.partOfSpeech, word.partOfSpeech === "noun" ? "verb" : "noun", word.partOfSpeech === "adjective" ? "adverb" : "adjective", "interjection"];
    const posShuffled = shuffleWithCorrect(posOptions, 0);
    mcqs.push({ id: 8, type: "mcq", text: `"${word.word}" is which part of speech?`, options: posShuffled.options, correctIndex: posShuffled.correctIndex });

    const tfs: Question[] = [
      { id: 9, type: "true_false", text: `"${syns[1] || syns[0] || "happy"}" is a synonym for "${word.word}".`, isTrue: true },
      { id: 10, type: "true_false", text: `"${ants[0] || "sad"}" is a synonym for "${word.word}".`, isTrue: false },
    ];

    return [...customQs, ...fillBlanks, ...mcqs, ...tfs].slice(0, 10);
  }, [word]);

  function shuffleWithCorrect(options: string[], correctIdx: number) {
    const correctAnswer = options[correctIdx];
    const shuffled = [...options].sort(() => Math.random() - 0.5);
    return { options: shuffled, correctIndex: shuffled.indexOf(correctAnswer) };
  }

  const currentQ = questions[currentQIndex];

  const handleAnswer = (userAnswer: string | boolean) => {
    setAnswers((prev) => ({ ...prev, [currentQIndex]: userAnswer }));
    setShowResult(true);

    setTimeout(() => {
      setShowResult(false);
      setFillBlankInput("");
      if (currentQIndex < questions.length - 1) {
        setCurrentQIndex((prev) => prev + 1);
      } else {
        finishQuiz({ ...answers, [currentQIndex]: userAnswer });
      }
    }, 1500);
  };

  const handleRepeat = async () => {
    await saveStageSessionState(getAuthHeaders, word.id, {});
    window.location.reload();
  };

  const finishQuiz = (finalAnswers: Record<number, string | boolean>) => {
    const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
    let correctCount = 0;
    const mistakes: any[] = [];

    questions.forEach((q, idx) => {
      const userAns = finalAnswers[idx];
      const isCorrect = checkAnswerInternal(q, userAns);
      if (isCorrect) correctCount++;
      else mistakes.push({ question: q.text, type: q.type, userAnswer: userAns });
    });

    const score = Math.round((correctCount / questions.length) * 10);
    onComplete(score, mistakes, elapsed);
  };

  const checkAnswerInternal = (q: Question, ans: any) => {
    if (q.type === "fill_blank") return String(ans).trim().toLowerCase() === q.correctAnswer?.toLowerCase();
    if (q.type === "mcq") return Number(ans) === q.correctIndex;
    if (q.type === "true_false") return ans === q.isTrue;
    return false;
  };

  const isCorrect = answers[currentQIndex] !== undefined && checkAnswerInternal(currentQ, answers[currentQIndex]);
  const progress = ((currentQIndex) / questions.length) * 100;

  return (
    <div className="flex-1 w-full h-full flex flex-col overflow-hidden bg-background relative pt-20">
      {/* Main Experience Surface */}
      <div className="flex-1 w-full h-full flex flex-col overflow-hidden">
      {/* Top Tier: Question Surface */}
      <div className="h-[45%] w-full relative overflow-hidden flex flex-col items-center justify-center p-6 bg-[#0a0a0c]">
        {/* Module Indicator HUD */}
        <div className="absolute top-4 flex items-center gap-4 z-20">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest">{currentQIndex + 1}/{questions.length} Questions</span>
          </div>
        </div>
        {/* Abstract Background for Top */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 right-0 w-[60%] h-full bg-linear-to-bl from-violet-600/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-[40%] h-full bg-linear-to-tr from-purple-600/10 to-transparent" />
        </div>

        {/* Global Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
          <motion.div className="h-full bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.6)]" animate={{ width: `${progress}%` }} />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6 max-w-4xl w-full">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <Layers className="w-4 h-4 text-violet-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Active Recall Phase</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center space-y-4"
            >
              <h2 className="text-2xl sm:text-4xl font-bold leading-tight text-white/90 max-w-2xl mx-auto">
                {currentQ.text}
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-500/60">
                Question {currentQIndex + 1} of {questions.length}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Bar Floating Bottom of Top Tier */}
        <div className="absolute bottom-6 left-0 w-full px-8 flex justify-between items-center z-20">
          <Button variant="ghost" onClick={handleRepeat} className="rounded-full text-white/30 hover:text-white/80 hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest gap-2">
            <RotateCcw className="w-3 h-3" /> Reset
          </Button>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div key={i} className={`h-1 w-3 rounded-full ${i < currentQIndex ? (checkAnswerInternal(questions[i], answers[i]) ? "bg-success" : "bg-destructive") : i === currentQIndex ? "bg-violet-500" : "bg-white/10"}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Tier: Interaction Surface */}
      <div className="flex-1 w-full bg-background flex flex-col items-center justify-center p-6 relative">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div
                key={`input-${currentQIndex}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="w-full"
              >
                {currentQ.type === "fill_blank" && (
                  <form onSubmit={(e) => { e.preventDefault(); if (fillBlankInput.trim()) handleAnswer(fillBlankInput); }} className="flex flex-col gap-6">
                    <div className="relative group">
                      <Input
                        autoFocus
                        value={fillBlankInput}
                        onChange={(e) => setFillBlankInput(e.target.value)}
                        className="text-center text-2xl sm:text-3xl h-20 sm:h-24 font-black border-0 bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/10"
                        placeholder="..."
                      />
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[30%] h-[1px] bg-linear-to-r from-transparent via-violet-500 to-transparent opacity-50 group-focus-within:w-[60%] group-focus-within:opacity-100 transition-all duration-700" />
                    </div>
                    <Button type="submit" disabled={!fillBlankInput.trim()} className="w-fit mx-auto px-10 h-12 rounded-full text-sm font-bold bg-primary hover:bg-primary/90 shadow-lg">
                      Submit <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                )}

                {currentQ.type === "mcq" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentQ.options?.map((option, idx) => (
                      <motion.div key={idx} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          className="w-full h-14 sm:h-16 text-sm border-2 hover:border-primary hover:bg-primary/5 rounded-xl justify-start px-6 group relative overflow-hidden text-left"
                          onClick={() => handleAnswer(String(idx))}
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-black mr-3 group-hover:bg-primary group-hover:text-white transition-colors shrink-0">{String.fromCharCode(65 + idx)}</span>
                          <span className="font-medium truncate">{option}</span>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}

                {currentQ.type === "true_false" && (
                  <div className="flex gap-4 max-w-sm mx-auto">
                    <motion.div className="flex-1" whileTap={{ scale: 0.95 }}>
                      <Button onClick={() => handleAnswer(true)} variant="outline" className="w-full h-20 text-xl font-black border-2 hover:border-success hover:bg-success/5 rounded-2xl transition-all shadow-sm">True</Button>
                    </motion.div>
                    <motion.div className="flex-1" whileTap={{ scale: 0.95 }}>
                      <Button onClick={() => handleAnswer(false)} variant="outline" className="w-full h-20 text-xl font-black border-2 hover:border-destructive hover:bg-destructive/5 rounded-2xl transition-all shadow-sm">False</Button>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center py-10"
              >
                <div className={`p-3 rounded-xl mb-4 ${isCorrect ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                  {isCorrect ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                </div>
                <h3 className={`text-2xl font-black uppercase tracking-tight mb-1 ${isCorrect ? "text-success" : "text-destructive"}`}>
                  {isCorrect ? "Perfect!" : "Keep Trying"}
                </h3>
                {!isCorrect && (
                  <div className="mt-1 text-muted-foreground">
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-50 mb-0.5">Correct Answer</p>
                    <p className="text-base font-bold text-foreground capitalize">
                      {currentQ.type === "mcq" ? currentQ.options![currentQ.correctIndex!] : currentQ.type === "true_false" ? (currentQ.isTrue ? "True" : "False") : word.word}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  </div>
);
}
