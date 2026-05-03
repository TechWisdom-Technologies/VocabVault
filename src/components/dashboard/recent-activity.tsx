"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import Link from "next/link";

interface ActivityItem {
  id: string;
  type: string;
  wordId: string;
  word: string;
  stageIndex: number;
  score: number;
  timestamp: string;
}

interface RecentActivityProps {
  initialActivities?: ActivityItem[];
}

export default function RecentActivity({ initialActivities }: RecentActivityProps) {
  const { getAuthHeaders } = useAuthStore();
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities || []);
  const [isLoading, setIsLoading] = useState(!initialActivities);

  useEffect(() => {
    if (initialActivities) {
      setActivities(initialActivities);
      setIsLoading(false);
    }
  }, [initialActivities]);

  useEffect(() => {
    if (initialActivities) return;

    const fetchActivity = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/user/activity", { headers });
        if (res.ok) {
          const data = await res.json();
          setActivities(data.activities);
        }
      } catch (error) {
        console.error("Failed to fetch activity", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActivity();
  }, [getAuthHeaders, initialActivities]);

  return (
    <Card className="border-border/50 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto min-h-75">
        {isLoading ? (
          <div className="flex items-center justify-center h-full p-6 text-muted-foreground">
            <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin mr-2" />
            Loading feed...
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
            <Clock className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">No recent activity.</p>
            <p className="text-xs mt-1">Start learning your first word to see updates here.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {activities.map((item) => (
              <Link 
                key={item.id} 
                href={`/stage/${item.wordId}/summary`}
                className="p-4 hover:bg-muted/30 transition-all flex items-start gap-3 group relative"
              >
                <div className={`mt-0.5 p-1.5 rounded-full ${item.score >= 80 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                  {item.score >= 80 ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                    Completed Stage {item.stageIndex} for <span className="font-bold capitalize">"{item.word}"</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center justify-between">
                    <span>Score: {item.score}/100</span>
                    <span className="opacity-75">{formatDate(item.timestamp)}</span>
                  </p>
                </div>
                <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-4 h-4 text-primary" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
