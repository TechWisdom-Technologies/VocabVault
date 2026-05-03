"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Target, 
  Activity, 
  DollarSign, 
  UserPlus, 
  Star,
  TrendingUp,
  ArrowUpRight,
  Loader2
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  proUsers: number;
  active7Days: number;
  active30Days: number;
  signupsToday: number;
  totalWordsLearned: number;
  totalStagesCompleted: number;
  revenue: number;
}

export default function AdminDashboardPage() {
  const { getAuthHeaders } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/admin/stats", { headers });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [getAuthHeaders]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-40 rounded-3xl bg-white/5 border border-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const STAT_CARDS = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-violet-500", glow: "bg-violet-500/20" },
    { label: "Pro Subscribers", value: stats.proUsers, icon: Star, color: "text-amber-500", glow: "bg-amber-500/20" },
    { label: "Active (7D)", value: stats.active7Days, icon: Activity, color: "text-emerald-500", glow: "bg-emerald-500/20" },
    { label: "Words Mastered", value: stats.totalWordsLearned, icon: Target, color: "text-sky-500", glow: "bg-sky-500/20" },
    { label: "Signups Today", value: stats.signupsToday, icon: UserPlus, color: "text-purple-500", glow: "bg-purple-500/20" },
    { label: "Total Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-rose-500", glow: "bg-rose-500/20" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white italic uppercase">Executive Dashboard</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            Real-time platform metrics & analytics
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-2 rounded-2xl">
          <div className="px-4 py-2 bg-primary rounded-xl text-xs font-black text-white shadow-lg shadow-primary/20">
            Export Data
          </div>
          <div className="px-4 py-2 hover:bg-white/5 rounded-xl text-xs font-black text-white/60 transition-colors cursor-pointer">
            Last 30 Days
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STAT_CARDS.map((stat, i) => (
          <Card key={stat.label} className="bg-white/5 border-white/5 rounded-3xl overflow-hidden group hover:border-white/10 transition-all duration-500 relative">
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] rounded-full -mr-16 -mt-16 transition-all duration-700 opacity-50 group-hover:opacity-100 ${stat.glow}`} />
            
            <CardContent className="p-8 relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                  <ArrowUpRight className="w-3 h-3" />
                  +12%
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <h3 className="text-4xl font-black text-white tracking-tighter">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/5 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-lg font-black text-white tracking-tight uppercase">Recent Activity</h4>
            <div className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline cursor-pointer">View All</div>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-primary transition-all duration-500">
                  <Activity className="w-5 h-5 text-white/40 group-hover:text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">New word set generated</p>
                  <p className="text-[10px] text-white/20 uppercase tracking-widest font-black">User ID: 0284... • 2m ago</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-white/5 border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
            <TrendingUp className="w-10 h-10 text-primary relative z-10" />
          </div>
          <div>
            <h4 className="text-xl font-black text-white tracking-tight">Platform Growth</h4>
            <p className="text-xs text-white/40 font-medium max-w-[280px] mx-auto mt-2">
              User engagement has increased by 24% compared to last month. Keep optimizing the content funnel!
            </p>
          </div>
          <div className="h-1.5 w-full max-w-[200px] bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[74%] animate-[shimmer_2s_infinite]" />
          </div>
        </Card>
      </div>
    </div>
  );
}
