"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { X, Loader2, Brain } from "lucide-react";
import Stage1Briefing from "@/components/stages/stage-1-briefing";
import Stage2Immersion from "@/components/stages/stage-2-immersion";
import Stage3Map from "@/components/stages/stage-3-map";
import Stage4Recall1 from "@/components/stages/stage-4-recall-1";
import Stage5Article from "@/components/stages/stage-5-article";
import Stage6Recall2 from "@/components/stages/stage-6-recall-2";
import Stage7Listening from "@/components/stages/stage-7-listening";
import Stage8Paragraph from "@/components/stages/stage-8-paragraph";
import Stage9Writing from "@/components/stages/stage-9-writing";
import Stage10Speaking from "@/components/stages/stage-10-speaking";
import { FeedbackModal } from "@/components/dashboard/feedback-modal";
import HowItWorksModal from "@/components/stages/how-it-works-modal";
import LoadingScreen from "@/components/ui/loading-screen";

const STAGE_NAMES: Record<number, string> = {
  1: "Word Briefing",
  2: "Sentence Immersion",
  3: "Contextual Map",
  4: "Active Recall I",
  5: "Article Study",
  6: "Active Recall II",
  7: "Listening Drill",
  8: "Paragraph Construction",
  9: "Writing Workshop",
  10: "Speaking Practice",
};

const WORD_STAGE_CACHE_TTL_MS = 5 * 60 * 1000;

type StageWordData = Record<string, unknown> & {
  word?: string;
};

type StageProgressData = Record<string, unknown> & {
  currentStage?: number;
  status?: string;
};

type WordStageCacheEntry = {
  word: StageWordData;
  progress: StageProgressData;
  fetchedAt: number;
};

const wordStageCache = new Map<string, WordStageCacheEntry>();

function getCachedWordStage(wordId: string): WordStageCacheEntry | null {
  const cached = wordStageCache.get(wordId);
  if (!cached) return null;
  if (Date.now() - cached.fetchedAt > WORD_STAGE_CACHE_TTL_MS) {
    wordStageCache.delete(wordId);
    return null;
  }
  return cached;
}

function setCachedWordStage(wordId: string, word: StageWordData, progress: StageProgressData) {
  wordStageCache.set(wordId, {
    word,
    progress,
    fetchedAt: Date.now(),
  });
}

export default function StagePage() {
  const params = useParams();
  const router = useRouter();
  const { getAuthHeaders } = useAuthStore();

  const wordId = params.wordId as string;
  const stageNum = parseInt(params.stageNum as string, 10);
  const searchParams = useSearchParams();
  const challengeId = searchParams.get("challengeId");

  const [wordData, setWordData] = useState<StageWordData | null>(null);
  const [progress, setProgress] = useState<StageProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdvancing, setIsAdvancing] = useState(false);

  useEffect(() => {
    const fetchWord = async () => {
      const cached = getCachedWordStage(wordId);
      if (cached) {
        setWordData(cached.word);
        setProgress(cached.progress);
        setIsLoading(false);
      }

      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`/api/words/${wordId}`, { headers });

        if (!res.ok) {
          router.replace("/dashboard");
          return;
        }

        const data = await res.json();

        // 1. Curriculum Sequence Check (Word-level)
        if (res.status === 403) {
          router.replace("/dashboard");
          return;
        }

        // 2. Intra-Word Sequence Check (Stage-level)
        // A user cannot skip ahead to a stage they haven't reached yet
        if (data.progress.currentStage < stageNum && data.progress.status !== "COMPLETED") {
          router.replace(`/stage/${wordId}/${data.progress.currentStage}`);
          return;
        }

        setWordData(data.word);
        setProgress(data.progress);
        setCachedWordStage(wordId, data.word, data.progress);
      } catch (error) {
        console.error("Failed to load word data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (wordId && stageNum) {
      fetchWord();
    }
  }, [wordId, stageNum, getAuthHeaders, router]);

  useEffect(() => {
    if (!wordData) return;
    const challengeQuery = challengeId ? `?challengeId=${challengeId}` : "";

    if (stageNum < 10) {
      router.prefetch(`/stage/${wordId}/${stageNum + 1}${challengeQuery}`);
    }

    router.prefetch(`/stage/${wordId}/summary${challengeQuery}`);
    router.prefetch("/dashboard");
  }, [wordData, stageNum, router, wordId, challengeId]);

  const handleStageComplete = async (score: number, mistakes: unknown[] = [], timeSpent: number = 0) => {
    try {
      setIsAdvancing(true);
      const headers = await getAuthHeaders();
      const res = await fetch("/api/progress/stage", {
        method: "POST",
        headers,
        body: JSON.stringify({
          wordId,
          stageNumber: stageNum,
          score,
          timeSpentSeconds: timeSpent,
          mistakes,
          challengeId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const challengeQuery = challengeId ? `?challengeId=${challengeId}` : "";

        if (data.status === "COMPLETED") {
          if (wordData && progress) {
            setCachedWordStage(wordId, wordData, {
              ...progress,
              status: "COMPLETED",
              currentStage: 10,
            });
          }
          if (challengeId) {
            const resultPath = `/dashboard/challenges/results/${challengeId}`;
            router.prefetch(resultPath);
            router.push(resultPath);
          } else {
            router.prefetch("/dashboard");
            router.push("/dashboard");
          }
        } else if (data.status === "RETRY" && data.nextStage === "summary") {
          const nextPath = `/stage/${wordId}/summary${challengeQuery}`;
          router.prefetch(nextPath);
          router.push(nextPath);
        } else {
          // IN_PROGRESS -> just advance
          if (wordData && progress) {
            setCachedWordStage(wordId, wordData, {
              ...progress,
              status: "IN_PROGRESS",
              currentStage: data.nextStage,
            });
          }
          const nextPath = `/stage/${wordId}/${data.nextStage}${challengeQuery}`;
          router.prefetch(nextPath);
          router.push(nextPath);
        }
      } else {
        setIsAdvancing(false);
        alert("Failed to save progress. Please try again.");
        window.location.reload();
      }
    } catch (error) {
      setIsAdvancing(false);
      console.error("Failed to submit stage:", error);
    }
  };

  if (isLoading || !wordData) {
    return (
      <LoadingScreen 
        message={`Entering ${STAGE_NAMES[stageNum] || "Task Phase"}`}
        submessage={`Preparing your session for "${wordId.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}"...`}
      />
    );
  }

  const renderStage = () => {
    const props = { word: wordData, onComplete: handleStageComplete };
    switch (stageNum) {
      case 1: return <Stage1Briefing {...props} />;
      case 2: return <Stage2Immersion {...props} />;
      case 3: return <Stage3Map {...props} />;
      case 4: return <Stage4Recall1 {...props} />;
      case 5: return <Stage5Article {...props} />;
      case 6: return <Stage6Recall2 {...props} />;
      case 7: return <Stage7Listening {...props} />;
      case 8: return <Stage8Paragraph {...props} />;
      case 9: return <Stage9Writing {...props} />;
      case 10: return <Stage10Speaking {...props} />;
      default: return <div>Invalid Stage</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative z-50">
      {/* Global Fixed Pro Header */}
      <header className="fixed top-0 left-0 w-full h-16 border-b border-white/5 bg-[#0a0a0b] flex items-center justify-between px-6 z-[100] shadow-2xl">
        <div className="flex items-center gap-6 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
            disabled={isAdvancing}
            className="h-10 w-10 rounded-xl text-white/20 hover:text-white/80 hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-4">
            <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <Brain className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 block leading-none mb-1">
                Stage {stageNum.toString().padStart(2, '0')}
              </span>
              <span className="text-xs font-bold text-white/80 block leading-none capitalize">
                {STAGE_NAMES[stageNum] || "Task Phase"}
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress Track */}
        <div className="hidden lg:flex flex-col items-center gap-1.5 flex-1 max-w-sm">
          <div className="flex justify-between w-full px-1">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Mastery Progress</span>
            <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest">{stageNum}/10</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-linear-to-r from-violet-600 to-indigo-600 transition-all duration-700 shadow-[0_0_10px_rgba(139,92,246,0.3)]"
              style={{ width: `${(stageNum / 10) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 flex justify-end items-center gap-4">
          <div className="flex items-center gap-2 mr-2">
            <HowItWorksModal />
            <FeedbackModal wordId={wordId} stageNumber={stageNum} />
          </div>

          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-black text-white/80 uppercase tracking-tighter capitalize">{wordData.word}</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">Session Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderStage()}
      </main>

      {isAdvancing && (
        <div className="fixed inset-0 z-[1000] bg-background/40 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
            <div className="relative rounded-3xl border border-white/10 bg-card/50 backdrop-blur-xl px-8 py-6 shadow-2xl flex flex-col items-center gap-4 min-w-[200px]">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-xl bg-primary/20 animate-spin [animation-duration:3s]" />
                <div className="absolute inset-2 rounded-lg bg-primary animate-pulse" />
                <Loader2 className="absolute inset-0 w-12 h-12 text-primary animate-spin" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-bold text-foreground tracking-tight">Syncing Progress</span>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Please wait...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
