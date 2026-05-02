"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, Mic, Brain, Target, Eye, PenTool, Headphones, BarChart3, Volume2 
} from "lucide-react";

interface HowItWorksSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const stages = [
  { num: 1, name: "Word Briefing", desc: "First exposure with audio and phonetics. Sets the foundation.", icon: BookOpen },
  { num: 2, name: "Sentence Immersion", desc: "Read aloud 6 sentences in different tenses. Evaluated by AI.", icon: Mic },
  { num: 3, name: "Synonym & Antonym Map", desc: "Learn 3 synonyms and 3 antonyms with context.", icon: Brain },
  { num: 4, name: "Active Recall Test I", desc: "10-question mixed quiz on definitions, synonyms, and antonyms.", icon: Target },
  { num: 5, name: "Article Deep Read", desc: "Read 3 short articles containing the word in authentic context.", icon: Eye },
  { num: 6, name: "Active Recall Test II", desc: "Spelling and matching exercises from memory.", icon: PenTool },
  { num: 7, name: "Active Listening", desc: "Listen to the word in 3 different English accents (US, UK, AU).", icon: Headphones },
  { num: 8, name: "Paragraph Analysis", desc: "Find and count forms of the word in a 200+ word paragraph.", icon: BarChart3 },
  { num: 9, name: "Free Writing", desc: "Write an original paragraph using the word correctly. Evaluated by AI.", icon: PenTool },
  { num: 10, name: "Spoken Performance", desc: "Speak freely about a topic using the word fluently. Evaluated by AI.", icon: Volume2 },
];

export default function HowItWorksSheet({ open, onOpenChange }: HowItWorksSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md border-l-border/50 p-0 flex flex-col">
        <div className="p-6 pb-4 border-b border-border/50">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold text-gradient">How VocabVault Works</SheetTitle>
            <SheetDescription>
              The 10-stage cognitive acquisition cycle.
            </SheetDescription>
          </SheetHeader>
        </div>
        
        <ScrollArea className="flex-1 p-6 pt-2">
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              VocabVault is designed to move vocabulary from passive recognition to active spoken command. 
              You must complete all 10 stages sequentially. You need 80/100 points to pass a word.
            </p>

            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border before:to-transparent">
              {stages.map((stage) => (
                <div key={stage.num} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary/10 text-primary z-10 shrink-0">
                    <stage.icon className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border/50 bg-card shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-primary">Stage {stage.num}</span>
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{stage.name}</h4>
                    <p className="text-xs text-muted-foreground">{stage.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 mt-6">
              <h4 className="font-semibold text-sm mb-2 text-primary">Strict Protocols</h4>
              <ul className="text-xs space-y-2 text-muted-foreground">
                <li>• 5 words maximum per day</li>
                <li>• 2 active devices allowed simultaneously</li>
                <li>• Stage failure requires retrying the specific stage</li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
