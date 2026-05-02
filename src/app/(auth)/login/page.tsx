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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Eye, EyeOff, ArrowRight, AlertCircle, ArrowLeft, BadgeCheck, Sparkles, ShieldCheck, Languages, CheckCircle2 } from "lucide-react";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, isLoading, setUser, setSessionToken, setFirebaseUser } = useAuthStore();
  const [showPopupHelp, setShowPopupHelp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const highlights = [
    "Adaptive lessons that respond to your progress",
    "Learn faster with structured recall and review",
    "Track momentum across every word you master",
  ];

  const trustPoints = [
    { icon: CheckCircle2, label: "Ten-stage learning flow" },
    { icon: ShieldCheck, label: "Private account access" },
    { icon: Languages, label: "Built for English learners" },
  ];

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

      if (message.startsWith("ACCOUNT_LOCKED:")) {
        setError(`Your account has been locked: ${message.replace("ACCOUNT_LOCKED:", "")}`);
        return;
      }

      if (message.includes("auth/invalid-credential") || message.includes("auth/user-not-found")) {
        setError("Invalid email or password. Please try again.");
        return;
      }

      setError(message);
    }
  };

  const onGoogleLogin = async () => {
    setError(null);
    try {
      // Test hook: if present, use it to simulate login (Playwright tests)
      const testHook = (window as any).__TEST_MOCKS__?.loginWithGoogle;
      if (testHook) {
        const session = await testHook();
        setUser(session.user);
        setSessionToken(session.sessionToken);
        setFirebaseUser(null);

        if (!session.user.onboardingComplete) {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }

        return;
      }

      const session = await loginWithGoogle();

      if (!session.user.onboardingComplete) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google login failed";

      if (message === "EMAIL_NOT_VERIFIED") {
        router.push("/verify-email");
        return;
      }

      if (message.startsWith("ACCOUNT_LOCKED:")) {
        setError(`Your account has been locked: ${message.replace("ACCOUNT_LOCKED:", "")}`);
        return;
      }

      if (message.includes("auth/popup-closed-by-user")) {
        return;
      }

      if (message.includes('popup') || message.includes('blocked')) {
        setShowPopupHelp(true);
      }

      // popup-blocked will be surfaced to user; no redirect fallback per user request

      setError(message);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.14),_transparent_28%),linear-gradient(180deg,_rgba(255,255,255,0.72),_rgba(248,250,252,0.9))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.2),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.14),_transparent_26%),linear-gradient(180deg,_rgba(9,9,11,0.96),_rgba(9,9,11,0.98))]">
      <div className="absolute inset-0 -z-10 opacity-70 [background-image:linear-gradient(rgba(120,119,198,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(120,119,198,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute top-20 left-6 h-56 w-56 rounded-full bg-violet-400/15 blur-3xl dark:bg-violet-500/15" />
      <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/10" />

      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-50">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground tap-target">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <section className="hidden lg:block">
            <div className="max-w-xl space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur">
                <Sparkles className="h-4 w-4 text-brand" />
                Designed for focused vocabulary practice
              </div>

              <div className="space-y-4">
                <Link href="/" className="inline-flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-violet-600 via-indigo-600 to-purple-600 shadow-xl shadow-violet-500/20 ring-1 ring-white/20">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">VocabVault</p>
                    <p className="text-lg font-semibold text-foreground">Vocabulary mastery, staged by design</p>
                  </div>
                </Link>

                <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  A cleaner way to return to your learning flow.
                </h1>
                <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                  Sign in to continue your learning journey with a calmer interface, clearer next steps, and a study flow that stays out of the way.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {trustPoints.map(({ icon: Icon, label }) => (
                  <div key={label} className="glass-panel rounded-2xl p-4 shadow-sm">
                    <Icon className="mb-3 h-5 w-5 text-brand" />
                    <p className="text-sm font-medium text-foreground">{label}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 rounded-3xl border border-border/70 bg-background/70 p-6 shadow-xl shadow-violet-500/5 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                    <BadgeCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Built for momentum</p>
                    <p className="text-sm text-muted-foreground">Short sessions, strong recall, visible progress.</p>
                  </div>
                </div>

                <ul className="space-y-3">
                  {highlights.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand/10 text-brand">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <div className="mx-auto w-full max-w-md lg:max-w-none">
            <Card className="border-border/60 bg-background/80 shadow-2xl shadow-violet-500/10 backdrop-blur-xl">
              <CardHeader className="pb-4 text-center sm:pb-6">
                <Link href="/" className="mx-auto mb-5 flex items-center justify-center gap-2 lg:hidden">
                  <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-violet-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                </Link>
                <CardTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">Welcome back</CardTitle>
                <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
                  Continue where you left off and pick up the next word with less friction.
                </p>
              </CardHeader>

              <CardContent className="pt-0 sm:pt-2">
                {error && (
                  <div className="mb-4 flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive" aria-live="polite">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={onGoogleLogin}
                  className="w-full tap-target border-border/70 bg-background/80 shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-background"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.56-2.77c-.98.66-2.24 1.05-3.72 1.05-2.86 0-5.28-1.93-6.15-4.52H2.18v2.84A11 11 0 0 0 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.85 14.11A6.58 6.58 0 0 1 5.5 12c0-.73.13-1.44.35-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.77.42 3.44 1.18 4.95l3.67-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15C17.45 2.09 14.96 1 12 1A11 11 0 0 0 2.18 7.05l3.67 2.84C6.72 7.31 9.14 5.38 12 5.38z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </Button>

                {showPopupHelp && (
                  <div className="mt-3 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                    It looks like your browser blocked the sign-in popup. Please allow popups for this site or try signing in using a different browser.
                  </div>
                )}

                <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <div className="h-px flex-1 bg-border" />
                  <span>or continue with email</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="tap-target bg-background/80"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="tap-target pr-10 bg-background/80"
                        {...register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-destructive">{errors.password.message}</p>
                    )}

                    <div className="text-right mt-1">
                      <Link href="/reset-password" className="text-sm text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full tap-target bg-linear-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-violet-500/25 transition-transform hover:-translate-y-0.5 hover:from-violet-700 hover:via-indigo-700 hover:to-purple-700"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="font-medium text-primary hover:underline">
                    Create one
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
