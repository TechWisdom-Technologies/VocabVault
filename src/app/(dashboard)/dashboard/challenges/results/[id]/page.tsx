"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

import { Card, CardContent } from "@/components/ui/card";
import { Trophy, ArrowRight, Loader2, Star, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ChallengeResultsPage() {
  const params = useParams();
  const { user, getAuthHeaders } = useAuthStore();
  const [challenge, setChallenge] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`/api/challenges/${params.id}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setChallenge(data.challenge);
        }
      } catch (err) {
        console.error("Failed to load challenge results", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (params.id) fetchChallenge();
  }, [params.id, getAuthHeaders]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-2xl font-bold mb-4">Challenge not found</h1>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const isWinner = challenge.challengedScore >= (challenge.challengerScore || 0);

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Trophy className={`w-10 h-10 ${isWinner ? 'text-yellow-500' : 'text-muted-foreground'}`} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Challenge Complete!</h1>
          <p className="text-muted-foreground italic capitalize">"{challenge.word.word}"</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Challenger Card */}
          <Card className="border-border/50 relative overflow-hidden">
            <div className="p-4 bg-muted/30 border-b border-border/50 text-center font-bold text-sm uppercase tracking-wider">
              Challenger
            </div>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                <span className="text-xl font-bold">{challenge.challenger.name[0].toUpperCase()}</span>
              </div>
              <p className="font-bold text-lg">{challenge.challenger.name}</p>
              <div className="mt-4 flex flex-col items-center">
                <span className="text-4xl font-bold text-primary">{challenge.challengerScore || 0}</span>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Total Score</span>
              </div>
            </CardContent>
          </Card>

          {/* Challenged Card (You) */}
          <Card className={`border-2 relative overflow-hidden ${isWinner ? 'border-primary' : 'border-border/50'}`}>
            <div className={`p-4 border-b text-center font-bold text-sm uppercase tracking-wider ${isWinner ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-muted/30 border-border/50'}`}>
              You
            </div>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                <span className="text-xl font-bold text-primary">{user?.name[0].toUpperCase()}</span>
              </div>
              <p className="font-bold text-lg">{user?.name}</p>
              <div className="mt-4 flex flex-col items-center">
                <span className="text-4xl font-bold text-primary">{challenge.challengedScore}</span>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Total Score</span>
              </div>
            </CardContent>
            {isWinner && (
              <div className="absolute -top-1 -right-1">
                <Star className="w-12 h-12 text-yellow-500 fill-yellow-500/20" />
              </div>
            )}
          </Card>
        </div>

        <div className="bg-background rounded-2xl p-8 border border-border/50 text-center shadow-sm">
          <h2 className="text-xl font-bold mb-4">
            {isWinner ? "🏆 You Won!" : "👏 Great Effort!"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {isWinner 
              ? `You beat ${challenge.challenger.name}'s score! Your mastery of "${challenge.word.word}" is superior.`
              : `${challenge.challenger.name} had a higher score this time. Keep practicing to improve your recall!`}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button className="w-full sm:w-auto px-10">Done</Button>
            </Link>
            <Link href="/dashboard/leaderboard">
              <Button variant="outline" className="w-full sm:w-auto px-10">View Leaderboard</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
