"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Trophy, 
  CheckCircle2, 
  Activity 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths, isSameMonth } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function LearningCalendar() {
  const { getAuthHeaders, user } = useAuthStore();
  const [dailyData, setDailyData] = useState<Map<string, { 
    mastered: { word: string; score: number }[], 
    activity: { word: string; stage: number }[] 
  }>>(new Map());
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/user/progress", { headers });
        if (res.ok) {
          const data = await res.json();
          const map = new Map<string, { mastered: any[], activity: any[] }>();
          
          data.progress.forEach((p: any) => {
            // Process Stage Scores (Activity)
            p.stageScores.forEach((s: any) => {
              const key = format(new Date(s.createdAt), "yyyy-MM-dd");
              const existing = map.get(key) || { mastered: [], activity: [] };
              // Avoid duplicates for activity in the same day for the same word
              if (!existing.activity.some(a => a.word === p.word.word && a.stage === s.stageNumber)) {
                existing.activity.push({ word: p.word.word, stage: s.stageNumber });
                map.set(key, existing);
              }
            });

            // Process Completed (Mastery)
            if (p.status === "COMPLETED" && p.completedAt) {
              const key = format(new Date(p.completedAt), "yyyy-MM-dd");
              const existing = map.get(key) || { mastered: [], activity: [] };
              existing.mastered.push({ word: p.word.word, score: p.totalScore });
              map.set(key, existing);
            }
          });
          setDailyData(map);
        }
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    if (user) fetchActivity();
  }, [user, getAuthHeaders]);

  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-primary" />
          <CardTitle className="text-base font-bold">Learning Calendar</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
            setCalendarMonth(subMonths(calendarMonth, 1));
            setSelectedDay(null);
          }}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs font-black uppercase tracking-widest min-w-[100px] text-center">
            {format(calendarMonth, "MMM yyyy")}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              setCalendarMonth(addMonths(calendarMonth, 1));
              setSelectedDay(null);
            }}
            disabled={isSameMonth(calendarMonth, new Date())}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {daysInMonth.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const data = dailyData.get(key);
            const masteredCount = data?.mastered.length || 0;
            const activityCount = data?.activity.length || 0;
            const hasActivity = masteredCount > 0 || activityCount > 0;
            
            const isToday = day.getTime() === today.getTime();
            const isFuture = day > today;
            const isSelected = selectedDay === key;
            
            return (
              <div
                key={key}
                onClick={() => hasActivity && setSelectedDay(isSelected ? null : key)}
                className={cn(
                  "aspect-square rounded-lg border flex flex-col items-center justify-center transition-all relative overflow-hidden",
                  isFuture 
                    ? "opacity-20 border-transparent pointer-events-none" 
                    : masteredCount > 0
                      ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105 z-10 cursor-pointer"
                      : activityCount > 0
                        ? "bg-primary/20 text-primary border-primary/20 cursor-pointer hover:bg-primary/30"
                        : "bg-muted/30 border-border/50 hover:bg-muted/50 cursor-default",
                  isSelected && "ring-2 ring-primary ring-offset-2",
                  isToday && "ring-2 ring-orange-500 ring-offset-2"
                )}
                title={hasActivity ? `${masteredCount} Mastered, ${activityCount} Active` : ""}
              >
                <span className="text-[10px] font-bold">
                  {format(day, "d")}
                </span>
                {masteredCount > 0 && <div className="w-1 h-1 rounded-full bg-white mt-0.5" />}
                {masteredCount === 0 && activityCount > 0 && <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
              </div>
            );
          })}
        </div>

        <Dialog open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
          <DialogContent className="sm:max-w-md bg-background border-primary/20 shadow-2xl p-0 overflow-hidden">
            <div className="p-6 border-b border-border/50 bg-muted/20">
              <DialogHeader className="flex flex-row items-center gap-3 space-y-0">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div className="flex flex-col">
                  <DialogTitle className="text-xl font-black">Daily Mastery</DialogTitle>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                    {selectedDay ? format(new Date(selectedDay), "MMMM do, yyyy") : ""}
                  </p>
                </div>
              </DialogHeader>
            </div>

            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {selectedDay && (dailyData.get(selectedDay)?.mastered.length ?? 0) > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" /> Mastered Today
                  </h4>
                  {dailyData.get(selectedDay)?.mastered.map((item, i) => (
                    <div key={i} className="group p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                      <span className="text-base font-bold capitalize tracking-tight">{item.word}</span>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black uppercase text-primary/60 tracking-tighter mb-0.5">Final Accuracy</span>
                        <span className="text-lg font-black text-primary">{item.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedDay && (dailyData.get(selectedDay)?.activity.length ?? 0) > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Activity className="w-3 h-3" /> Active Progress
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {dailyData.get(selectedDay)?.activity.map((item, i) => (
                      <div key={i} className="p-3 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between">
                        <span className="text-sm font-bold capitalize">{item.word}</span>
                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary">
                          Stage {item.stage}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-muted/20 border-t border-border/50 text-center">
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                Academic Rhythm • Deep Learning Protocol
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
