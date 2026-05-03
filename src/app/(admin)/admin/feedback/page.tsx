"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Zap, 
  AlertCircle, 
  Loader2, 
  User, 
  Mail, 
  MapPin, 
  Calendar,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Clock,
  ExternalLink
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface FeedbackItem {
  id: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  stageNumber: number | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    plan: string;
    profession: string | null;
    nationality: string | null;
  };
  word?: {
    word: string;
  } | null;
}

export default function AdminFeedbackPage() {
  const { getAuthHeaders } = useAuthStore();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const fetchFeedback = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/admin/feedback", { headers });
      if (res.ok) {
        const data = await res.json();
        setFeedback(data.feedback);
      }
    } catch (error) {
      console.error("Failed to fetch feedback", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [getAuthHeaders]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'BUG_REPORT': return <Bug className="w-4 h-4 text-rose-500" />;
      case 'FEATURE_REQUEST': return <Lightbulb className="w-4 h-4 text-amber-500" />;
      case 'STAGE_FEEDBACK': return <Zap className="w-4 h-4 text-sky-500" />;
      default: return <MessageSquare className="w-4 h-4 text-emerald-500" />;
    }
  };

  const filteredFeedback = feedback.filter(f => filter === "ALL" || f.category === filter);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">User Intelligence</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1 flex items-center gap-2">
            <MessageSquare className="w-3 h-3 text-primary" />
            Monitoring reports, bugs & community suggestions
          </p>
        </div>
        
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/5">
          {['ALL', 'BUG_REPORT', 'FEATURE_REQUEST', 'STAGE_FEEDBACK'].map((cat) => (
            <Button
              key={cat}
              onClick={() => setFilter(cat)}
              variant="ghost"
              className={`h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === cat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/20 hover:text-white'}`}
            >
              {cat === 'ALL' ? 'Total' : cat.split('_')[0]}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-48 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-xs font-black text-white/20 uppercase tracking-widest">Aggregating Global Reports...</p>
        </div>
      ) : filteredFeedback.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center gap-6 px-4">
          <div className="w-20 h-20 rounded-[32px] bg-white/5 flex items-center justify-center border border-white/5">
            <CheckCircle2 className="w-10 h-10 text-white/10" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-black text-white uppercase italic">No Active Reports</h3>
            <p className="text-white/20 text-sm font-medium mt-1">The system is currently operating within optimal parameters.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 px-4">
          {filteredFeedback.map((item) => (
            <Card key={item.id} className="bg-white/5 border-white/5 rounded-[32px] overflow-hidden hover:bg-white/[0.08] transition-all duration-300">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/5">
                  {/* Report Details */}
                  <div className="flex-[1.5] p-8 space-y-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-white/10 text-white/40 border-0 text-[9px] font-black uppercase px-2 py-1 flex items-center gap-1.5">
                            {getCategoryIcon(item.category)}
                            {item.category.replace('_', ' ')}
                          </Badge>
                          {item.stageNumber && (
                            <Badge className="bg-sky-500/10 text-sky-500 border-0 text-[9px] font-black uppercase px-2 py-1">Stage {item.stageNumber}</Badge>
                          )}
                        </div>
                        <h2 className="text-xl font-black text-white tracking-tight uppercase italic underline decoration-primary/30 underline-offset-8 decoration-2">{item.subject}</h2>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Status</div>
                        <Badge className={`rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${item.status === 'NEW' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-white/5 text-white/40'}`}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                      <p className="text-sm text-white/60 font-medium leading-relaxed italic">"{item.message}"</p>
                      {item.word && (
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Related Word:</span>
                          <span className="text-xs font-black text-primary uppercase tracking-tighter italic">{item.word.word}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-white/20 font-black uppercase tracking-widest">
                      <Clock className="w-3 h-3" />
                      Submitted: {formatDate(item.createdAt)}
                    </div>
                  </div>

                  {/* Reporter Profile */}
                  <div className="flex-1 bg-white/[0.02] p-8 space-y-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">
                      <User className="w-3 h-3" />
                      Reported By
                    </div>

                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${item.user.plan === 'PRO' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-white/10 text-white/40'}`}>
                        {item.user.name ? item.user.name[0].toUpperCase() : <User className="w-6 h-6" />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-white tracking-tight">{item.user.name || "Anonymous"}</h3>
                          {item.user.plan === 'PRO' && <Badge className="bg-amber-500/20 text-amber-500 border-0 text-[8px] font-black uppercase px-1.5 h-4">Pro</Badge>}
                        </div>
                        <p className="text-xs text-white/30 font-medium flex items-center gap-1.5">
                          <Mail className="w-3 h-3" />
                          {item.user.email}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 pt-6 border-t border-white/5">
                      <div className="flex items-center gap-3 text-xs font-bold text-white/40">
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        {item.user.nationality || "Global Citizen"}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-white/40">
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                          <Zap className="w-3.5 h-3.5" />
                        </div>
                        {item.user.profession || "Independent Learner"}
                      </div>
                    </div>

                    <Button variant="ghost" className="w-full h-11 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
                      View Full Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
