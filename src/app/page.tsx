/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Mic,
  Brain,
  Headphones,
  PenTool,
  BarChart3,
  Check,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Target,
  Star,
  Volume2,
  Eye,
  Trophy,
  ChevronRight,
  Menu,
  X,
  Play,
  Layers,
  Circle,
  Activity,
  GraduationCap,
  Library,
  BookMarked,
  ScrollText,
  Quote,
  Briefcase,
  Camera,
  Mail,
  MapPin,
  Globe,
  Code,
  Phone,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";

const stages = [
  { num: 1, name: "Word Introduction", desc: "Initial exposure with audio and phonetics", icon: BookOpen, color: "from-[#fb731f] to-[#ff853c]", glow: "rgba(251, 115, 31, 0.15)" },
  { num: 2, name: "Sentence Practice", desc: "Speak 6 sentences in different tenses", icon: Mic, color: "from-orange-500 to-amber-500", glow: "rgba(249, 115, 22, 0.15)" },
  { num: 3, name: "Synonyms & Antonyms", desc: "Learn related words and their opposites", icon: Brain, color: "from-amber-500 to-yellow-500", glow: "rgba(245, 158, 11, 0.15)" },
  { num: 4, name: "Memory Test I", desc: "Check your initial retention with a quiz", icon: Target, color: "from-yellow-500 to-lime-500", glow: "rgba(234, 179, 8, 0.15)" },
  { num: 5, name: "Reading Practice", desc: "Read the word in real-world context", icon: Eye, color: "from-lime-500 to-emerald-500", glow: "rgba(132, 204, 22, 0.15)" },
  { num: 6, name: "Spelling Mastery", desc: "Practice spelling and matching from memory", icon: PenTool, color: "from-emerald-500 to-teal-500", glow: "rgba(16, 185, 129, 0.15)" },
  { num: 7, name: "Listening Skills", desc: "Hear the word in different English accents", icon: Headphones, color: "from-teal-500 to-cyan-500", glow: "rgba(20, 184, 166, 0.15)" },
  { num: 8, name: "Word Forms", desc: "Understand different versions of the word", icon: BarChart3, color: "from-cyan-500 to-blue-500", glow: "rgba(6, 182, 212, 0.15)" },
  { num: 9, name: "Writing Exercise", desc: "Write original sentences using the word", icon: PenTool, color: "from-blue-500 to-indigo-500", glow: "rgba(59, 130, 246, 0.15)" },
  { num: 10, name: "Speaking Fluency", desc: "Speak freely with fluent word usage", icon: Volume2, color: "from-indigo-500 to-violet-500", glow: "rgba(99, 102, 241, 0.15)" },
];

const features = [
  { id: 'smart', icon: Brain, title: "Smart Learning", desc: "A proven 10-stage system that moves words from memory to real-life use." },
  { id: 'voice', icon: Mic, title: "Voice Recognition", desc: "Our AI checks your pronunciation and fluency with instant feedback." },
  { id: 'process', icon: GraduationCap, title: "Proven Process", desc: "Our system ensures you master each word before moving forward." },
  { id: 'memory', icon: Zap, title: "Long-term Memory", desc: "Designed for permanent retention so you never forget what you learn." },
  { id: 'progress', icon: BarChart3, title: "Detailed Progress", desc: "Track your vocabulary growth with clear charts and daily stats." },
  { id: 'leaderboard', icon: Library, title: "Global Leaderboard", desc: "Compare your progress with a global community of dedicated learners." },
];

const testimonials = [
  {
    name: "Dr. Sarah Jenkins",
    role: "Linguistic Researcher",
    content: "The 10-stage methodology is a breakthrough in cognitive retention. I've never seen a platform transition vocabulary to active recall so effectively.",
    stats: "Mastered 4,200 Words",
    level: "Elite Tier"
  },
  {
    name: "James Wilson",
    role: "Professional Orator",
    content: "VocabVault transformed my public speaking. The voice recognition feedback is pinpoint accurate, allowing me to master nuances I previously ignored.",
    stats: "Mastered 2,850 Words",
    level: "Pro Tier"
  },
  {
    name: "Elena Rodriguez",
    role: "Graduate Student",
    content: "Navigating academic literature became second nature. The Synonyms and Context stages are particularly powerful for building deep comprehension.",
    stats: "Mastered 3,100 Words",
    level: "Advanced Tier"
  }
];

function StageCard({ stage, index, isMobile }: { stage: any, index: number, isMobile: boolean }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.98 }}
      style={{ 
        rotateX: isMobile ? 0 : rotateX, 
        rotateY: isMobile ? 0 : rotateY, 
        transformStyle: "preserve-3d" 
      }}
      className="group relative h-full"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[2.5rem] -z-10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div 
        className="h-full bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden backdrop-blur-sm"
        style={{ transform: "translateZ(20px)" }}
      >
        <div 
            className="absolute -inset-24 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
            style={{ 
                background: `radial-gradient(circle at center, ${stage.glow} 0%, transparent 70%)` 
            }}
        />

        <span className="absolute -bottom-4 -right-2 text-9xl font-serif font-black text-white/[0.03] select-none group-hover:text-white/[0.05] transition-colors duration-500">
            {stage.num}
        </span>

        <div className="relative z-10 space-y-6">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stage.color} flex items-center justify-center shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500`}>
                <stage.icon className="w-6 h-6 text-white" />
            </div>

            <div className="space-y-2">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-tight">Stage 0{stage.num}</span>
                <h3 className="text-xl font-serif font-black text-white uppercase italic tracking-tight leading-none group-hover:text-[#fb731f] transition-colors duration-300">
                    {stage.name}
                </h3>
            </div>

            <p className="text-sm text-white/40 font-medium leading-relaxed group-hover:text-white/60 transition-colors duration-300">
                {stage.desc}
            </p>
        </div>

        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent w-full scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
      </div>
    </motion.div>
  );
}

function TestimonialCard({ t, index, isMobile }: { t: any, index: number, isMobile: boolean }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      whileTap={{ scale: 0.98 }}
      style={{ 
        rotateX: isMobile ? 0 : rotateX, 
        rotateY: isMobile ? 0 : rotateY, 
        transformStyle: "preserve-3d" 
      }}
      className="group relative"
    >
      <div className="bg-white/[0.02] border border-white/5 hover:border-[#fb731f]/30 transition-all duration-500 rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-10 space-y-8 backdrop-blur-3xl relative overflow-hidden text-left">
          <Quote className="absolute top-8 right-8 w-12 h-12 text-[#fb731f]/10" />
          
          <div className="space-y-4">
              <div className="flex gap-1 text-[#fb731f]">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill="currentColor" />)}
              </div>
              <p className="text-lg text-white/60 font-serif italic leading-relaxed">"{t.content}"</p>
          </div>

          <div className="pt-8 border-t border-white/5 flex items-center justify-between">
              <div className="space-y-1">
                  <h4 className="text-white font-serif font-bold text-lg italic">{t.name}</h4>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{t.role}</p>
              </div>
              <div className="text-right">
                  <div className="text-[#fb731f] text-[10px] font-bold uppercase">{t.level}</div>
                  <div className="text-white/20 text-[9px] font-bold uppercase">{t.stats}</div>
              </div>
          </div>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const { user, getAuthHeaders } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const [hoveredFeature, setHoveredFeature] = useState(features[0]);
  const [isMobile, setIsMobile] = useState(false);

  const { scrollY } = useScroll();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const navBackground = useTransform(scrollY, [0, 50], ["rgba(2, 2, 3, 0)", "rgba(2, 2, 3, 0.8)"]);
  const navBorder = useTransform(scrollY, [0, 50], ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.05)"]);
  const navPadding = useTransform(scrollY, [0, 50], ["24px", "16px"]);
  const navWidth = useTransform(scrollY, [0, 50], ["100%", mounted && window.innerWidth < 1024 ? "100%" : "90%"]);
  const navRadius = useTransform(scrollY, [0, 50], ["0px", "24px"]);
  const navY = useTransform(scrollY, [0, 50], ["0px", "12px"]);

  const pricingX = useMotionValue(0);
  const pricingY = useMotionValue(0);
  const pricingRotateX = useTransform(pricingY, [-0.5, 0.5], ["5deg", "-5deg"]);
  const pricingRotateY = useTransform(pricingX, [-0.5, 0.5], ["-5deg", "5deg"]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleUpgrade = async () => {
    if (!user) {
      window.location.href = "/signup?plan=pro";
      return;
    }

    try {
      setIsRedirecting(true);
      const headers = await getAuthHeaders();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers,
      });

      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      }
    } catch (error) {
      console.error("Failed to start checkout", error);
    } finally {
      setIsRedirecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020203] text-white selection:bg-[#fb731f]/30 font-sans">
      {/* ─── Premium Interactive Floating Navigation ─── */}
      <motion.nav 
        style={{ 
          backgroundColor: navBackground,
          borderColor: navBorder,
          paddingTop: navPadding,
          paddingBottom: navPadding,
          width: isMobile ? "100%" : navWidth,
          borderRadius: isMobile ? "0px" : navRadius,
          y: isMobile ? "0px" : navY
        }}
        className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] border-b backdrop-blur-xl transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-12">
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div 
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="w-10 h-10 rounded-xl bg-[#fb731f] flex items-center justify-center shadow-2xl shadow-[#fb731f]/20 transition-all duration-300"
              >
                <BookMarked className="w-5 h-5 text-white" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-serif font-black tracking-tight text-white uppercase italic leading-none">VocabVault</span>
                <span className="text-[8px] sm:text-[10px] font-bold text-white/20 uppercase leading-none mt-1 font-sans">by TechWisdom Technologies</span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-10 font-sans relative">
              {[
                { name: "Features", href: "#features" },
                { name: "Stages", href: "#stages" },
                { name: "Pricing", href: "#pricing" }
              ].map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  onMouseEnter={() => setActiveTab(item.name)}
                  onMouseLeave={() => setActiveTab("")}
                  className="relative py-2 text-[15px] font-bold text-white/40 hover:text-white transition-colors group"
                >
                  {item.name}
                  {activeTab === item.name && (
                    <motion.div 
                      layoutId="nav-hover"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#fb731f] rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-6 font-sans">
              {!mounted ? (
                <div className="h-10 w-32 rounded-xl bg-white/5 animate-pulse" />
              ) : user ? (
                <Link href="/dashboard" className="hidden lg:block">
                  <Button className="h-11 px-6 bg-[#fb731f] hover:bg-[#ff853c] text-white font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-[#fb731f]/20">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="hidden lg:block">
                    <Button variant="ghost" className="text-[15px] font-bold text-white/40 hover:text-white transition-colors">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/signup" className="hidden sm:block">
                    <Button className="h-11 px-6 bg-white text-black font-bold rounded-xl transition-all active:scale-[0.95]">
                      Sign up
                    </Button>
                  </Link>
                </>
              )}
              
              <button 
                className="lg:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-90"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* ─── Premium Mobile Dropdown ─── */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-white/5 bg-[#020203]/98 backdrop-blur-3xl overflow-hidden w-full"
            >
              <div className="p-6 space-y-10">
                <div className="flex flex-col gap-6 font-sans">
                  {[
                    { name: "Features", href: "#features" },
                    { name: "Stages", href: "#stages" },
                    { name: "Pricing", href: "#pricing" },
                    ...(user ? [{ name: "Dashboard", href: "/dashboard" }] : [])
                  ].map((item, i) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link 
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-2xl font-serif font-black uppercase italic text-white/40 hover:text-[#fb731f] transition-colors flex items-center justify-between group"
                      >
                        {item.name}
                        <ChevronRight className="w-5 h-5 opacity-100 text-[#fb731f]" />
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-4 font-sans border-t border-white/5 pt-8">
                  {!user ? (
                    <>
                      <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="block">
                        <Button className="w-full h-14 bg-[#fb731f] text-white text-lg font-bold rounded-2xl shadow-xl shadow-[#fb731f]/20">
                          Join the Institute
                        </Button>
                      </Link>
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block">
                        <Button variant="ghost" className="w-full h-14 text-sm font-bold text-white/30 hover:text-white">
                          Sign in to Account
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block">
                      <Button className="w-full h-14 bg-[#fb731f] text-white text-lg font-bold rounded-2xl">
                        Enter Dashboard
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>



      {/* ─── Scholarly Hero ─── */}
      <section className="relative min-h-[90vh] flex items-center justify-center py-20 lg:py-32 px-6 overflow-hidden">
        {/* Academic Lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[#fb731f]/5 blur-[180px] rounded-full pointer-events-none opacity-50" />
        <div className="absolute bottom-0 left-0 w-full h-[400px] bg-gradient-to-t from-[#fb731f]/5 to-transparent pointer-events-none" />

        <div className="max-w-[1400px] mx-auto w-full grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center relative z-10">
          <div className="space-y-10 text-center px-4 sm:px-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="bg-white/5 border-white/10 text-[#fb731f] px-4 py-2 text-[11px] font-bold uppercase rounded-full mb-6 font-sans">
                Proven Learning System 2.1
              </Badge>
              <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[7rem] font-serif font-black leading-[0.9] tracking-tight text-white uppercase italic">
                Master <br />
                <span className="text-transparent stroke-text">Vocabulary.</span>
              </h1>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-2xl text-white/40 max-w-2xl mx-auto font-serif italic leading-relaxed"
            >
              VocabVault is a professional learning system designed to move new words from simple memory to confident speaking.
            </motion.p>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-12 font-sans"
            >
              <Link href="/signup" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-16 sm:h-20 px-12 bg-[#fb731f] hover:bg-[#ff853c] text-white font-bold rounded-3xl shadow-2xl shadow-[#fb731f]/30 transition-all hover:scale-105 active:scale-95 text-base sm:text-lg group">
                  Get started now
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
              <div className="flex flex-col items-center sm:items-start">
                  <span className="text-[10px] font-bold text-white/30 uppercase">System Status</span>
                  <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-emerald-500 uppercase">Active Session</span>
                  </div>
              </div>
            </motion.div>
          </div>

          {/* Academic Visual: The Scholarly Node UI */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="hidden lg:flex items-center justify-center lg:justify-end"
          >
            <div className="relative z-10 w-full max-w-[420px] bg-white/[0.02] backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.4)] overflow-hidden p-8 flex flex-col justify-between font-sans">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#fb731f] uppercase">Learning Progress</span>
                        <h4 className="text-xl font-serif font-black text-white italic uppercase tracking-tight">Active Node</h4>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-[#fb731f]" />
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center py-6">
                    <div className="relative">
                        <svg className="w-56 h-56">
                            <circle cx="112" cy="112" r="100" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                            <motion.circle 
                                cx="112" cy="112" r="100" fill="none" stroke="#fb731f" strokeWidth="8" 
                                strokeDasharray="628"
                                initial={{ strokeDashoffset: 628 }}
                                animate={{ strokeDashoffset: 150 }}
                                transition={{ duration: 2, delay: 1, ease: "easeOut" }}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-serif font-black text-white tracking-tighter">84<span className="text-xl text-[#fb731f]">%</span></span>
                            <span className="text-[10px] font-bold text-white/30 uppercase">Mastery level</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5">
                    {[
                        { label: "Vocal", val: "92%" },
                        { label: "Writing", val: "88%" },
                        { label: "Recall", val: "76%" },
                    ].map(stat => (
                        <div key={stat.label} className="space-y-1">
                            <span className="text-[9px] font-bold text-white/30 uppercase">{stat.label}</span>
                            <div className="text-base font-bold text-white">{stat.val}</div>
                        </div>
                    ))}
                </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Methodology (The 10 Stages) ─── */}
      <section id="stages" className="py-24 lg:py-48 px-6 relative border-t border-white/5 bg-gradient-to-b from-transparent to-[#050506]/50">
        <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl mb-16 sm:mb-32 space-y-6 text-center mx-auto">
                <Badge className="bg-[#fb731f]/10 text-[#fb731f] border-[#fb731f]/20 font-bold px-4 py-1.5 rounded-full font-sans uppercase text-[10px]">Methodology</Badge>
                <h2 className="text-4xl sm:text-6xl md:text-8xl font-serif font-black tracking-tight uppercase italic leading-none">The 10 Stages.</h2>
                <p className="text-base sm:text-xl text-white/30 font-serif italic max-w-xl mx-auto">Our proven 10-stage process ensures you learn every word through multiple cognitive channels.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {stages.map((stage, i) => (
                    <StageCard key={stage.num} stage={stage} index={i} isMobile={isMobile} />
                ))}
            </div>
        </div>
      </section>

      {/* ─── Interactive Capabilities Hub ─── */}
      <section id="features" className="py-24 lg:py-48 px-6 bg-[#050506] relative overflow-hidden">
        {/* Dynamic Background Pulse */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-[#fb731f]/5 blur-[200px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24 relative z-10">
            {/* Right Side: Morphing Focus Panel (Interactive Visual) */}
            <div className="flex-1 w-full order-1 lg:order-2">
                <motion.div
                    layout
                    className="relative aspect-square max-w-[500px] mx-auto lg:ml-auto"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={hoveredFeature.id}
                            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 1.1, rotate: 10 }}
                            transition={{ duration: 0.6, ease: "circOut" }}
                            className="absolute inset-0 bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] sm:rounded-[4rem] p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8"
                        >
                            <div className="relative">
                                <motion.div 
                                    animate={{ 
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 1, 0.5]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute inset-0 bg-[#fb731f]/20 blur-3xl rounded-full"
                                />
                                <hoveredFeature.icon className="w-20 h-20 sm:w-32 sm:h-32 text-[#fb731f] relative z-10" strokeWidth={1} />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-4xl font-serif font-black text-white uppercase italic tracking-tight">{hoveredFeature.title}</h3>
                                <p className="text-lg text-white/40 font-serif italic max-w-sm">{hoveredFeature.desc}</p>
                            </div>

                            {/* Decorative Elements based on feature */}
                            {hoveredFeature.id === 'voice' && (
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <motion.div 
                                            key={i}
                                            animate={{ height: [10, Math.random() * 40 + 20, 10] }}
                                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                                            className="w-1.5 bg-[#fb731f]/30 rounded-full"
                                        />
                                    ))}
                                </div>
                            )}
                            {hoveredFeature.id === 'smart' && (
                                <div className="grid grid-cols-4 gap-2">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                        <motion.div 
                                            key={i}
                                            animate={{ opacity: [0.2, 1, 0.2] }}
                                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                                            className="w-2 h-2 rounded-full bg-[#fb731f]"
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Left Side: Interactive Feature List */}
            <div className="flex-1 space-y-12 order-2 lg:order-1 text-center lg:text-left">
                <div className="space-y-6">
                    <Badge className="bg-[#fb731f]/10 text-[#fb731f] border-[#fb731f]/20 font-bold px-4 py-1.5 rounded-full font-sans uppercase text-[10px]">Capabilities</Badge>
                    <h2 className="text-5xl md:text-7xl font-serif font-black tracking-tight uppercase italic leading-[0.9]">Designed for <br /> Confident Speaking.</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 font-sans">
                    {features.map((f) => (
                        <motion.div 
                            key={f.id}
                            onMouseEnter={() => setHoveredFeature(f)}
                            onClick={() => setHoveredFeature(f)}
                            whileHover={{ x: 10 }}
                            whileTap={{ scale: 0.97 }}
                            className={`p-4 sm:p-6 rounded-[2rem] border transition-all duration-500 cursor-pointer flex items-center gap-4 sm:gap-6 group ${
                                hoveredFeature.id === f.id 
                                ? "bg-white/[0.05] border-white/20 shadow-xl" 
                                : "bg-transparent border-transparent opacity-40 hover:opacity-100"
                            }`}
                        >
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                                hoveredFeature.id === f.id ? "bg-[#fb731f] text-white" : "bg-white/5 text-white/30"
                            }`}>
                                <f.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-black text-white uppercase italic font-serif tracking-tight">{f.title}</h4>
                            </div>
                            <ChevronRight className={`w-5 h-5 text-[#fb731f] transition-all duration-500 ${
                                hoveredFeature.id === f.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                            }`} />
                        </motion.div>
                    ))}
                </div>

                <div className="pt-8">
                    <Link href="/signup">
                        <Button className="h-16 px-10 bg-[#fb731f] hover:bg-[#ff853c] text-white font-bold rounded-2xl shadow-xl shadow-[#fb731f]/20 transition-all hover:scale-105 active:scale-95 group">
                            Explore full curriculum
                            <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-2 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
      </section>

      {/* ─── Voices of Mastery (Testimonials) ─── */}
      <section className="py-24 lg:py-48 px-6 relative overflow-hidden bg-[#020203]">
        <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl mb-32 space-y-6 text-center mx-auto">
                <Badge className="bg-[#fb731f]/10 text-[#fb731f] border-[#fb731f]/20 font-bold px-4 py-1.5 rounded-full font-sans uppercase text-[10px]">Scholarly Success</Badge>
                <h2 className="text-5xl md:text-8xl font-serif font-black tracking-tight uppercase italic leading-none">Voices of Mastery.</h2>
                <p className="text-xl text-white/30 font-serif italic">Join a global community of scholars who have achieved fluency through our pedagogical framework.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((t, i) => (
                    <TestimonialCard key={i} t={t} index={i} isMobile={isMobile} />
                ))}
            </div>
        </div>
      </section>

      {/* ─── Interactive Pricing Portal ─── */}
      <section id="pricing" className="py-24 lg:py-48 px-6 relative overflow-hidden bg-gradient-to-b from-[#020203] to-[#050506]">
        {/* Cinematic Backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#fb731f]/5 blur-[200px] rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto text-center space-y-24 relative z-10">
            <div className="space-y-6">
                <Badge className="bg-[#fb731f]/10 text-[#fb731f] border-[#fb731f]/20 font-bold px-4 py-1.5 rounded-full font-sans uppercase text-[10px]">Enrollment Plans</Badge>
                <h2 className="text-5xl md:text-8xl font-serif font-black tracking-tight uppercase italic leading-[0.9]">Select Your Plan.</h2>
                <p className="text-xl text-white/30 font-serif italic max-w-xl mx-auto">Choose the tier that matches your academic ambition and unlock your full linguistic potential.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 text-left font-sans items-stretch">
                {/* Free Plan Card */}
                <motion.div
                    whileHover={{ y: -10 }}
                    onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        pricingX.set((e.clientX - rect.left) / rect.width - 0.5);
                        pricingY.set((e.clientY - rect.top) / rect.height - 0.5);
                    }}
                    onMouseLeave={() => { pricingX.set(0); pricingY.set(0); }}
                    style={{ 
                      rotateX: isMobile ? 0 : pricingRotateX, 
                      rotateY: isMobile ? 0 : pricingRotateY, 
                      transformStyle: "preserve-3d" 
                    }}
                    className="group h-full"
                >
                    <div className="h-full bg-white/[0.02] border border-white/5 rounded-[2.5rem] sm:rounded-[4rem] p-6 sm:p-12 space-y-8 sm:space-y-12 transition-all duration-500 group-hover:bg-white/[0.04] group-hover:border-white/10 backdrop-blur-3xl relative overflow-hidden">
                        <div className="space-y-4">
                            <h3 className="text-2xl sm:text-4xl font-serif font-black uppercase italic text-white/60">Foundation</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl sm:text-7xl font-black text-white/10 tracking-tighter uppercase leading-none">Free</span>
                                <span className="text-[10px] sm:text-sm font-bold text-white/20 uppercase">No Enrollment Fee</span>
                            </div>
                        </div>

                        <ul className="space-y-6">
                            {[
                                "25 Core Vocabulary Words",
                                "Universal Device Syncing",
                                "Basic AI Voice Feedback",
                                "Global Learner Profile"
                            ].map((t, i) => (
                                <motion.li 
                                    key={t}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-4 text-[14px] font-bold text-white/30 tracking-tight"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" /> {t}
                                </motion.li>
                            ))}
                        </ul>

                        <div className="pt-8">
                            <Link href="/signup" className="block">
                                <Button className="w-full h-20 rounded-3xl bg-white/5 text-white font-black uppercase tracking-tight text-sm hover:bg-white/10 border border-white/5 transition-all">
                                    Start learning
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Pro Plan Card (Focus State) */}
                <motion.div
                    whileHover={{ y: -15, scale: 1.02 }}
                    className="group relative"
                >
                    <motion.div 
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute inset-0 bg-[#fb731f]/20 blur-[100px] rounded-[4rem] -z-10"
                    />

                    <div className="h-full bg-white text-black rounded-[2.5rem] sm:rounded-[4rem] p-8 sm:p-12 space-y-8 sm:space-y-12 relative overflow-hidden shadow-[0_0_100px_rgba(251,115,31,0.2)]">
                        <motion.div 
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 pointer-events-none"
                        />

                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 relative z-10">
                            <div className="space-y-4">
                                <h3 className="text-2xl sm:text-4xl font-serif font-black uppercase italic">Professional</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl sm:text-7xl font-black text-[#fb731f] tracking-tighter leading-none">৳499</span>
                                    <span className="text-[10px] sm:text-sm font-bold text-black/40 uppercase">Lifetime</span>
                                </div>
                            </div>
                            <Badge className="bg-black text-white font-bold uppercase text-[9px] sm:text-[10px] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-sans shadow-lg">Most Popular</Badge>
                        </div>

                        <ul className="space-y-6 relative z-10">
                            {[
                                "Unlimited Vocabulary Access",
                                "Priority Learning Path",
                                "Advanced Progress Analytics",
                                "Unlimited Voice Practice",
                                "Future Updates Included",
                                "Elite Tier Status"
                            ].map((t, i) => (
                                <motion.li 
                                    key={t}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-4 text-[14px] font-bold text-black tracking-tight"
                                >
                                    <div className="w-5 h-5 rounded-full bg-[#fb731f] flex items-center justify-center shadow-lg">
                                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />
                                    </div>
                                    {t}
                                </motion.li>
                            ))}
                        </ul>

                        <div className="pt-6 sm:pt-8 relative z-10">
                            <Button 
                                onClick={handleUpgrade}
                                disabled={isRedirecting}
                                className="w-full h-16 sm:h-20 rounded-[1.5rem] sm:rounded-3xl bg-black text-white font-black uppercase tracking-tight text-sm hover:scale-[1.02] active:scale-[0.98] shadow-2xl transition-all group"
                            >
                                {isRedirecting ? "Connecting..." : (
                                    <span className="flex items-center justify-center gap-3">
                                        Enroll in Pro
                                        <Sparkles className="w-4 h-4 text-[#fb731f]" />
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-24 lg:py-40 px-6 text-center space-y-16 relative border-t border-white/5">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-10"
        >
            <h2 className="text-5xl sm:text-7xl md:text-9xl font-serif font-black tracking-tight text-white uppercase italic leading-none">MASTER WORDS.</h2>
            <p className="text-white/20 text-base sm:text-xl md:text-3xl font-serif font-black max-w-4xl mx-auto italic px-4">
                Join the most effective learning system for permanent word mastery.
            </p>
            <Link href="/signup" className="block sm:inline-block">
                <Button className="w-full sm:w-auto h-20 sm:h-24 px-12 sm:px-16 bg-[#fb731f] hover:bg-[#ff853c] text-white font-bold rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-[#fb731f]/30 transition-all hover:scale-105 active:scale-95 text-base sm:text-lg font-sans">
                    Get started now
                </Button>
            </Link>
        </motion.div>
      </section>

      {/* ─── Professional Global Network Footer ─── */}
      <footer className="pt-32 pb-8 px-6 lg:px-12 border-t border-white/5 bg-[#020203] relative overflow-hidden">
        {/* Faint Background Brand Anchor */}
        <div className="absolute -bottom-20 -right-20 pointer-events-none opacity-[0.02]">
            <BookMarked size={600} className="text-white" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24 mb-16 sm:mb-24">
                {/* Column 1: The Institute */}
                <div className="space-y-8">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-[#fb731f] flex items-center justify-center">
                            <BookMarked className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-serif font-black text-white tracking-tight uppercase italic leading-none">VocabVault</span>
                            <span className="text-[10px] font-bold text-white/20 uppercase leading-none mt-1 font-sans">by TechWisdom Technologies</span>
                        </div>
                    </Link>
                    <p className="text-sm text-white/30 font-serif italic leading-relaxed">
                        Dedicated to the advancement of linguistic mastery through scientific methodology and cognitive rigor. Join the global elite in vocabulary acquisition.
                    </p>
                    <div className="flex items-center gap-4">
                        {[
                            { icon: X, href: "#" },
                            { icon: Briefcase, href: "#" },
                            { icon: Camera, href: "#" },
                            { icon: Code, href: "#" }
                        ].map((social, i) => (
                            <motion.a 
                                key={i}
                                href={social.href}
                                whileHover={{ y: -5, scale: 1.1 }}
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-[#fb731f] hover:border-[#fb731f]/30 transition-all duration-300"
                            >
                                <social.icon size={18} />
                            </motion.a>
                        ))}
                    </div>
                </div>

                {/* Column 2: Curriculum */}
                <div className="space-y-8">
                    <h4 className="text-[11px] font-bold text-[#fb731f] uppercase tracking-[0.2em] font-sans">Curriculum</h4>
                    <ul className="space-y-4">
                        {["Word Introduction", "Sentence Practice", "Synonyms & Antonyms", "Memory Tests", "Fluency Mastery"].map(item => (
                            <li key={item}>
                                <Link href="#" className="text-sm text-white/30 hover:text-white transition-colors duration-300 font-medium group flex items-center gap-2">
                                    <span className="w-0 h-[1px] bg-[#fb731f] group-hover:w-4 transition-all duration-300" />
                                    {item}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Column 3: Resources */}
                <div className="space-y-8">
                    <h4 className="text-[11px] font-bold text-[#fb731f] uppercase tracking-[0.2em] font-sans">Resources</h4>
                    <ul className="space-y-4">
                        {["Academic Features", "Enrollment Plans", "Global Leaderboard", "Privacy Protocol", "Terms of Service"].map(item => (
                            <li key={item}>
                                <Link href="#" className="text-sm text-white/30 hover:text-white transition-colors duration-300 font-medium group flex items-center gap-2">
                                    <span className="w-0 h-[1px] bg-[#fb731f] group-hover:w-4 transition-all duration-300" />
                                    {item}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Column 4: Connect */}
                <div className="space-y-8">
                    <h4 className="text-[11px] font-bold text-[#fb731f] uppercase tracking-[0.2em] font-sans">Connect</h4>
                    <div className="space-y-6">
                        <div className="flex items-start gap-4 text-white/30 group cursor-pointer hover:text-white transition-colors">
                            <Mail className="w-5 h-5 text-[#fb731f]" />
                            <div className="space-y-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-white/10">Official Inquiries</p>
                                <p className="text-sm font-medium">official@techwisdom.site</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 text-white/30 group cursor-pointer hover:text-white transition-colors">
                            <Phone className="w-5 h-5 text-[#fb731f]" />
                            <div className="space-y-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-white/10">Voice Support</p>
                                <p className="text-sm font-medium">01799269699</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 text-white/30 group cursor-pointer hover:text-white transition-colors">
                            <Globe className="w-5 h-5 text-[#fb731f]" />
                            <div className="space-y-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-white/10">Digital Portal</p>
                                <p className="text-sm font-medium">www.techwisdom.site</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 text-white/30 group cursor-pointer hover:text-white transition-colors">
                            <MapPin className="w-5 h-5 text-[#fb731f]" />
                            <div className="space-y-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-white/10">Dhaka Headquarters</p>
                                <p className="text-sm font-medium leading-relaxed">158/Cha, Kuratoli Rd, Dhaka 1229</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-2 text-[10px] font-bold text-white/10 uppercase tracking-[0.3em] font-sans">
                    <Activity size={14} className="text-[#fb731f]" />
                    All Systems Operational
                </div>
                <div className="text-[10px] font-bold text-white/10 uppercase tracking-[0.3em] font-sans">
                    © {new Date().getFullYear()} VOCABVAULT • DEVELOPED BY TECHWISDOM TECHNOLOGIES
                </div>
                <div className="flex items-center gap-6">
                    <Shield size={18} className="text-white/10" />
                    <Sparkles size={18} className="text-white/10" />
                </div>
            </div>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        
        .font-serif {
          font-family: 'Lora', serif;
        }
        
        .stroke-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.2);
          color: transparent;
        }
      `}</style>
    </div>
  );
}
