/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Eye, EyeOff, AlertCircle, ArrowLeft, Loader2, Quote } from "lucide-react";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import { useAuthStore } from "@/stores/auth-store";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    try {
      const session = await login(data.email, data.password);
      if (!session.user.onboardingComplete) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      if (message === "EMAIL_NOT_VERIFIED") {
        router.push("/verify-email");
        return;
      }
      setError("Invalid email or password. Please try again.");
    }
  };

  const onGoogleLogin = async () => {
    setError(null);
    try {
      const session = await loginWithGoogle();
      if (!session.user.onboardingComplete) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google login failed";
      if (message.includes("auth/popup-closed-by-user")) return;
      setError(message);
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
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#fb731f]/5 blur-[100px] rounded-full pointer-events-none" />
        
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
            Master your vocabulary, <span className="text-[#fb731f]">one stage</span> at a time.
          </h1>
          <div className="space-y-6">
            <p className="text-lg text-white/60 leading-relaxed">
              "Language is the blood of the soul into which thoughts run and out of which they grow."
            </p>
            <div className="flex items-center gap-4">
              <div className="h-px w-8 bg-[#fb731f]" />
              <p className="text-sm font-bold text-[#fb731f] uppercase tracking-widest">Oliver Wendell Holmes</p>
            </div>
          </div>
        </div>

        <div className="text-[10px] font-medium text-white/20 uppercase tracking-[0.3em]">
          Professional Language Acquisition Suite
        </div>
      </motion.div>

      {/* Right Side: Form */}
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
          <p className="text-sm text-white/40 font-medium">
            New here?{" "}
            <Link href="/signup" className="text-[#fb731f] font-bold hover:underline underline-offset-4">
              Sign up
            </Link>
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 flex items-center justify-center p-8 sm:p-12 pt-0 sm:pt-0"
        >
          <div className="w-full max-w-[400px] space-y-10">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-white tracking-tight">Sign in</h2>
              <p className="text-white/40 font-medium">Enter your credentials to access the vault.</p>
            </div>

            <div className="space-y-6">
              {error && (
                <div className="flex items-center gap-3 p-4 text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl animate-in fade-in zoom-in duration-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={onGoogleLogin}
                className="w-full h-14 border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.56-2.77c-.98.66-2.24 1.05-3.72 1.05-2.86 0-5.28-1.93-6.15-4.52H2.18v2.84A11 11 0 0 0 12 23z" fill="#34A853" />
                  <path d="M5.85 14.11A6.58 6.58 0 0 1 5.5 12c0-.73.13-1.44.35-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.77.42 3.44 1.18 4.95l3.67-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15C17.45 2.09 14.96 1 12 1A11 11 0 0 0 2.18 7.05l3.67 2.84C6.72 7.31 9.14 5.38 12 5.38z" fill="#EA4335" />
                </svg>
                Sign in with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
                  <span className="bg-[#0a0a0b] px-4">OR EMAIL</span>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold text-white/60 ml-1">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="h-12 bg-white/5 border-white/10 focus:border-[#fb731f] focus:ring-0 rounded-xl transition-all text-white font-medium"
                    {...register("email")}
                  />
                  {errors.email && <p className="text-[10px] text-red-400 font-bold ml-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <Label htmlFor="password" className="text-xs font-bold text-white/60">Password</Label>
                    <Link href="/reset-password" title="Recover Password" className="text-xs font-bold text-[#fb731f] hover:underline">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-12 bg-white/5 border-white/10 focus:border-[#fb731f] focus:ring-0 rounded-xl transition-all text-white font-medium pr-12"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-[10px] text-red-400 font-bold ml-1">{errors.password.message}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-[#fb731f] hover:bg-[#ff853c] text-white font-bold rounded-xl shadow-lg shadow-[#fb731f]/10 transition-all active:scale-[0.98] mt-2"
                >
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sign in"}
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
