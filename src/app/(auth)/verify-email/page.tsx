"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Mail, ArrowRight, ArrowLeft, Quote } from "lucide-react";
import { motion } from "framer-motion";

export default function VerifyEmailPage() {
  return (
    <div className="h-screen bg-[#0a0a0b] flex overflow-hidden">
      {/* Left Side: Branding & Quote */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex w-1/2 relative bg-[#111112] border-r border-white/5 flex-col justify-between p-16"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#fb731f]/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div>
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-[#fb731f] flex items-center justify-center shadow-lg shadow-[#fb731f]/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white tracking-tight">VocabVault</span>
              <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest mt-0.5">By TechWisdom Technologies</span>
            </div>
          </Link>
        </div>

        <div className="max-w-md">
          <Quote className="w-12 h-12 text-[#fb731f]/20 mb-6" />
          <h1 className="text-5xl font-bold text-white leading-tight mb-8">
            Knowledge is <span className="text-[#fb731f]">power</span>, but only if it is verified.
          </h1>
          <div className="space-y-6">
            <p className="text-lg text-white/60 leading-relaxed">
              "Verify your identity to unlock the full potential of the vault and begin your journey."
            </p>
          </div>
        </div>

        <div className="text-[10px] font-medium text-white/20 uppercase tracking-[0.3em]">
          Professional Language Acquisition Suite
        </div>
      </motion.div>

      {/* Right Side: Content */}
      <div className="w-full lg:w-1/2 flex flex-col relative">
        <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-10 lg:hidden">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white transition-colors hover:bg-white/5">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <div className="flex justify-end p-8 pb-0">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/20 hover:text-white transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Return home
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 flex items-center justify-center p-8 sm:p-12 pt-0 sm:pt-0"
        >
          <div className="w-full max-w-[400px] space-y-10 text-center lg:text-left">
            <div className="flex justify-center lg:justify-start">
                <div className="w-16 h-16 rounded-2xl bg-[#fb731f]/10 border border-[#fb731f]/20 flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-[#fb731f]" />
                </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-white tracking-tight">Verify email</h2>
              <p className="text-white/40 font-medium leading-relaxed">
                We&apos;ve dispatched a verification link to your inbox. Activate it to finalize your access to the vault.
              </p>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-sm text-white/40 leading-relaxed">
                <p className="text-white font-bold mb-2">No email received?</p>
                Check your spam folder or wait a few minutes. If the link doesn&apos;t arrive, try registering again with the same address.
              </div>

              <Link href="/login" className="block">
                <Button className="w-full h-14 bg-[#fb731f] hover:bg-[#ff853c] text-white font-bold rounded-xl shadow-lg shadow-[#fb731f]/10 transition-all active:scale-[0.98]">
                  Back to Sign in
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>

            </div>
          </div>
        </motion.div>

        <div className="p-8 text-center lg:text-left text-[10px] font-bold uppercase tracking-[0.2em] text-white/10">
          © TechWisdom Technologies
        </div>
      </div>
    </div>
  );
}
