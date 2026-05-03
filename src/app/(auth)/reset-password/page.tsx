"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, ArrowLeft, AlertCircle, Loader2, Quote, Sparkles } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { motion } from "framer-motion";

const resetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ResetInput = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetInput>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetInput) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, data.email);
      setSuccess('If an account exists for this email, a password reset link has been sent.');
    } catch (err: any) {
      const message = err?.code === 'auth/user-not-found' 
        ? 'If an account exists for this email, a password reset link has been sent.' 
        : 'Failed to send reset email';
      if (err?.code === 'auth/user-not-found') {
        setSuccess(message);
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#0a0a0b] flex overflow-hidden">
      {/* Left Side: Branding & Quote */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex w-1/2 relative bg-[#111112] border-r border-white/5 flex-col justify-between p-16"
      >
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#fb731f]/5 blur-[100px] rounded-full pointer-events-none" />
        
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
            Safety and <span className="text-[#fb731f]">security</span> come first in the vault.
          </h1>
          <div className="space-y-6">
            <p className="text-lg text-white/60 leading-relaxed">
              "Recover your master password to continue your journey through the ten stages of acquisition."
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
          <Link href="/login" className="text-xs text-white/40 font-bold hover:text-[#fb731f] transition-colors flex items-center gap-2 uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 flex items-center justify-center p-8 sm:p-12 pt-0 sm:pt-0"
        >
          <div className="w-full max-w-[400px] space-y-10 text-center lg:text-left">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-white tracking-tight">Reset password</h2>
              <p className="text-white/40 font-medium">Enter your email and we will send a reset link.</p>
            </div>

            <div className="space-y-6">
              {error && (
                <div className="flex items-center gap-3 p-4 text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl animate-in fade-in zoom-in duration-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-3 p-4 text-sm font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-in fade-in zoom-in duration-300">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2 text-left">
                  <Label htmlFor="email" className="text-xs font-bold text-white/60 ml-1 uppercase tracking-widest">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    className="h-14 bg-white/5 border-white/10 focus:border-[#fb731f] focus:ring-0 rounded-xl transition-all text-white font-medium"
                    {...register("email")} 
                  />
                  {errors.email && <p className="text-[10px] text-red-400 font-bold ml-1 uppercase">{errors.email.message}</p>}
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full h-14 bg-[#fb731f] hover:bg-[#ff853c] text-white font-bold rounded-xl shadow-lg shadow-[#fb731f]/10 transition-all active:scale-[0.98] border-t border-white/20"
                >
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Send reset email'}
                </Button>
              </form>

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
