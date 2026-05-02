"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Mic,
  Brain,
  Headphones,
  PenTool,
  BarChart3,
  Check,
  CheckCircle2,
  X,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Target,
  Clock,
  Star,
  Volume2,
  Eye,
  Trophy,
  ChevronRight,
  Gamepad2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

const stages = [
  { num: 1, name: "Word Briefing", desc: "First exposure with audio and phonetics", icon: BookOpen, color: "from-violet-500 to-purple-600" },
  { num: 2, name: "Sentence Immersion", desc: "Speak 6 sentences in different tenses", icon: Mic, color: "from-purple-500 to-indigo-600" },
  { num: 3, name: "Synonym & Antonym Map", desc: "Absorb related words and opposites", icon: Brain, color: "from-indigo-500 to-blue-600" },
  { num: 4, name: "Active Recall Test I", desc: "10-question mixed quiz on retention", icon: Target, color: "from-blue-500 to-cyan-600" },
  { num: 5, name: "Article Deep Read", desc: "Read the word in authentic context", icon: Eye, color: "from-cyan-500 to-teal-600" },
  { num: 6, name: "Active Recall Test II", desc: "Spelling and matching from memory", icon: PenTool, color: "from-teal-500 to-emerald-600" },
  { num: 7, name: "Active Listening", desc: "Hear the word in 3 English accents", icon: Headphones, color: "from-emerald-500 to-green-600" },
  { num: 8, name: "Paragraph Analysis", desc: "Count word forms in rich context", icon: BarChart3, color: "from-green-500 to-lime-600" },
  { num: 9, name: "Free Writing", desc: "Write an original paragraph using the word", icon: PenTool, color: "from-amber-500 to-orange-600" },
  { num: 10, name: "Spoken Performance", desc: "Speak freely with fluent word usage", icon: Volume2, color: "from-orange-500 to-red-500" },
];

const features = [
  { icon: Brain, title: "Science-Backed Learning", desc: "10 cognitive stages move every word from passive recognition to active command." },
  { icon: Mic, title: "AI Speech Analysis", desc: "Record your voice and receive instant feedback on pronunciation and fluency." },
  { icon: Shield, title: "Structured Progression", desc: "No skipping. No shortcuts. Every stage must be completed to unlock the next." },
  { icon: Zap, title: "Smart Daily Limits", desc: "5 words per day — deep processing, not surface-level memorization." },
  { icon: BarChart3, title: "Detailed Analytics", desc: "Track your progress across every stage, every word, every day." },
  { icon: Trophy, title: "Global Leaderboard", desc: "Compete with learners worldwide. See where you truly stand." },
];

const guides = [
  {
    title: "Start Here",
    desc: "Learn how the ten-stage cycle, daily word queue, and retry rules work before your first session.",
    href: "#stages",
  },
  {
    title: "Dashboard Tour",
    desc: "See where to find your progress charts, recent activity, leaderboard, and profile settings.",
    href: "/dashboard",
  },
  {
    title: "Practice Tips",
    desc: "Understand how to approach speaking, writing, listening, and recall stages for the strongest scores.",
    href: "#features",
  },
];

const stats = [
  { value: "10", label: "Cognitive Stages" },
  { value: "100", label: "Points Per Word" },
  { value: "5", label: "Words Daily" },
  { value: "80+", label: "Pass Threshold" },
  { value: "3", label: "English Accents" },
];

export default function HomePage() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">VocabVault</span>
            </Link>

            {/* Center Links — hidden on mobile */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#stages" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How it Works
              </a>
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              {!mounted ? (
                <div className="h-9 w-32 rounded-md bg-muted/50 animate-pulse" />
              ) : user ? (
                <Link href="/dashboard">
                  <Button size="sm" className="relative group tap-target bg-transparent hover:bg-transparent border-0">
                    <div className="absolute inset-0 bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-md opacity-75 group-hover:opacity-100 blur-sm transition-opacity duration-300 animate-pulse"></div>
                    <div className="relative flex items-center justify-center bg-background px-4 py-1.5 rounded-md text-sm font-medium border border-white/10 group-hover:bg-background/90 transition-colors">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Profile" className="w-5 h-5 rounded-full mr-2 border border-white/20" />
                      ) : (
                        <Gamepad2 className="w-4 h-4 mr-1.5 text-purple-400" />
                      )}
                      <span className="bg-clip-text text-transparent bg-linear-to-r from-pink-400 to-indigo-400 font-bold">
                        Playground
                      </span>
                    </div>
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="tap-target">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="tap-target bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25">
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-200/30 dark:bg-violet-900/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            10-Stage Word Mastery System
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Vocabulary is not memorized.
            <br />
            <span className="text-gradient">It is internalized.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            VocabVault takes every word through ten cognitive stages — from first exposure
            to fluent spoken production. No flashcards. No shortcuts. Real acquisition.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!mounted ? (
              <div className="h-14 w-48 rounded-md bg-muted/50 animate-pulse" />
            ) : user ? (
              <Link href="/dashboard">
                <Button size="lg" className="relative group tap-target text-base h-14 border-0 bg-transparent hover:bg-transparent overflow-hidden">
                  {/* Animated glowing background */}
                  <div className="absolute inset-0 bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
                  {/* Subtle shine effect that sweeps across */}
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out"></div>
                  {/* Inner dark container to create border effect, slightly transparent so colors bleed in */}
                  <div className="absolute inset-[2px] bg-background/90 group-hover:bg-background/80 rounded-[0.4rem] transition-colors duration-300"></div>
                  
                  <div className="relative flex items-center justify-center px-8 text-white z-10">
                    <Gamepad2 className="w-5 h-5 mr-2 text-pink-400 group-hover:text-pink-300 transition-colors" />
                    <span className="font-bold text-lg tracking-wide bg-clip-text text-transparent bg-linear-to-r from-pink-300 to-indigo-300">
                      Enter Playground
                    </span>
                    <ArrowRight className="w-5 h-5 ml-2 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Button>
              </Link>
            ) : (
              <Link href="/signup">
                <Button size="lg" className="tap-target text-base px-8 bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-xl shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:scale-[1.02]">
                  Start Learning Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            )}
            <a href="#stages">
              <Button size="lg" variant="outline" className="tap-target text-base px-8 h-14">
                See How It Works
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="py-8 border-y border-border/50 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-gradient">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 10 Stages Grid ─── */}
      <section id="stages" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 px-3 py-1">
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              The Learning Journey
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              10 Stages. One Word at a Time.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Each stage targets a specific cognitive process. Together, they move you
              from zero exposure to full fluency with every word.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {stages.map((stage) => (
              <Card
                key={stage.num}
                className="group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/5 hover:-translate-y-1"
              >
                <CardContent className="p-5">
                  <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${stage.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <stage.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-xs text-muted-foreground font-medium mb-1">
                    Stage {stage.num}
                  </div>
                  <h3 className="font-semibold text-sm mb-1.5">{stage.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {stage.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 px-3 py-1">
              <Star className="w-3.5 h-3.5 mr-1.5" />
              Why VocabVault
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Built for Real Acquisition
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every feature exists to close the gap between passive recognition and active command.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/5">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Guides ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 px-3 py-1">
              <BookOpen className="w-3.5 h-3.5 mr-1.5" />
              Documentation & Guides
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything a new learner needs
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              The homepage points learners to the core rules, dashboard, and stage guidance so they can start with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <Card key={guide.title} className="border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/5">
                <CardContent className="p-6 flex flex-col h-full">
                  <h3 className="font-semibold text-lg mb-2">{guide.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {guide.desc}
                  </p>
                  <div className="pt-5">
                    <a href={guide.href} className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
                      Open guide
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-y border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 px-3 py-1">
              <Star className="w-3.5 h-3.5 mr-1.5" />
              Learner Success
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Real Results. Real Fluency.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Hear from learners who used VocabVault to break through their vocabulary plateaus and achieve their IELTS goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/50 bg-muted/20">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />)}
                </div>
                <p className="italic text-sm mb-6 leading-relaxed">
                  "I was stuck at IELTS 6.5 for vocabulary. Flashcards weren't working because I knew the words but couldn't use them. Stage 9 and 10 completely changed how I speak. I just got my 7.5."
                </p>
                <div className="font-semibold text-sm">— Sarah T., IELTS 7.5</div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-muted/20">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />)}
                </div>
                <p className="italic text-sm mb-6 leading-relaxed">
                  "The 5 words a day limit frustrated me at first. But a month later, I realized I was actually using those 150 words in daily conversation without translating in my head first."
                </p>
                <div className="font-semibold text-sm">— Miguel R., Software Engineer</div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-muted/20">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />)}
                </div>
                <p className="italic text-sm mb-6 leading-relaxed">
                  "Having the AI actually listen to me speak and grade my usage was terrifying but incredible. It's like having a strict tutor who won't let you pretend you know the word."
                </p>
                <div className="font-semibold text-sm">— Anna K., University Student</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── Comparison ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why VocabVault is Different
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-muted-foreground">Conventional Apps</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-muted-foreground"><X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" /> See word, tap definition</li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground"><X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" /> Encourages swiping 50 words a day</li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground"><X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" /> Tests passive recognition</li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground"><X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" /> Multiple choice only</li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground"><X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" /> Fades from memory in weeks</li>
              </ul>
            </div>
            <div className="space-y-4 p-6 rounded-2xl bg-linear-to-br from-violet-500/10 to-purple-500/10 border border-primary/20">
              <h3 className="font-semibold text-lg text-primary">VocabVault</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> 10 stages of deep cognitive processing</li>
                <li className="flex items-start gap-2 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Strict limit of 5 words a day</li>
                <li className="flex items-start gap-2 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Forces active spoken and written production</li>
                <li className="flex items-start gap-2 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> AI evaluation of natural usage in context</li>
                <li className="flex items-start gap-2 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Internalized into permanent vocabulary</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 px-3 py-1">
              Simple Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              One Price. Lifetime Access.
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              No subscriptions. No renewals. Pay once, learn forever.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Free Plan</CardTitle>
                <div className="mt-3">
                  <span className="text-4xl font-bold">৳0</span>
                  <span className="text-muted-foreground ml-2">forever</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Full access to first 25 words",
                  "All 10 stages per word",
                  "AI speech & writing evaluation",
                  "Progress analytics & leaderboard",
                  "Dashboard & streak tracking",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
                <Link href="/signup" className="block pt-4">
                  <Button variant="outline" className="w-full tap-target">
                    Start Free
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-2 border-primary shadow-xl shadow-violet-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-linear-to-r from-violet-600 to-purple-600 text-white px-3 py-1">
                  Recommended
                </Badge>
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Pro Plan</CardTitle>
                <div className="mt-3">
                  <span className="text-4xl font-bold">৳499</span>
                  <span className="text-muted-foreground ml-2">one-time</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Everything in Free, plus:",
                  "Unlimited word library access",
                  "All future words included free",
                  "Pro badge on profile",
                  "Priority support",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
                <Link href="/signup" className="block pt-4">
                  <Button className="w-full tap-target bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25">
                    Get Lifetime Access
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border/50 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-gradient">VocabVault</span>
              <span className="text-sm text-muted-foreground">by TechWisdom Technologies</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#stages" className="hover:text-foreground transition-colors">How it Works</a>
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border/50 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} TechWisdom Technologies. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
