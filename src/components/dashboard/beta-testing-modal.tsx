"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Beaker, MessageSquare, ArrowRight, User } from "lucide-react";

export default function BetaTestingModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the beta notice
    const hasSeenNotice = localStorage.getItem("vocabvault_beta_notice_dismissed");
    if (!hasSeenNotice) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("vocabvault_beta_notice_dismissed", "true");
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            onClick={handleDismiss}
          />

          {/* Modal Surface */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-card border border-primary/20 rounded-[2rem] shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[80px]" />
            </div>

            <div className="relative p-8 sm:p-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner mb-6">
                <Beaker className="w-8 h-8 text-primary" />
              </div>

              <h2 className="text-2xl font-black tracking-tight text-foreground mb-3">
                Welcome to Beta Testing
              </h2>
              
              <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-8">
                You are one of our early testers! While we have worked hard to ensure a smooth experience, you might still encounter some bugs or rough edges.
              </p>

              <div className="w-full bg-muted/50 border border-border/50 rounded-2xl p-6 text-left mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                  <MessageSquare className="w-3 h-3" /> How to Report Issues
                </h3>
                <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                  If you find any bugs, errors, or have suggestions for improvement, please let us know immediately!
                </p>
                
                <div className="flex items-center gap-2 p-3 bg-background rounded-xl border border-border/50 text-xs font-bold text-muted-foreground">
                  <User className="w-4 h-4 text-foreground" /> Profile Menu 
                  <ArrowRight className="w-3 h-3 text-primary mx-1" />
                  <MessageSquare className="w-4 h-4 text-foreground" /> Report
                </div>
              </div>

              <Button
                onClick={handleDismiss}
                className="w-full h-12 rounded-xl bg-primary text-white hover:bg-primary/90 font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl shadow-primary/20"
              >
                I Understand, Let's Begin
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
