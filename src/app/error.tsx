"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Home, BookOpen } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry
    console.error("Global Error Boundary Captured:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-4 relative overflow-hidden text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-rose-600/5 rounded-full blur-[140px] animate-pulse" />
      </div>

      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-[2rem] bg-linear-to-br from-rose-600 to-orange-600 flex items-center justify-center shadow-2xl shadow-rose-500/20 mx-auto">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg shadow-lg">
            Exception
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tighter italic uppercase">Vault Interruption</h1>
          <p className="text-white/40 text-sm leading-relaxed max-w-[300px] mx-auto">
            A cognitive disruption occurred while processing the request. This has been logged for the development team.
          </p>
          <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5 font-mono text-[10px] text-rose-400/60 truncate">
            {error.message || "Unknown cognitive error"}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => reset()}
            className="w-full h-12 rounded-2xl bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest text-[10px] shadow-xl transition-all active:scale-[0.98]"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Synchronize & Retry
          </Button>
          
          <Link href="/" className="w-full">
            <Button variant="ghost" className="w-full h-12 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 font-black uppercase tracking-widest text-[10px] transition-all">
              <Home className="w-4 h-4 mr-2" />
              Exit to Safety
            </Button>
          </Link>
        </div>

        <div className="pt-8 flex items-center justify-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">
            <BookOpen className="w-3 h-3 text-white/20" />
          </div>
          <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">TechWisdom Protocol v1.0</span>
        </div>
      </div>
    </div>
  );
}
