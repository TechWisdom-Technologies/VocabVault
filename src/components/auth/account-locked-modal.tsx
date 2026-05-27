"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Mail, ArrowRight, X } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AccountLockedModal() {
  const { isAccountLocked, lockReason, setAccountLocked } = useAuthStore();

  const handleClose = () => {
    setAccountLocked(false, null);
  };

  return (
    <AnimatePresence>
      {isAccountLocked && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-full max-w-lg bg-[#0e0c15] border border-rose-500/25 text-white rounded-[32px] overflow-hidden shadow-2xl relative p-6 sm:p-8 space-y-6 z-10 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {/* Ambient Radial Glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-500/10 blur-[80px] pointer-events-none" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute right-6 top-6 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all cursor-pointer active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Glowing Shield Icon */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-[22px] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto animate-pulse">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-black uppercase px-2.5 py-1 tracking-wider rounded-lg inline-flex">
                  Security Lock Active
                </Badge>
                <h2 className="text-2xl font-serif font-black uppercase italic tracking-tight text-white mt-2">
                  Account Locked
                </h2>
              </div>
            </div>

            {/* Reason Block */}
            <div className="bg-black/40 border border-white/[0.06] rounded-2xl p-5 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">Reason for Suspension</p>
              <p className="text-sm font-semibold text-rose-300/90 leading-relaxed italic bg-rose-500/[0.03] border border-rose-500/10 rounded-xl p-3.5">
                "{lockReason || "Your account has been flagged for multi-session compliance check."}"
              </p>
              <p className="text-xs text-white/40 leading-relaxed font-medium">
                Our automated compliance audit detected anomalous activity matching device session restrictions. To preserve your learning data, your account standing has been temporarily restricted pending identity check.
              </p>
            </div>

            {/* Call to Actions */}
            <div className="space-y-3 pt-2">
              <Link href="/support" className="block" onClick={handleClose}>
                <Button className="w-full h-13 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-black uppercase tracking-widest text-[10px] shadow-[0_12px_30px_rgba(239,68,68,0.2)] transition-all cursor-pointer flex items-center justify-center gap-2 border-0 rounded-2xl">
                  Contact Identity Verification
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                onClick={handleClose}
                variant="ghost"
                className="w-full h-12 bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white font-black uppercase tracking-widest text-[9px] rounded-2xl cursor-pointer"
              >
                Acknowledge and Sign Out
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Inline badge component helper for lock modal
function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center justify-center font-bold px-2 py-0.5 rounded text-[10px] ${className}`}>
      {children}
    </span>
  );
}
