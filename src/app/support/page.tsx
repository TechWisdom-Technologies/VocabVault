"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import BrandLogo from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Globe,
  HelpCircle,
  LifeBuoy,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  AlertCircle,
  BookOpen,
  Headphones,
  ShieldAlert,
  Info,
  Search,
} from "lucide-react";

const contacts = [
  { icon: Mail, label: "Email", value: "official@techwisdom.site", href: "mailto:official@techwisdom.site" },
  { icon: Phone, label: "Phone", value: "01799269699", href: "tel:01799269699" },
  { icon: Globe, label: "Web", value: "www.techwisdom.site", href: "https://www.techwisdom.site" },
  { icon: MapPin, label: "Office", value: "Dhaka, Bangladesh", href: "https://maps.google.com/?q=Dhaka" },
];

const faqs = [
  {
    q: "How do I request an account review?",
    a: "Use the form below, choose General Support, and mention the account email. The system team receives it in the feedback panel.",
  },
  {
    q: "Why was my login blocked?",
    a: "Some accounts can be locked after repeated device or session checks. Support can review the case and handle it from the system side.",
  },
  {
    q: "Can I send bug reports here?",
    a: "Yes. Choose Bug Report and describe the issue clearly. Include the page, device, and what you expected to happen.",
  },
  {
    q: "Can I request a feature?",
    a: "Yes. Use Feature Request and explain the problem it solves. Short, direct suggestions are easiest to review.",
  },
  {
    q: "How fast will someone respond?",
    a: "Most requests are reviewed during business hours. Urgent account issues are prioritized first.",
  },
  {
    q: "What should I include in the message?",
    a: "Your account email, a short description, any error text, and what action you want from the system team.",
  },
  {
    q: "Will this reach the system panel?",
    a: "Yes. The form creates a support ticket in the system feedback inbox so the team can review it directly.",
  },
  {
    q: "Can I send stage feedback?",
    a: "Yes. Select Stage Feedback and mention the stage number and what happened while you were using it.",
  },
  {
    q: "Do I need to be logged in?",
    a: "No. The support form accepts your email so you can submit a ticket even when login is unavailable.",
  },
  {
    q: "What if I have multiple issues?",
    a: "Send one issue per ticket. That makes the system review faster and keeps the resolution clear.",
  },
  {
    q: "Can I update an existing request?",
    a: "Reply with the same email and reference the previous subject, or submit a new ticket if the issue changed.",
  },
];

const steps = [
  {
    title: "Submit Request",
    text: "Fill out the quick support form with your email, select a category, and describe the issue clearly.",
    badge: "01",
  },
  {
    title: "System Review",
    text: "Your ticket lands immediately in the system feedback inbox, where moderators prioritize and review it.",
    badge: "02",
  },
  {
    title: "Resolution",
    text: "System team resolves the issue, updates the status, and communicates back, maintaining a transparent resolution trail.",
    badge: "03",
  },
];

const categoryCards = [
  {
    key: "GENERAL",
    label: "General Help",
    note: "Account questions, access issues, or billing inquiries",
    icon: HelpCircle,
    color: "from-[#fb731f]/10 to-[#fb731f]/5 text-[#fb731f] border-[#fb731f]/20 hover:border-[#fb731f]/40",
    glowColor: "shadow-[#fb731f]/5",
    defaultSubject: "Account review request",
  },
  {
    key: "BUG_REPORT",
    label: "Bug Reports",
    note: "Broken screens, errors, or unexpected system behavior",
    icon: ShieldAlert,
    color: "from-rose-500/10 to-rose-500/5 text-rose-400 border-rose-500/20 hover:border-rose-500/40",
    glowColor: "shadow-rose-500/5",
    defaultSubject: "Bug Report: Issue encountered",
  },
  {
    key: "FEATURE_REQUEST",
    label: "Feature Ideas",
    note: "Suggestions for new vocabulary tools or workflow updates",
    icon: Sparkles,
    color: "from-amber-500/10 to-amber-500/5 text-amber-400 border-amber-500/20 hover:border-amber-500/40",
    glowColor: "shadow-amber-500/5",
    defaultSubject: "Feature Request: New idea",
  },
  {
    key: "STAGE_FEEDBACK",
    label: "Stage Feedback",
    note: "Notes about lessons, exercises, or speech activities",
    icon: BookOpen,
    color: "from-cyan-500/10 to-cyan-500/5 text-cyan-400 border-cyan-500/20 hover:border-cyan-500/40",
    glowColor: "shadow-cyan-500/5",
    defaultSubject: "Stage Feedback: Lesson review",
  },
];

const supportNotes = [
  {
    icon: BookOpen,
    title: "How to write a good ticket",
    text: "Submit one core issue per ticket and include the exact email tied to your VocabVault account.",
    gradient: "from-[#fb731f]/10 to-[#fb731f]/5",
  },
  {
    icon: Headphones,
    title: "Where tickets go",
    text: "Every submission is pushed instantly to the system feedback dashboard for real-time review.",
    gradient: "from-[#fb731f]/10 to-[#fb731f]/5",
  },
  {
    icon: ShieldAlert,
    title: "Lock or access help",
    text: "If your login is blocked, submit a ticket here. The team can manually unlock and review accounts.",
    gradient: "from-rose-500/10 to-rose-500/5",
  },
  {
    icon: Info,
    title: "What gets faster replies",
    text: "Short, specific requests specifying precise stages or error messages are resolved quickest.",
    gradient: "from-cyan-500/10 to-cyan-500/5",
  },
];

export default function SupportPage() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Account review request");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  // Client-side FAQ search query
  const [faqSearch, setFaqSearch] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, category, subject, message }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit support request");
      }

      setStatus("success");
      setEmail("");
      setSubject("Account review request");
      setMessage("");
      setCategory("GENERAL");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to submit support request");
    }
  };

  // Helper to handle interactive quick-link selection and auto-scroll
  const handleCategorySelect = (catKey: string, defaultSub: string) => {
    setCategory(catKey);
    setSubject(defaultSub);
    
    const element = document.getElementById("support-form-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        const emailField = document.getElementById("email");
        if (emailField) emailField.focus();
      }, 850);
    }
  };

  // Live filter for FAQs
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    /* h-screen and overflow-y-auto to allow scrolling inside container while hiding scrollbar completely */
    <div className="h-screen overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-[#020203] text-white selection:bg-[#fb731f]/30 relative font-sans">
      
      {/* Premium ambient light glowing blobs from Home Page */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[#fb731f]/5 blur-[180px] rounded-full pointer-events-none opacity-50" />
      <div className="absolute bottom-0 left-0 w-full h-[400px] bg-gradient-to-t from-[#fb731f]/5 to-transparent pointer-events-none" />

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <section className="relative px-4 py-8 sm:px-6 lg:py-12 max-w-7xl mx-auto space-y-12 z-10">
        
        {/* Sleek Floating Glass Navigation Bar (matching Home Page layout styling) */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between gap-4 rounded-3xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 backdrop-blur-2xl shadow-[0_16px_50px_rgba(0,0,0,0.4)]"
        >
          <Link href="/" className="flex items-center gap-3 group">
            <BrandLogo className="w-11 h-11 rounded-2xl transition-transform duration-500 group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-serif font-black tracking-tight text-white uppercase italic leading-none">VocabVault</span>
              <span className="text-[8px] sm:text-[10px] font-bold text-white/20 uppercase leading-none mt-1 font-sans">by TechWisdom Technologies</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Badge className="hidden sm:inline-flex bg-[#fb731f]/10 text-[#fb731f] border border-[#fb731f]/20 text-[9px] font-bold uppercase px-2.5 py-1 tracking-wider rounded-lg">
              No Login Required
            </Badge>
            <Link href="/">
              <Button className="h-10 px-5 rounded-2xl bg-[#fb731f] hover:bg-[#ff853c] text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#fb731f]/20 transition-all duration-300 active:scale-95">
                Home
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto py-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#fb731f]/20 bg-[#fb731f]/5 px-3 py-1 text-xs text-[#fb731f] font-bold uppercase tracking-wider mb-2 font-sans"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Always Active Help Center
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-serif font-black uppercase italic leading-[0.9] tracking-tight text-white"
          >
            How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fb731f] via-[#ff853c] to-white">help you today?</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-white/40 leading-relaxed font-serif italic"
          >
            Need access help, found a bug, or want to suggest features? Pick a category below to pre-fill a ticket, search our knowledge base, or message our system team directly.
          </motion.p>
        </div>

        {/* Visual Category Navigation Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {categoryCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + idx * 0.05 }}
                onClick={() => handleCategorySelect(card.key, card.defaultSubject)}
                className={`group cursor-pointer relative p-6 rounded-[2.5rem] border bg-white/[0.01] backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between ${card.color} ${card.glowColor}`}
              >
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                    <Icon className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-black text-white group-hover:text-[#fb731f] transition-colors uppercase tracking-tight italic">
                      {card.label}
                    </h3>
                    <p className="mt-1.5 text-xs text-white/40 leading-relaxed font-medium">
                      {card.note}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-white/20 group-hover:text-white/80 transition-colors">
                  <span>Start ticket</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Grid: Ticket Form & Timeline/Info */}
        <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr] items-start" id="support-form-section">
          
          {/* Support Request Form Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="rounded-[2.5rem] border-white/[0.08] bg-white/[0.02] backdrop-blur-3xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.5)] relative group/form">
              {/* Animated corner orange-to-indigo shine */}
              <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-br from-[#fb731f]/10 via-transparent to-transparent pointer-events-none" />
              
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-black text-[#fb731f]">
                    <LifeBuoy className="w-3.5 h-3.5 text-[#fb731f]" />
                    Support Request Form
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-black uppercase italic tracking-tight text-white leading-none">
                    Submit a support ticket
                  </h2>
                  <p className="text-xs text-white/40 font-medium">
                    No authentication required. Provide your VocabVault account email to dispatch feedback directly.
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {status === "success" && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100 flex items-center gap-3 shadow-lg shadow-emerald-500/5"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce" />
                      <div>
                        <p className="font-bold text-emerald-300">Ticket Submitted Successfully!</p>
                        <p className="text-xs text-emerald-100/70 mt-0.5">Your ticket is saved in the system feedback inbox. Our team will review it soon.</p>
                      </div>
                    </motion.div>
                  )}

                  {status === "error" && error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100 flex items-center gap-3 shadow-lg shadow-rose-500/5"
                    >
                      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      <div>
                        <p className="font-bold text-rose-300">Submission Failed</p>
                        <p className="text-xs text-rose-100/70 mt-0.5">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block">Account Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-4 h-4 text-white/30 group-focus-within/form:text-[#fb731f] transition-colors" />
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="h-12 pl-11 rounded-2xl bg-white/[0.03] border-white/[0.08] hover:border-white/[0.15] text-white placeholder:text-white/20 focus:bg-white/[0.05] focus:border-[#fb731f]/50 transition-all font-medium text-sm outline-none" 
                        placeholder="you@example.com" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block">Request Category</Label>
                      <select 
                        id="category" 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)} 
                        className="h-12 w-full rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] px-4 text-sm text-white font-medium outline-none focus:border-[#fb731f]/50 focus:bg-white/[0.05] transition-all cursor-pointer appearance-none"
                      >
                        <option value="GENERAL" className="bg-[#0c0a17] text-white">General Support</option>
                        <option value="BUG_REPORT" className="bg-[#0c0a17] text-white">Bug Report</option>
                        <option value="FEATURE_REQUEST" className="bg-[#0c0a17] text-white">Feature Request</option>
                        <option value="STAGE_FEEDBACK" className="bg-[#0c0a17] text-white">Stage Feedback</option>
                        <option value="OTHER" className="bg-[#0c0a17] text-white">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block">Ticket Subject</Label>
                      <Input 
                        id="subject" 
                        value={subject} 
                        onChange={(e) => setSubject(e.target.value)} 
                        className="h-12 rounded-2xl bg-white/[0.03] border-white/[0.08] hover:border-white/[0.15] text-white placeholder:text-white/20 focus:bg-white/[0.05] focus:border-[#fb731f]/50 transition-all font-medium text-sm outline-none" 
                        placeholder="Brief summary of request" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block">Message Details</Label>
                    <Textarea 
                      id="message" 
                      value={message} 
                      onChange={(e) => setMessage(e.target.value)} 
                      className="min-h-[160px] rounded-2xl bg-white/[0.03] border-white/[0.08] hover:border-white/[0.15] text-white placeholder:text-white/20 focus:bg-white/[0.05] focus:border-[#fb731f]/50 transition-all font-medium text-sm leading-relaxed p-4 outline-none resize-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" 
                      placeholder="Explain your request in detail. If applicable, specify the staging task, browser info, or stage numbers involved..." 
                      required 
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={status === "sending"} 
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#fb731f] to-[#ff853c] hover:from-[#ff853c] hover:to-[#fb731f] text-white font-black uppercase tracking-widest text-[10px] shadow-[0_16px_40px_rgba(251,115,31,0.2)] hover:shadow-[0_20px_45px_rgba(251,115,31,0.3)] transition-all duration-500 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer border-0"
                  >
                    {status === "sending" ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending Ticket...
                      </span>
                    ) : (
                      <>
                        Send Support Request
                        <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover/form:translate-x-1" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stepper Timeline & Support SLA Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-6"
          >
            {/* Timeline Stepper Card */}
            <Card className="rounded-[2.5rem] border-white/[0.08] bg-white/[0.02] backdrop-blur-3xl p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">Step-by-Step</p>
                <h3 className="text-xl font-serif font-black uppercase italic text-white tracking-tight">Ticket Lifecycle</h3>
              </div>

              <div className="relative pl-6 space-y-8 border-l border-white/[0.08] ml-3">
                {steps.map((step, idx) => (
                  <div key={step.title} className="relative group/step">
                    {/* Glowing outer circle indicator */}
                    <div className="absolute -left-[35px] top-0 w-6 h-6 rounded-full bg-[#020203] border-2 border-[#fb731f]/50 flex items-center justify-center text-[9px] font-black text-[#fb731f] transition-all duration-300 group-hover/step:border-[#fb731f] group-hover/step:shadow-[0_0_15px_rgba(251,115,31,0.4)]">
                      {step.badge}
                    </div>
                    <div>
                      <h4 className="text-sm font-serif font-black uppercase text-white group-hover/step:text-[#fb731f] transition-colors tracking-tight">
                        {step.title}
                      </h4>
                      <p className="mt-1 text-xs text-white/40 leading-relaxed font-medium">
                        {step.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Core Guidelines Card Grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              {supportNotes.map((note, idx) => {
                const Icon = note.icon;
                return (
                  <div 
                    key={note.title} 
                    className={`rounded-[2rem] border border-white/[0.06] bg-white/[0.01] backdrop-blur-md p-5 space-y-3 hover:border-[#fb731f]/30 transition-all duration-500 hover:-translate-y-0.5 shadow-md hover:shadow-xl bg-gradient-to-br ${note.gradient}`}
                  >
                    <div className="w-9 h-9 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#fb731f]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-serif font-black uppercase tracking-tight text-white">{note.title}</p>
                      <p className="text-[10px] text-white/40 leading-relaxed font-medium">{note.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Availability SLA Cards */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] backdrop-blur-md p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#fb731f] shrink-0" />
                  <p className="text-xs font-serif font-black uppercase text-white tracking-tight">Support Hours</p>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed font-semibold">Sun to Thu, 10:00 AM – 7:00 PM (GMT+6)</p>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] backdrop-blur-md p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#fb731f] shrink-0" />
                  <p className="text-xs font-serif font-black uppercase text-white tracking-tight">System Action</p>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed font-semibold">Tickets are safely forwarded to system dashboard logs.</p>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] backdrop-blur-md p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#fb731f] shrink-0" />
                  <p className="text-xs font-serif font-black uppercase text-white tracking-tight">Coverage</p>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed font-semibold">Covers account access requests, bug logs, feature ideas, and staging input.</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Client-Side FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="rounded-[2.5rem] border-white/[0.08] bg-white/[0.02] backdrop-blur-3xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
            <CardContent className="p-6 sm:p-8 space-y-6">
              
              {/* FAQ Section Header with live search input */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-black text-[#fb731f]">
                    <HelpCircle className="w-3.5 h-3.5 text-[#fb731f]" />
                    Interactive Knowledge Base
                  </div>
                  <h3 className="text-2xl font-serif font-black uppercase italic text-white tracking-tight">
                    Frequently Asked Questions
                  </h3>
                </div>

                {/* FAQ Search bar */}
                <div className="relative max-w-sm w-full">
                  <Search className="absolute left-4 top-3.5 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    placeholder="Search standard questions..."
                    className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.12] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb731f]/50 transition-all font-medium"
                  />
                  {faqSearch && (
                    <button 
                      onClick={() => setFaqSearch("")}
                      className="absolute right-3 top-3 text-[10px] uppercase font-black tracking-widest text-white/30 hover:text-white/70 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Filtering FAQs display */}
              <AnimatePresence mode="popLayout">
                {filteredFaqs.length > 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Accordion multiple defaultValue={[faqs[0].q]} className="space-y-3">
                      {filteredFaqs.map((faq, index) => {
                        const originalIndex = faqs.findIndex(f => f.q === faq.q) + 1;
                        return (
                          <AccordionItem 
                            key={faq.q} 
                            value={faq.q} 
                            className="rounded-[2rem] border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.03] hover:border-[#fb731f]/30 transition-all duration-300 overflow-hidden"
                          >
                            <AccordionHeader>
                              <AccordionTrigger className="px-5 py-4 text-white/95 hover:text-[#fb731f] transition-colors font-serif font-black uppercase tracking-tight italic select-none">
                                <span className="flex items-center gap-3.5 min-w-0">
                                  <span className="w-8 h-8 rounded-xl bg-[#fb731f]/10 border border-[#fb731f]/20 flex items-center justify-center text-[10px] font-black text-[#fb731f] shrink-0">
                                    {originalIndex < 10 ? `0${originalIndex}` : originalIndex}
                                  </span>
                                  <span className="truncate pr-4">{faq.q}</span>
                                </span>
                              </AccordionTrigger>
                            </AccordionHeader>
                            <AccordionPanel className="px-5 pb-5 pt-1 text-xs sm:text-sm text-white/50 leading-relaxed font-medium pl-[60px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                              {faq.a}
                            </AccordionPanel>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="py-12 text-center space-y-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white/20 mx-auto">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-white/70 font-serif">No matching questions found</p>
                      <p className="text-xs text-white/40 max-w-xs mx-auto">Try refining your keyword search, or feel free to submit a support request directly above!</p>
                    </div>
                    <Button 
                      onClick={() => setFaqSearch("")}
                      className="h-8 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-bold uppercase tracking-widest text-[9px] border border-white/5 cursor-pointer"
                    >
                      Reset Search
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Contact Details tactile Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="space-y-4"
        >
          <div className="text-center space-y-1 max-w-sm mx-auto">
            <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] font-black text-[#fb731f]">
              <Globe className="w-3.5 h-3.5 text-[#fb731f]" />
              Direct Contacts
            </div>
            <h3 className="text-lg font-serif font-black uppercase text-white tracking-tight italic">
              Connect With Us Directly
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {contacts.map((item, idx) => {
              const Icon = item.icon;
              return (
                <a 
                  key={item.label} 
                  href={item.href} 
                  target={item.href.startsWith("http") ? "_blank" : undefined} 
                  rel={item.href.startsWith("http") ? "noreferrer" : undefined} 
                  className="rounded-[2rem] border border-white/[0.06] bg-white/[0.01] backdrop-blur-md p-5 hover:bg-white/[0.03] hover:border-[#fb731f]/30 hover:-translate-y-1 transition-all duration-500 group flex items-start gap-4"
                >
                  <div className="w-11 h-11 rounded-2xl bg-[#fb731f]/10 border border-[#fb731f]/20 flex items-center justify-center text-[#fb731f] group-hover:scale-105 transition-transform duration-300 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/30">{item.label}</p>
                    <p className="mt-1 text-sm font-bold text-white/80 group-hover:text-white transition-colors tracking-tight font-sans">{item.value}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </motion.div>

      </section>
    </div>
  );
}
