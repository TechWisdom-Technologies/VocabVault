"use client";

import React from "react";

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
  fullScreen?: boolean;
}

export default function LoadingScreen({ 
  message = "VocabVault", 
  submessage = "Unlocking your linguistic potential...",
  fullScreen = true
}: LoadingScreenProps) {
  return (
    <div className={`${fullScreen ? 'fixed inset-0 z-[9999]' : 'relative w-full h-full min-h-[400px]'} flex flex-col items-center justify-center overflow-hidden bg-[#050506]`}>
      {/* Immersive Background Layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated Gradient Meshes */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[140px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[140px] animate-[pulse_10s_ease-in-out_infinite_reverse]" />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:radial-gradient(white,transparent_85%)]" />
      </div>

      {/* Main Content Container */}
      <div className="relative flex flex-col items-center gap-16 z-10">
        {/* The "Logo" Loader */}
        <div className="relative group">
          {/* Main Logo Container */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Morphing Background Shape */}
            <div className="absolute inset-0 bg-primary/20 backdrop-blur-3xl rounded-[30%_70%_70%_30%/30%_30%_70%_70%] animate-[morph_6s_ease-in-out_infinite] border border-primary/30" />
            
            {/* Inner Floating Logo Symbol */}
            <div className="relative z-20 flex flex-col items-center justify-center translate-y-[-2px]">
              <div className="text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] animate-pulse">
                V
              </div>
              <div className="h-1 w-8 bg-primary rounded-full mt-1 shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
            </div>

            {/* Orbiting Elements */}
            <div className="absolute inset-[-15px] border border-primary/20 rounded-full animate-[spin_12s_linear_infinite]" />
            <div className="absolute inset-[-40px] border border-white/5 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
            
            {/* Particle Dots on Orbit */}
            <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full blur-[1px] shadow-[0_0_10px_var(--primary)]" />
          </div>
        </div>

        {/* Branding Section */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="overflow-hidden">
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic animate-[reveal-up_0.8s_cubic-bezier(0.23,1,0.32,1)_forwards]">
              {message}
            </h1>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mt-2 animate-in fade-in duration-1000 delay-300">
              By TechWisdom Technologies
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-primary/50" />
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-primary/80 animate-pulse">
              Initializing Experience
            </p>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-primary/50" />
          </div>

          <p className="text-sm text-white/40 max-w-[240px] leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-500">
            {submessage}
          </p>
        </div>

        {/* Premium Progress Loader */}
        <div className="relative w-64 h-[2px] bg-white/5 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-primary/20" />
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-primary to-transparent w-full animate-[loading-shimmer_2s_infinite]" />
        </div>
      </div>

      <style jsx global>{`
        @keyframes morph {
          0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; transform: scale(1) rotate(0deg); }
          33% { border-radius: 50% 50% 30% 70% / 50% 70% 30% 50%; transform: scale(1.05) rotate(10deg); }
          66% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; transform: scale(0.95) rotate(-10deg); }
        }

        @keyframes reveal-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes loading-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .bg-grid-white\/\[0\.02\] {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.02)'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  );
}
