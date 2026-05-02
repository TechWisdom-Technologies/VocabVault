"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths, isSameMonth } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trophy } from "lucide-react";

export default function LearningCalendar() {
  const { getAuthHeaders, user } = useAuthStore();
  const [dailyData, setDailyData] = useState<Map<string, { count: number; words: { word: string; score: number }[] }>>(new Map());
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
          const map = new Map<string, { count: number; words: { word: string; score: number }[] }>();
          data.progress
            .filter((p: any) => p.status === "COMPLETED")
            .forEach((p: any) => {
              const key = format(new Date(p.startedAt), "yyyy-MM-dd");
              const existing = map.get(key) || { count: 0, words: [] };
              map.set(key, { 
                count: existing.count + 1, 
                words: [...existing.words, { word: p.word.word, score: p.totalScore }] 
              });
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
            const count = data?.count || 0;
            const words = data?.words || [];
            const isToday = day.getTime() === today.getTime();
            const isFuture = day > today;
            const isSelected = selectedDay === key;
            
            return (
              <div
                key={key}
                onClick={() => count > 0 && setSelectedDay(isSelected ? null : key)}
                className={`aspect-square rounded-lg border flex flex-col items-center justify-center transition-all ${
                  isFuture
                    ? "opacity-20 border-transparent pointer-events-none"
                    : count > 0
                      ? cn(
                          "bg-primary text-primary-foreground border-primary shadow-sm scale-105 z-10 cursor-pointer",
                          isSelected && "ring-2 ring-primary ring-offset-2"
                        )
                      : "bg-muted/30 border-border/50 hover:bg-muted/50 cursor-default"
                } ${isToday ? "ring-2 ring-orange-500 ring-offset-2" : ""}`}
                title={count > 0 ? `Click to see ${count} words` : ""}
              >
                <span className="text-[10px] font-bold">
                  {format(day, "d")}
                </span>
                {count > 0 && <div className="w-1 h-1 rounded-full bg-white mt-0.5" />}
              </div>
            );
          })}
        </div>

        <Dialog open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
          <DialogContent className="sm:max-w-md bg-background border-primary/20 shadow-2xl">
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
            <div className="space-y-3 mt-4">
              {selectedDay && dailyData.get(selectedDay)?.words.map((item, i) => (
                <div key={i} className="group p-4 rounded-2xl bg-muted/30 border border-border/50 flex items-center justify-between transition-all hover:bg-muted/50 hover:border-primary/30">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-xs font-black shadow-xs">
                      {i + 1}
                    </div>
                    <span className="text-lg font-bold capitalize tracking-tight">{item.word}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter mb-0.5">Mastery Score</span>
                    <span className={cn(
                      "text-xl font-black",
                      item.score >= 90 ? "text-success" : item.score >= 70 ? "text-primary" : "text-amber-600"
                    )}>
                      {item.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border/50 text-center">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                Keep learning to maintain your streak!
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
