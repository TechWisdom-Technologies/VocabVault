"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ArrowLeft, AlertCircle } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

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
      // Generalize error messages for security
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-50">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground tap-target">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
      <Card className="w-full max-w-md border-border/50 shadow-xl shadow-violet-500/5">
        <CardHeader className="text-center pb-2">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
          </Link>
          <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Enter your email and we will send a reset link</p>
        </CardHeader>

        <CardContent className="pt-4">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send reset email'}
              </Button>
              <Link href="/login" className="text-sm text-muted-foreground hover:underline flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
