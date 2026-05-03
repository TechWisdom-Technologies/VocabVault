"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  ShieldCheck, 
  Trophy, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from "lucide-react";

interface RulesModalProps {
  onAcknowledge: () => void;
}

export default function RulesModal({ onAcknowledge }: RulesModalProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleComplete();
  };

  const handleComplete = async () => {
    setIsLoading(true);
    await onAcknowledge();
    setIsLoading(false);
  };

  const rules = [
    {
      title: "The 10-Stage System",
      icon: <Brain className="w-8 h-8 text-violet-500" />,
      content: "Vocabulary is not memorized, it is internalized. You will take every word through 10 cognitive stages — from first exposure to fluent spoken production.",
      points: ["Timer-enforced reading", "AI-evaluated speaking", "Active recall quizzes"]
    },
    {
      title: "Mastery Threshold",
      icon: <ShieldCheck className="w-8 h-8 text-emerald-500" />,
      content: "To 'pass' a word, you must achieve a total score of 80/100 across all 10 stages. This ensures you haven't just seen the word, but actually own it.",
      points: ["80+ points to unlock next word", "Retry only the stages you failed", "Focus on precision over speed"]
    },
    {
      title: "The Daily Limit",
      icon: <Clock className="w-8 h-8 text-amber-500" />,
      content: "Science shows that deep processing of a few words is better than shallow skimming of many. You are limited to 5 words per day.",
      points: ["Sequential unlocking", "Daily streak maintenance", "Consistent long-term progress"]
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-xl"
      />

      {/* Modal Surface */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-card border border-primary/20 rounded-[2rem] shadow-2xl overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[100px]" />
        </div>

        <div className="relative p-8 sm:p-12 flex flex-col items-center text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center shadow-inner">
                {rules[step-1].icon}
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight text-foreground italic">
                  {rules[step-1].title}
                </h2>
                <p className="text-muted-foreground font-medium leading-relaxed max-w-md">
                  {rules[step-1].content}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-4">
                {rules[step-1].points.map((point, i) => (
                  <div key={i} className="p-3 rounded-xl bg-muted/50 border border-border/50 text-[10px] font-bold uppercase tracking-widest text-primary flex items-center justify-center text-center">
                    {point}
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress Indicators */}
          <div className="flex gap-2 mt-12 mb-8">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? "w-8 bg-primary" : "w-1.5 bg-muted"}`} 
              />
            ))}
          </div>

          <Button 
            onClick={handleNext}
            disabled={isLoading}
            className="w-full h-14 rounded-2xl bg-foreground text-background hover:bg-foreground/90 text-sm font-black uppercase tracking-widest group relative overflow-hidden transition-all active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              {step < 3 ? "Next Rule" : "Acknowledge & Begin"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>

          <p className="mt-4 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
            Mandatory Orientation Profile v1.0
          </p>
        </div>
      </motion.div>
    </div>
  );
}
