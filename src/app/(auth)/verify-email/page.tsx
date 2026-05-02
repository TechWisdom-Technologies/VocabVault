"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Mail, ArrowRight, ArrowLeft } from "lucide-react";

export default function VerifyEmailPage() {
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
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-200/20 dark:bg-violet-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md border-border/50 shadow-xl shadow-violet-500/5 text-center">
        <CardHeader className="pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40 flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We&apos;ve sent a verification link to your email address. Please click the link
            to verify your account before signing in.
          </p>

          <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Didn&apos;t receive the email?</p>
            <p>Check your spam folder or try signing up again with the same email.</p>
          </div>

          <Link href="/login" className="block pt-2">
            <Button className="w-full tap-target bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white">
              Go to Login
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>

          <Link
            href="/"
            className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="w-3.5 h-3.5" />
              Back to homepage
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
