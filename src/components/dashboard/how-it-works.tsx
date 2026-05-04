"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Mic, 
  Brain, 
  Target, 
  Eye, 
  PenTool, 
  Headphones, 
  BarChart3, 
  Volume2,
  Sparkles,
  Zap,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Flame
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HowItWorksSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const stages = [
  { num: 1, name: "Word Briefing", desc: "First exposure with studio-grade audio and phonetics. Sets the foundation for mastery.", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
  { num: 2, name: "Sentence Immersion", desc: "Read aloud 6 sentences in different tenses. Real-time AI phonetic evaluation.", icon: Mic, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { num: 3, name: "Synonym & Antonym Map", desc: "Build a cognitive map with 3 synonyms and 3 antonyms in rich context.", icon: Brain, color: "text-violet-500", bg: "bg-violet-500/10" },
  { num: 4, name: "Active Recall I", desc: "A high-intensity mixed quiz targeting definitions, synonyms, and antonyms.", icon: Target, color: "text-fuchsia-500", bg: "bg-fuchsia-500/10" },
  { num: 5, name: "Article Deep Read", desc: "Analyze 3 short articles containing the word in authentic, real-world context.", icon: Eye, color: "text-rose-500", bg: "bg-rose-500/10" },
  { num: 6, name: "Active Recall II", desc: "Memory-based spelling and matching exercises to cement orthographic knowledge.", icon: PenTool, color: "text-orange-500", bg: "bg-orange-500/10" },
  { num: 7, name: "Active Listening", desc: "Listen to the word in 3 native English accents (US, UK, AU) for dialectal mastery.", icon: Headphones, color: "text-amber-500", bg: "bg-amber-500/10" },
  { num: 8, name: "Paragraph Analysis", desc: "Detect and count various word forms in a complex 200+ word technical paragraph.", icon: BarChart3, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { num: 9, name: "Creative Writing", desc: "Compose an original paragraph using the word correctly. Evaluated by Advanced AI.", icon: Zap, color: "text-teal-500", bg: "bg-teal-500/10" },
  { num: 10, name: "Spoken Mastery", desc: "Deliver a spoken performance on a generated topic. Final AI fluency certification.", icon: Volume2, color: "text-primary", bg: "bg-primary/10" },
];

const protocols = [
  { icon: Flame, title: "Velocity Control", desc: "Maximum 5 words per day to ensure deep retention." },
  { icon: Smartphone, title: "Device Integrity", desc: "Access limited to 2 active devices per protocol." },
  { icon: ShieldCheck, title: "Mastery Gate", desc: "80/100 points required to achieve Word Certification." },
];

export default function HowItWorksSheet({ open, onOpenChange }: HowItWorksSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg border-l-primary/10 p-0 flex flex-col h-full bg-background/95 backdrop-blur-xl focus:outline-none">
        <div className="p-8 pb-6 border-b border-primary/10 relative overflow-hidden shrink-0">
          {/* Background Aesthetic */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16" />
          
          <SheetHeader className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Learning Protocol</span>
            </div>
            <SheetTitle className="text-3xl font-black tracking-tight leading-none bg-linear-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
              How VocabVault Works
            </SheetTitle>
            <SheetDescription className="text-sm font-medium text-muted-foreground mt-2">
              The 10-stage cognitive acquisition cycle designed for total spoken mastery.
            </SheetDescription>
          </SheetHeader>
        </div>
        
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          <div className="space-y-10">
            <div className="p-5 rounded-2xl bg-muted/30 border border-border/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Brain className="w-12 h-12" />
              </div>
              <p className="text-sm text-foreground/70 leading-relaxed font-medium relative z-10">
                VocabVault moves words from <span className="text-primary font-bold italic">passive recognition</span> to <span className="text-primary font-bold italic">active spoken command</span>. Each stage is mathematically weighted to build progressive neural pathways.
              </p>
            </div>

            <div className="space-y-6 relative">
              {/* Timeline Connector Line */}
              <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-linear-to-b from-primary/30 via-primary/5 to-transparent" />

              <div className="space-y-6">
                {stages.map((stage, idx) => (
                  <motion.div 
                    key={stage.num}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative pl-12 group"
                  >
                    {/* Stage Indicator Dot */}
                    <div className={cn(
                      "absolute left-0 top-0 w-10 h-10 rounded-xl flex items-center justify-center z-10 shadow-lg shadow-primary/5 transition-transform group-hover:scale-110",
                      stage.bg
                    )}>
                      <stage.icon className={cn("w-5 h-5", stage.color)} />
                    </div>

                    <div className="p-4 rounded-2xl border border-border/50 bg-background/50 hover:bg-muted/30 transition-colors cursor-default">
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn("text-[10px] font-black uppercase tracking-widest", stage.color)}>
                          Stage {stage.num}
                        </span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground/30 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h4 className="text-base font-black tracking-tight mb-1">{stage.name}</h4>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed">{stage.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="pt-4 space-y-4 pb-10">
               <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/70 flex items-center gap-3">
                  System Protocols
                  <div className="h-px flex-1 bg-border/30" />
               </h3>
               
               <div className="grid grid-cols-1 gap-3">
                  {protocols.map((p, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + (idx * 0.1) }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 group hover:bg-primary/10 transition-all"
                    >
                       <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shadow-sm group-hover:rotate-12 transition-transform">
                          <p.icon className="w-5 h-5 text-primary" />
                       </div>
                       <div>
                          <h5 className="text-xs font-black uppercase tracking-widest text-foreground">{p.title}</h5>
                          <p className="text-[11px] text-muted-foreground font-medium">{p.desc}</p>
                       </div>
                    </motion.div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
