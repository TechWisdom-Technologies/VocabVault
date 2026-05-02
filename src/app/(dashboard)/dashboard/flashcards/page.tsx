"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, ArrowRight, RotateCcw, Volume2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FlashcardWord {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  synonyms: any[];
  pronunciationAudioUrl?: string;
  audioClipUrls?: any[];
  completedAt: string;
}

export default function FlashcardsPage() {
  const { user, getAuthHeaders } = useAuthStore();
  const [words, setWords] = useState<FlashcardWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompletedWords = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/user/progress", { headers });
        if (res.ok) {
          const data = await res.json();
          // Filter only completed words and map to flashcard data format
          // Wait, /api/user/progress does not return definition. Let's create an endpoint or fetch definitions.
          // Actually, let me just fetch all the user's completed words from a new endpoint: `/api/words/mastered`.
          const wordsRes = await fetch("/api/words/mastered", { headers });
          if (wordsRes.ok) {
            const wordsData = await wordsRes.json();
            setWords(wordsData.words);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchCompletedWords();
  }, [user, getAuthHeaders]);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + words.length) % words.length);
    }, 150);
  };

  const playAudio = (word: FlashcardWord) => {
    // Collect all potential URLs
    const urls = [
      word.pronunciationAudioUrl,
      ...(word.audioClipUrls?.map(clip => clip.url) || [])
    ].filter(url => url && url.trim() !== "");

    if (urls.length === 0) return;

    // Try playing each URL until one works
    const tryPlay = (index: number) => {
      if (index >= urls.length) {
        console.warn("All audio sources failed for word:", word.word);
        return;
      }

      const audio = new Audio(urls[index]);
      audio.play().catch(() => {
        console.warn(`Audio source ${index} failed, trying next...`);
        tryPlay(index + 1);
      });
    };

    tryPlay(0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentWord = words[currentIndex];
  const hasAudio = currentWord?.pronunciationAudioUrl || (currentWord?.audioClipUrls && currentWord.audioClipUrls.length > 0);

  return (
    <div className="min-h-screen bg-linear-to-b from-muted/20 to-background pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <Link href="/dashboard" className="group text-sm text-muted-foreground hover:text-primary mb-2 inline-flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
            </Link>
            <h1 className="text-4xl font-black text-foreground tracking-tight text-gradient">Flashcard Mastery</h1>
            <p className="text-muted-foreground font-medium">Reviewing {words.length} mastered words from your vault.</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Progress</div>
            <div className="flex items-center gap-3">
              <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary" 
                  initial={{ width: 0 }}
                  animate={{ width: `${words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0}%` }}
                />
              </div>
              <span className="text-sm font-bold min-w-[45px]">{currentIndex + 1} / {words.length}</span>
            </div>
          </div>
        </div>

        {words.length === 0 ? (
          <Card className="border-border/50 text-center py-20 bg-muted/10">
            <CardContent>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <RotateCcw className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Your vault is empty</h3>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Master some words in the learning path to unlock your personal flashcard deck.</p>
              <Link href="/dashboard">
                <Button className="rounded-2xl px-8 py-6 text-lg shadow-lg shadow-primary/20">Start Learning</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center">
            {/* Card Container with Stack Effect */}
            <div className="relative w-full max-w-lg perspective-2000 py-10">
              {/* Decoration Cards (Stack effect) */}
              <div className="absolute top-12 left-4 right-4 h-80 sm:h-96 rounded-[2.5rem] bg-muted/40 border border-border/50 translate-y-4 scale-95 -z-10" />
              <div className="absolute top-12 left-8 right-8 h-80 sm:h-96 rounded-[2.5rem] bg-muted/20 border border-border/50 translate-y-8 scale-90 -z-20" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 100, rotateZ: 5 }}
                  animate={{ opacity: 1, x: 0, rotateZ: 0 }}
                  exit={{ opacity: 0, x: -100, rotateZ: -5 }}
                  transition={{ type: "spring", damping: 20, stiffness: 100 }}
                  className="relative w-full h-80 sm:h-96 cursor-pointer"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <motion.div
                    className="w-full h-full relative preserve-3d"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                  >
                    {/* Front side (Word) */}
                    <Card className="absolute w-full h-full backface-hidden border-primary/20 shadow-2xl bg-card rounded-[2.5rem] flex flex-col items-center justify-center p-8 overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-primary to-indigo-600" />
                      <div className="absolute top-8 right-8">
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 px-3 py-1 text-[10px] uppercase font-black tracking-widest">
                          Word {currentIndex + 1}
                        </Badge>
                      </div>
                      
                      <motion.h2 
                        className="text-5xl sm:text-6xl font-black tracking-tighter text-gradient capitalize mb-4 text-center"
                        animate={{ scale: isFlipped ? 0.8 : 1 }}
                      >
                        {currentWord.word}
                      </motion.h2>
                      <div className="flex items-center gap-2 mb-6">
                        <span className="text-lg text-muted-foreground font-medium">{currentWord.phonetic}</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span className="text-sm font-black text-primary uppercase tracking-widest">{currentWord.partOfSpeech}</span>
                      </div>
                      
                      {hasAudio && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-14 h-14 rounded-full bg-primary/5 text-primary hover:bg-primary/10 transition-all border border-primary/10 group/audio"
                          onClick={(e) => {
                            e.stopPropagation();
                            playAudio(currentWord);
                          }}
                        >
                          <Volume2 className="w-7 h-7 group-hover/audio:scale-110 transition-transform" />
                        </Button>
                      )}
                      
                      <div className="absolute bottom-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                        Tap to reveal definition
                      </div>
                    </Card>

                    {/* Back side (Definition) */}
                    <Card 
                      className="absolute w-full h-full backface-hidden border-primary/20 shadow-2xl bg-card rounded-[2.5rem] flex flex-col p-8 sm:p-12" 
                      style={{ transform: "rotateY(180deg)" }}
                    >
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-foreground capitalize tracking-tight">{words[currentIndex].word}</h3>
                        <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest">{words[currentIndex].partOfSpeech}</Badge>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        <p className="text-lg sm:text-xl text-foreground/80 leading-relaxed font-medium">
                          {words[currentIndex].definition}
                        </p>
                        
                        {words[currentIndex].synonyms && words[currentIndex].synonyms.length > 0 && (
                          <div className="mt-8 pt-6 border-t border-border/50">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Synonyms</p>
                            <div className="flex flex-wrap gap-2">
                              {words[currentIndex].synonyms.slice(0, 4).map((syn: any, idx: number) => (
                                <span key={idx} className="px-3 py-1.5 bg-muted/40 rounded-xl text-xs font-bold text-foreground">
                                  {syn.word}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                        Tap to flip back
                      </div>
                    </Card>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Premium Controls */}
            <div className="flex items-center gap-10 mt-12 bg-card/50 backdrop-blur-md p-4 rounded-[2rem] border border-border/50 shadow-xl">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handlePrev} 
                className="w-14 h-14 rounded-2xl bg-background border border-border/50 hover:bg-primary/5 hover:text-primary transition-all shadow-sm"
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
              
              <div className="flex flex-col items-center">
                <div className="text-xl font-black tracking-tighter">{currentIndex + 1}</div>
                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">of {words.length}</div>
              </div>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleNext} 
                className="w-14 h-14 rounded-2xl bg-background border border-border/50 hover:bg-primary/5 hover:text-primary transition-all shadow-sm"
              >
                <ArrowRight className="w-6 h-6" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
