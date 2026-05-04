"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  ScrollText, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  Sparkles,
  Target,
  Zap,
  Info,
  ChevronRight,
  ShieldCheck,
  Brain,
  BookOpen,
  Mic,
  Eye,
  PenTool,
  Headphones,
  BarChart3,
  Volume2,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const stageTips = [
  { stage: 1, tip: "Press the pronunciation audio three times before you try to leave." },
  { stage: 2, tip: "Read naturally and avoid rushing; the AI rewards fluent delivery." },
  { stage: 5, tip: "Read actively instead of skimming so the word stays anchored in context." },
  { stage: 9, tip: "Vary sentence structure; robotic repetition is penalized by the evaluator." },
  { stage: 10, tip: "Speak naturally about a topic, weaving the target word in three times." },
];

const commonMistakes = [
  { stage: 1, mistake: "Leaving before the 45-second timer or skipping the pronunciation loop." },
  { stage: 4, mistake: "Answering quiz from memory of only one stage instead of the full flow." },
  { stage: 6, mistake: "Repeating the same spelling pattern without completing the matching phase." },
  { stage: 7, mistake: "Entering guesses before listening to each clip fully." },
  { stage: 8, mistake: "Counting only the exact word and forgetting synonyms or antonyms." },
];

const stages = [
  { num: 1, name: "Word Briefing", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10", rules: ["Press audio 3+ times", "Stay for full 45s"] },
  { num: 2, name: "Sentence Immersion", icon: Mic, color: "text-indigo-500", bg: "bg-indigo-500/10", rules: ["Hold mic, read naturally", "AI evaluates fluency"] },
  { num: 3, name: "Synonym Map", icon: Brain, color: "text-violet-500", bg: "bg-violet-500/10", rules: ["Absorb for 60s", "Tested in Stage 6"] },
  { num: 4, name: "Active Recall I", icon: Target, color: "text-fuchsia-500", bg: "bg-fuchsia-500/10", rules: ["10 Mixed questions", "Definition focused"] },
  { num: 5, name: "Article Deep Read", icon: Eye, color: "text-rose-500", bg: "bg-rose-500/10", rules: ["3 Short articles", "Stay for full 300s"] },
  { num: 6, name: "Active Recall II", icon: PenTool, color: "text-orange-500", bg: "bg-orange-500/10", rules: ["Spelling (3x accuracy)", "Synonym matching"] },
  { num: 7, name: "Active Listening", icon: Headphones, color: "text-amber-500", bg: "bg-amber-500/10", rules: ["3 English accents", "Count word occurrences"] },
  { num: 8, name: "Paragraph Analysis", icon: BarChart3, color: "text-emerald-500", bg: "bg-emerald-500/10", rules: ["200+ word text", "Count all forms"] },
  { num: 9, name: "Creative Writing", icon: Zap, color: "text-teal-500", bg: "bg-teal-500/10", rules: ["Use word 3+ times", "AI grammar check"] },
  { num: 10, name: "Spoken Mastery", icon: Volume2, color: "text-primary", bg: "bg-primary/10", rules: ["1 Minute speech", "Use word 3+ times"] },
];

export default function HowItWorksModal() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 gap-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline font-bold text-[10px] uppercase tracking-widest">Marking Guide</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-primary/10 bg-background/95 backdrop-blur-xl">
        <DialogHeader className="px-8 py-6 border-b border-primary/10 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16" />
          <div className="flex items-center gap-3 mb-2 relative z-10">
             <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ScrollText className="w-4 h-4 text-primary" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Mastery Blueprint</span>
          </div>
          <DialogTitle className="text-3xl font-black tracking-tight leading-none bg-linear-to-br from-foreground to-foreground/60 bg-clip-text text-transparent relative z-10">
            Instructions & Marking
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          <div className="space-y-12">
            
            {/* Rules */}
            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShieldCheck className="w-16 h-16 text-emerald-500" />
              </div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-3 mb-4 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
                Pass/Fail Protocol
              </h3>
              <div className="space-y-4 relative z-10">
                <p className="text-sm font-bold text-emerald-900/70 leading-relaxed">
                  Every stage is worth <span className="text-emerald-700 underline decoration-2 underline-offset-4">10 points</span>. A total of <span className="text-emerald-700 underline decoration-2 underline-offset-4">80/100 points</span> is required to achieve Word Certification.
                </p>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-emerald-500/10">
                  <Info className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p className="text-xs font-bold text-emerald-800/80">
                    If you fail, you only retake the specific stages where you scored below 8/10. Your progress is saved.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Stages Guide */}
            <section className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/70 flex items-center gap-3">
                 Sequential Stage Map
                 <div className="h-px flex-1 bg-border/30" />
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stages.map((stage, idx) => (
                  <motion.div 
                    key={stage.num}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="p-5 rounded-2xl border border-border/50 bg-background/50 hover:bg-muted/30 transition-all group relative overflow-hidden"
                  >
                    <div className={cn("absolute top-0 right-0 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity rounded-full -mr-12 -mt-12", stage.bg)} />
                    
                    <div className="flex items-center gap-3 mb-3">
                       <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm", stage.bg)}>
                          <stage.icon className={cn("w-5 h-5", stage.color)} />
                       </div>
                       <div>
                          <span className={cn("text-[9px] font-black uppercase tracking-widest", stage.color)}>Stage {stage.num}</span>
                          <h4 className="text-sm font-black tracking-tight">{stage.name}</h4>
                       </div>
                    </div>
                    <ul className="space-y-2">
                      {stage.rules.map((rule, i) => (
                        <li key={i} className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground/80">
                          <ChevronRight className="w-3 h-3 text-primary/40" />
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* AI Evaluation */}
            <section className="p-8 rounded-3xl bg-linear-to-br from-primary/10 to-violet-500/5 border border-primary/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Sparkles className="w-20 h-20 text-primary" />
              </div>
              <h3 className="text-xl font-black tracking-tight flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-primary" />
                Advanced AI Evaluation
              </h3>
              <p className="text-sm font-bold text-foreground/70 leading-relaxed mb-6">
                In Stages 2, 9, and 10, our neural engine evaluates your submissions based on <span className="text-primary">genuine linguistic command</span>.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {[
                   { label: "Phonetic Precision", desc: "Accurate accent and rhythm" },
                   { label: "Grammar Flow", desc: "Contextual word placement" },
                   { label: "Lexical Variety", desc: "No robotic repetitions" }
                 ].map((item, i) => (
                   <div key={i} className="p-3 rounded-xl bg-white/40 border border-primary/10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{item.label}</p>
                      <p className="text-[11px] font-medium text-muted-foreground">{item.desc}</p>
                   </div>
                 ))}
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
              {/* Tips */}
              <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/70 flex items-center gap-3">
                  Pro Tips
                  <div className="h-px flex-1 bg-border/30" />
                </h3>
                <div className="space-y-3">
                  {stageTips.map((t, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-2xl hover:bg-muted/50 transition-colors">
                       <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                       </div>
                       <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                          <span className="text-amber-600 font-black">S{t.stage}:</span> {t.tip}
                       </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Mistakes */}
              <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-destructive/70 flex items-center gap-3">
                  Common Pitfalls
                  <div className="h-px flex-1 bg-destructive/10" />
                </h3>
                <div className="space-y-3">
                  {commonMistakes.map((m, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-2xl hover:bg-destructive/5 transition-colors">
                       <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                          <AlertCircle className="w-4 h-4 text-destructive" />
                       </div>
                       <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                          <span className="text-destructive font-black">S{m.stage}:</span> {m.mistake}
                       </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
