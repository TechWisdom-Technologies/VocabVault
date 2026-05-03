"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-[2rem] bg-linear-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/20 mx-auto transform -rotate-12">
            <Search className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg shadow-lg">
            Missing
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-black text-white tracking-tighter italic">404</h1>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Word Not Found</h2>
          <p className="text-white/40 text-sm leading-relaxed max-w-[280px] mx-auto">
            This page has been archived or never existed in the vault. Let's get you back to the journey.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/dashboard" className="w-full">
            <Button className="w-full h-12 rounded-2xl bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-violet-500/10 transition-all active:scale-[0.98]">
              <Home className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="ghost" className="w-full h-12 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 font-black uppercase tracking-widest text-[10px] transition-all">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </Link>
        </div>

        <div className="pt-8 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">
              <BookOpen className="w-3 h-3 text-white/20" />
            </div>
            <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">VocabVault v1.0</span>
          </div>
          <span className="text-[9px] font-bold text-white/5 uppercase tracking-[0.2em]">By TechWisdom Technologies</span>
        </div>
      </div>
    </div>
  );
}
