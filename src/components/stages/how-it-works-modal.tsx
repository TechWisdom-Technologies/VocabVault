"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, ScrollText, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const stageTips = [
  "Stage 1: Press the pronunciation audio three times before you try to leave.",
  "Stage 2: Read naturally and avoid rushing the microphone; the AI rewards fluent delivery.",
  "Stage 5: Read actively instead of skimming so the word stays anchored in context.",
  "Stage 9: Vary sentence structure and placement; robotic repetition is penalized.",
  "Stage 10: Speak naturally about a real topic, then weave the target word in three times.",
];

const commonMistakes = [
  "Stage 1: Leaving before the 45-second timer completes or skipping the pronunciation loop.",
  "Stage 4: Answering the quiz from memory of only one earlier stage instead of the full word flow.",
  "Stage 6: Repeating the same spelling pattern without completing the matching phase.",
  "Stage 7: Entering guesses before listening to each clip fully.",
  "Stage 8: Counting only the exact word and forgetting synonyms or antonyms in different forms.",
];

export default function HowItWorksModal() {
  return (
    <Dialog>
      <DialogTrigger
        className="group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5 text-muted-foreground"
      >
        <HelpCircle className="w-5 h-5 mr-1" />
        <span className="hidden sm:inline">How it works</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border/50 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ScrollText className="w-5 h-5 text-primary" />
            Stage Instructions & Marking Guide
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-8 pb-6">
            
            {/* Rules */}
            <section>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-success" />
                Pass/Fail Rules
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                Every stage is worth 10 points (total 100 per word). You need <strong>80 points or above</strong> to pass the word.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If you score below 80, you will only be sent back to retake the specific stages where you scored below 8/10. You do not have to repeat the entire word cycle.
              </p>
            </section>

            {/* Stages Guide */}
            <section>
              <h3 className="text-lg font-semibold mb-4">Stage-by-Stage Guide</h3>
              <div className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                  <h4 className="font-semibold text-sm mb-1">Stage 1: Word Briefing</h4>
                  <p className="text-xs text-muted-foreground mb-2">Read the definition and phonetic spelling.</p>
                  <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                    <li>Must press audio at least 3 times.</li>
                    <li>Must stay for the full 45 seconds.</li>
                  </ul>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                  <h4 className="font-semibold text-sm mb-1">Stage 2: Sentence Immersion</h4>
                  <p className="text-xs text-muted-foreground mb-2">Speak 6 sentences in different tenses.</p>
                  <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                    <li>Hold the mic button and read the sentence naturally.</li>
                    <li>AI evaluates pronunciation, fluency, and delivery.</li>
                  </ul>
                </div>

                <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                  <h4 className="font-semibold text-sm mb-1">Stage 3: Synonym & Antonym Map</h4>
                  <p className="text-xs text-muted-foreground mb-2">Absorb related words and opposites.</p>
                  <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                    <li>No quiz yet. Just read carefully for 60 seconds.</li>
                    <li>You will be tested on these in Stage 6.</li>
                  </ul>
                </div>

                <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                  <h4 className="font-semibold text-sm mb-1">Stage 4: Active Recall Test I</h4>
                  <p className="text-xs text-muted-foreground mb-2">Mixed quiz (Fill-in-blank, MCQ, True/False).</p>
                  <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                    <li>Answer 10 questions to test what you&rsquo;ve learned so far.</li>
                    <li>Points scale with correct answers.</li>
                  </ul>
                </div>

                <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                  <h4 className="font-semibold text-sm mb-1">Stage 5: Article Deep Read</h4>
                  <p className="text-xs text-muted-foreground mb-2">Read the word in authentic context.</p>
                  <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                    <li>Read all three short articles carefully.</li>
                    <li>Must stay for the full 5 minutes (300s). No skipping.</li>
                  </ul>
                </div>

                <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                  <h4 className="font-semibold text-sm mb-1">Stage 6: Active Recall Test II</h4>
                  <p className="text-xs text-muted-foreground mb-2">Spelling and Matching.</p>
                  <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                    <li>Type the word 3 times accurately from memory.</li>
                    <li>Match synonyms and antonyms from Stage 3.</li>
                  </ul>
                </div>

                <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                  <h4 className="font-semibold text-sm mb-1">Stage 7: Active Listening</h4>
                  <p className="text-xs text-muted-foreground mb-2">Listen to 3 English accents.</p>
                  <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                    <li>Count exactly how many times the target word is spoken in each clip.</li>
                  </ul>
                </div>

                <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                  <h4 className="font-semibold text-sm mb-1">Stage 8: Paragraph Analysis</h4>
                  <p className="text-xs text-muted-foreground mb-2">Read a 200+ word text.</p>
                  <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                    <li>Count the exact occurrences of the target word, its synonyms, and antonyms.</li>
                  </ul>
                </div>

                <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                  <h4 className="font-semibold text-sm mb-1">Stage 9: Free Writing</h4>
                  <p className="text-xs text-muted-foreground mb-2">Write an original paragraph.</p>
                  <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                    <li>Use the target word at least 3 times.</li>
                    <li>AI checks for grammar, context, and variety. Robotic repetition is penalized.</li>
                  </ul>
                </div>

                <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                  <h4 className="font-semibold text-sm mb-1">Stage 10: Spoken Performance</h4>
                  <p className="text-xs text-muted-foreground mb-2">Speak freely for 1 minute.</p>
                  <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                    <li>Use the word at least 3 times in natural speech.</li>
                    <li>AI evaluates your overall fluency and correct contextual usage.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* AI Evaluation Guide */}
            <section>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                AI Evaluation Guide
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                In Stages 2, 9, and 10, our AI evaluates your submissions based on genuine command of the word.
                It looks for accurate pronunciation, proper grammatical context, and natural fluency.
                Do not try to trick the system with robotic, identical sentences—use the word organically to earn top marks.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Tips Per Stage
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                {stageTips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Common Mistakes
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                {commonMistakes.map((mistake) => (
                  <li key={mistake}>{mistake}</li>
                ))}
              </ul>
            </section>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
