"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Lock, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Crown, 
  Eye, 
  RotateCcw, 
  Heart, 
  Sparkles, 
  BookOpen, 
  Medal, 
  Flame,
  ChevronRight,
  Clock
} from "lucide-react";
import Link from "next/link";
import LearningCalendar from "@/components/dashboard/learning-calendar";
import { useBookmarkStore } from "@/stores/bookmark-store";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Word {
  id: string;
  word: string;
  orderIndex: number;
}

interface WordProgress {
  id: string;
  wordId: string;
  status: "IN_PROGRESS" | "RETRY" | "COMPLETED" | "FAILED";
  currentStage: number;
  totalScore: number;
}

interface ActivityItem {
  id: string;
  type: string;
  word: string;
  stageIndex: number;
  score: number;
  timestamp: string;
}

export default function DashboardPage() {
  const { user, getAuthHeaders } = useAuthStore();
  const [words, setWords] = useState<Word[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, WordProgress>>({});
  const [userStats, setUserStats] = useState<any>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaywalled, setIsPaywalled] = useState(false);
  const [relearnLoading, setRelearnLoading] = useState<string | null>(null);
  const [wordOfTheDay, setWordOfTheDay] = useState<any>(null);
  const { bookmarkedWordIds, toggleBookmark } = useBookmarkStore();
  const freeLimit = 25;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = await getAuthHeaders();
        const [profileRes, wordsRes, activityRes] = await Promise.all([
          fetch("/api/user/profile", { headers }),
          fetch("/api/words/daily", { headers }),
          fetch("/api/user/activity", { headers }),
        ]);

        if (profileRes.ok) {
          setUserStats(await profileRes.json());
        }

        if (activityRes.ok) {
          const activityData = await activityRes.json();
          setActivities(activityData.activities || []);
        }

        const wordsData = await wordsRes.json();

        if (wordsRes.status === 403 && wordsData.isPaywalled) {
          setIsPaywalled(true);
        } else if (wordsRes.ok) {
          setWords(wordsData.words || []);
          setIsPaywalled(wordsData.isPaywalled || false);
          setIsPrecedingWordCompleted(wordsData.isPrecedingWordCompleted ?? true);
          const pMap: Record<string, WordProgress> = {};
          if (wordsData.progress) {
            wordsData.progress.forEach((p: WordProgress) => {
              pMap[p.wordId] = p;
            });
          }
          setProgressMap(pMap);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.onboardingComplete) {
      fetchData();
      (async () => {
        try {
          const headers = await getAuthHeaders();
          const res = await fetch("/api/words/word-of-the-day", { headers });
          if (res.ok) {
            const data = await res.json();
            setWordOfTheDay(data.word);
          }
        } catch (e) { console.error(e); }
      })();
    }
  }, [user, getAuthHeaders]);

  const [isPrecedingWordCompleted, setIsPrecedingWordCompleted] = useState(true);

  const getWordStatus = (word: Word) => {
    const progress = progressMap[word.id];
    if (progress?.status === "COMPLETED") return "COMPLETED";
    
    // Use the most up-to-date maxUnlockedIndex (prioritize userStats over auth store)
    const effectiveMaxIndex = userStats?.maxUnlockedIndex ?? user?.maxUnlockedIndex ?? 0;
    
    // Check if the word is unlocked based on curriculum index
    // Note: orderIndex starts at 1, so we unlock 1 by default
    const isUnlocked = word.orderIndex <= Math.max(1, effectiveMaxIndex);
    
    if (isUnlocked) return "ACTIVE";
    return "LOCKED";
  };

  const handleUpgrade = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers,
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Upgrade failed:", error);
    }
  };

  const handleRelearn = async (wordId: string) => {
    if (!confirm("This will reset all progress for this word. Are you sure you want to re-learn it?")) return;
    setRelearnLoading(wordId);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/progress/reset", {
        method: "POST",
        headers,
        body: JSON.stringify({ wordId }),
      });
      if (res.ok) {
        setProgressMap((prev) => {
          const updated = { ...prev };
          delete updated[wordId];
          return updated;
        });
      }
    } catch (err) {
      console.error("Re-learn failed:", err);
    } finally {
      setRelearnLoading(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  } as const;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Aesthetic */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/5 blur-[100px] rounded-full pointer-events-none" />

      <motion.div 
        className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 tracking-tight">
              Welcome back, <span className="font-black text-primary">{user?.name?.split(" ")[0] || "Learner"}</span>
              {user?.plan === "PRO" && (
                <Badge className="bg-linear-to-r from-violet-600 to-purple-600 text-white border-none shadow-sm px-3 font-bold text-[10px] uppercase tracking-wider">
                  <Crown className="w-3.5 h-3.5 mr-1" /> PRO
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground mt-1 font-bold tracking-wider text-xs uppercase opacity-70">
              Academic Mastery Protocol Active
            </p>
          </div>

          {user?.plan === "FREE" && (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/20 bg-primary/5 text-sm sm:max-w-xs group cursor-pointer hover:bg-primary/10 transition-all" onClick={handleUpgrade}>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-xs uppercase tracking-wider">Free Plan Active</p>
                <p className="text-[10px] text-muted-foreground leading-tight font-medium">Unlock full curriculum</p>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 font-bold uppercase tracking-wider">
                Upgrade
              </Button>
            </div>
          )}
        </motion.div>

        {/* Word Queue Section */}
        <motion.section variants={itemVariants} className="mb-8">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2 text-muted-foreground">
            <BookOpen className="w-4 h-4" />
            Today&apos;s Words
            <Badge variant="secondary" className="font-bold text-[9px] uppercase tracking-wider bg-primary/10 text-primary border-none">
              {words.length > 0 ? `${words.length} remaining` : "Daily Limit Reached"}
            </Badge>
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="h-32 rounded-2xl bg-muted/30 animate-pulse border border-border/50" />
              ))}
            </div>
          ) : isPaywalled ? (
            <Card className="border-primary/20 bg-background/50 backdrop-blur-md shadow-lg overflow-hidden rounded-3xl">
              <CardContent className="p-10 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-linear-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2 tracking-tight">You&apos;ve mastered 25 words!</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-8 font-bold tracking-wider text-xs uppercase opacity-70">
                  You have reached the limit of the Free Plan. Upgrade to Pro to unlock unlimited words and continue your journey.
                </p>
                <Button
                  onClick={handleUpgrade}
                  className="bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-10 h-14 font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                >
                  Upgrade to Pro <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ) : words.length === 0 ? (
            <Card className="border-border/50 bg-background/50 backdrop-blur-md rounded-2xl">
              <CardContent className="p-12 text-center">
                <h3 className="font-bold text-xl tracking-tight mb-2">All done for today!</h3>
                <p className="text-xs text-muted-foreground font-bold tracking-wider uppercase opacity-60">
                  You&apos;ve completed all available words. Come back tomorrow for more.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {words.map((word, index) => {
                const status = getWordStatus(word);
                const progress = progressMap[word.id];

                if (status === "LOCKED") {
                  return (
                    <div key={word.id} className="p-5 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-md flex flex-col justify-between h-32 relative overflow-hidden">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Word {index + 1}</span>
                        <Lock className="w-3.5 h-3.5 text-primary/30" />
                      </div>
                      <div className="text-xl font-bold text-muted-foreground/40 blur-[2px] select-none capitalize tracking-tight">
                        {word.word}
                      </div>
                    </div>
                  );
                }

                if (status === "COMPLETED") {
                  return (
                    <motion.div 
                      key={word.id} 
                      className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-between h-auto group relative overflow-hidden shadow-sm"
                      whileHover={{ y: -4 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Entry {index + 1}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleBookmark(word.id); }}
                            className="p-1 rounded-lg hover:bg-emerald-500/10 transition-colors"
                          >
                            <Heart className={cn("w-3.5 h-3.5 transition-colors", bookmarkedWordIds.includes(word.id) ? "fill-red-500 text-red-500" : "text-emerald-500/30")} />
                          </button>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                      </div>
                      <div className="text-xl font-bold text-emerald-700 capitalize mb-4 tracking-tight">
                        {word.word}
                      </div>

                      <div className="mt-auto space-y-3">
                        <div className="w-full h-1 bg-emerald-500/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress.totalScore}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/stage/${word.id}/summary`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full h-8 text-[9px] font-bold uppercase tracking-wider border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10 rounded-xl">Summary</Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-emerald-600 hover:bg-emerald-500/10 rounded-xl"
                            onClick={() => handleRelearn(word.id)}
                            disabled={relearnLoading === word.id}
                          >
                            <RotateCcw className={cn("w-3.5 h-3.5", relearnLoading === word.id && "animate-spin")} />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                }

                // ACTIVE
                const targetLink = progress?.status === "RETRY"
                  ? `/stage/${word.id}/summary`
                  : `/stage/${word.id}/${progress?.currentStage || 1}`;

                return (
                  <Link href={targetLink} key={word.id}>
                    <motion.div 
                      className="group p-6 rounded-2xl border border-primary/20 bg-background/50 backdrop-blur-md shadow-sm cursor-pointer hover:shadow-lg transition-all flex flex-col justify-between h-40 relative overflow-hidden"
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Entry {index + 1}</span>
                        {progress?.status === "RETRY" ? (
                          <Badge className="bg-amber-500/10 text-amber-600 border-none font-bold text-[9px] tracking-widest px-2 h-5">RETRY</Badge>
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                            <Play className="w-3 h-3 fill-current" />
                          </div>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-foreground capitalize group-hover:text-primary transition-colors tracking-tight">
                        {word.word}
                      </div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-auto flex items-center justify-between">
                        <span>Stage {progress?.currentStage || 1} / 10</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* Word of the Day - Compact View */}
        {wordOfTheDay && (
          <motion.section variants={itemVariants} className="mb-8">
            <Card className="border-primary/20 bg-background/50 backdrop-blur-md overflow-hidden relative rounded-3xl group shadow-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-violet-600 via-purple-500 to-indigo-600" />
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Word of the Day</span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <h3 className="text-2xl font-black text-foreground capitalize tracking-tight group-hover:text-primary transition-colors">{wordOfTheDay.word}</h3>
                      <p className="text-[10px] text-muted-foreground font-bold tracking-widest">
                        <span className="italic">{wordOfTheDay.phonetic}</span> &bull; {wordOfTheDay.partOfSpeech.toUpperCase()}
                      </p>
                    </div>
                    <p className="text-sm text-foreground/70 leading-relaxed font-bold tracking-wide mt-1 italic">
                      &quot;{wordOfTheDay.definition}&quot;
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* Badges & Rewards */}
        <motion.section variants={itemVariants} className="mb-8">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2 text-muted-foreground">
            <Medal className="w-4 h-4 text-amber-500" />
            Learning Milestones
          </h2>
          <div className="flex flex-wrap gap-3">
            {(userStats?.achievements?.length === 0 && userStats?.streakRewards?.length === 0) && (
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic p-4 border border-dashed border-border/50 rounded-2xl w-full text-center">
                Protocol Initialized
              </div>
            )}
            {userStats?.achievements?.map((ach: any) => (
              <div key={ach.id} className="px-4 py-2 rounded-full border border-amber-500/20 bg-amber-500/5 flex items-center gap-2 shadow-xs hover:scale-105 transition-transform" title={`Unlocked: ${new Date(ach.unlockedAt).toLocaleDateString()}`}>
                <Medal className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">
                  {ach.type.replace('_', ' ')}
                </span>
              </div>
            ))}
            {userStats?.streakRewards?.map((reward: any) => (
              <div key={reward.id} className="px-4 py-2 rounded-full border border-orange-500/20 bg-orange-500/5 flex items-center gap-2 shadow-xs hover:scale-105 transition-transform" title={`Claimed: ${new Date(reward.claimedAt).toLocaleDateString()}`}>
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-[10px] font-bold text-orange-700 uppercase tracking-widest">
                  {reward.milestone} Day Streak
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Bookmarked Words */}
        {bookmarkedWordIds.length > 0 && words.length > 0 && (
          <motion.section variants={itemVariants} className="mb-8">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2 text-muted-foreground">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              Bookmarked Vault
              <Badge variant="outline" className="font-bold text-[9px] bg-red-500/5 text-red-500 border-red-500/20 rounded-full px-2">
                {bookmarkedWordIds.filter((id) => words.some((w) => w.id === id)).length} ENTRIES
              </Badge>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {words
                .filter((w) => bookmarkedWordIds.includes(w.id))
                .map((word) => {
                  const progress = progressMap[word.id];
                  return (
                    <motion.div 
                      key={word.id} 
                      className="p-4 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-md flex flex-col items-center text-center gap-2 group hover:border-red-500 transition-all shadow-xs"
                      whileHover={{ y: -3 }}
                    >
                      <div className="text-sm font-bold capitalize text-foreground tracking-tight">{word.word}</div>
                      <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        {progress?.status === "COMPLETED" ? `Accuracy: ${progress.totalScore}%` : "In Progress"}
                      </div>
                      <button onClick={() => toggleBookmark(word.id)} className="mt-1 p-1 rounded-full hover:bg-red-50 transition-colors">
                        <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                      </button>
                    </motion.div>
                  );
                })}
            </div>
          </motion.section>
        )}

        {/* Stats Grid */}
        <motion.section variants={itemVariants} className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Total Points", value: userStats?.totalScore || 0, color: "text-primary" },
              { label: "Today's Score", value: userStats?.todayScore || 0, color: "text-violet-600" },
              { label: "Mastery Index", value: `${userStats?.dayAvgScore || 0}%`, color: "text-emerald-600" },
              { label: "Words Mastered", value: userStats?.wordsLearned || 0, color: "text-blue-600" },
              { label: "Active Streak", value: `${userStats?.currentStreak || 0} days`, color: "text-amber-600" },
              { label: "Record Streak", value: `${userStats?.longestStreak || 0} days`, color: "text-indigo-600" },
            ].map((stat) => (
              <div key={stat.label} className="p-5 rounded-2xl bg-background/50 backdrop-blur-md border border-border/50 shadow-xs flex flex-col justify-center group hover:shadow-sm transition-all">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2 opacity-60 truncate">{stat.label}</p>
                <p className={cn("text-2xl font-black tracking-tight", stat.color)}>{stat.value}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Learning Calendar - Smaller Container */}
        <motion.section variants={itemVariants} className="mb-8 mx-auto max-w-2xl w-full rounded-3xl border border-border/50 bg-background/50 backdrop-blur-md p-6 shadow-xs">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Engagement Rhythm
          </p>
          <div className="scale-90 origin-top">
            <LearningCalendar />
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
