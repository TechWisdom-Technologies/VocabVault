"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
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
    a: "Use the form below, choose General Support, and mention the account email. The admin team receives it in the feedback panel.",
  },
  {
    q: "Why was my login blocked?",
    a: "Some accounts can be locked after repeated device or session checks. Support can review the case and handle it from the admin side.",
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
    a: "Your account email, a short description, any error text, and what action you want from the admin team.",
  },
  {
    q: "Will this reach the admin panel?",
    a: "Yes. The form creates a support ticket in the admin feedback inbox so the team can review it directly.",
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
    a: "Send one issue per ticket. That makes the admin review faster and keeps the resolution clear.",
  },
  {
    q: "Can I update an existing request?",
    a: "Reply with the same email and reference the previous subject, or submit a new ticket if the issue changed.",
  },
];

const steps = [
  {
    title: "Submit",
    text: "Fill the form with your email, pick a category, and explain the issue in plain language.",
  },
  {
    title: "Review",
    text: "The ticket appears in the admin feedback inbox where it can be checked, filtered, and sorted.",
  },
  {
    title: "Resolve",
    text: "The admin handles the request, updates status, and keeps the internal review trail organized.",
  },
];

const quickLinks = [
  { label: "General Help", note: "Account questions, access issues, billing notes" },
  { label: "Bug Reports", note: "Broken screens, errors, unexpected behavior" },
  { label: "Feature Requests", note: "Ideas for new tools or workflow improvements" },
  { label: "Stage Feedback", note: "Notes about a lesson, stage, or activity" },
];

const supportNotes = [
  { icon: BookOpen, title: "How to write a good ticket", text: "Write one issue per message and include the email tied to the account." },
  { icon: Headphones, title: "Where tickets go", text: "Every submission lands in the admin feedback inbox for review and follow-up." },
  { icon: ShieldAlert, title: "Lock or access help", text: "If login is blocked, use the form anyway. The team can review the account manually." },
  { icon: Info, title: "What gets faster replies", text: "Short, specific requests with exact error text are the easiest to resolve." },
];

const contactRows = [
  [
    { label: "Support email", value: "official@techwisdom.site", href: "mailto:official@techwisdom.site" },
    { label: "Phone", value: "01799269699", href: "tel:01799269699" },
  ],
  [
    { label: "Website", value: "www.techwisdom.site", href: "https://www.techwisdom.site" },
    { label: "Office", value: "Dhaka, Bangladesh", href: "https://maps.google.com/?q=Dhaka" },
  ],
];

export default function SupportPage() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Account review request");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-[#020203] text-white selection:bg-[#fb731f]/30">
      <section className="px-5 py-6 sm:px-6 lg:py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between gap-4 rounded-[28px] border border-white/5 bg-white/5 px-4 py-3 backdrop-blur-xl">
            <Link href="/" className="flex items-center gap-3 group">
              <BrandLogo className="w-11 h-11 rounded-xl transition-transform duration-300 group-hover:scale-105" />
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-black uppercase italic leading-none tracking-tight">VocabVault</span>
                <span className="text-[9px] sm:text-[10px] font-black text-white/25 uppercase tracking-[0.25em] mt-1">Support Center</span>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <Badge className="hidden sm:inline-flex bg-primary/10 text-primary border-0 text-[9px] font-black uppercase px-2 py-1">No login required</Badge>
              <Link href="/">
                <Button className="h-10 px-4 rounded-xl bg-[#fb731f] hover:bg-[#ff853c] text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#fb731f]/20">
                  Home
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] items-start">
            <Card className="rounded-[34px] border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.35)] relative">
              <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-br from-[#fb731f]/10 via-transparent to-transparent pointer-events-none" />
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="grid gap-6 lg:grid-cols-[1fr_0.72fr] items-start">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-black text-white/25">
                      <LifeBuoy className="w-3.5 h-3.5 text-primary" />
                      Help, contact, and tickets
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black uppercase italic leading-none tracking-tight max-w-2xl">
                      A support page that feels like the product.
                    </h1>
                    <p className="text-sm sm:text-base text-white/45 leading-relaxed max-w-2xl">
                      Contact info, support notes, ticket workflow, and a polished request form live together on one page so users do not have to hunt around.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-primary/10 text-primary border-0 text-[9px] font-black uppercase px-2 py-1">No login required</Badge>
                      <Badge className="bg-white/10 text-white/60 border-0 text-[9px] font-black uppercase px-2 py-1">Admin review inbox</Badge>
                      <Badge className="bg-white/10 text-white/60 border-0 text-[9px] font-black uppercase px-2 py-1">11 FAQs</Badge>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-black/20 p-5 space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/20">Contact snapshot</p>
                    {contactRows.flat().map((item) => (
                      <a key={item.label} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noreferrer" : undefined} className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 hover:bg-white/10 transition-all">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20">{item.label}</p>
                          <p className="mt-1 text-sm font-bold text-white/80">{item.value}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-white/20" />
                      </a>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {contacts.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a key={item.label} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noreferrer" : undefined} className="rounded-2xl border border-white/10 bg-black/20 p-4 hover:bg-white/10 transition-all">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">{item.label}</p>
                            <p className="mt-1 text-sm font-bold text-white/80">{item.value}</p>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {quickLinks.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm font-black text-white">{item.label}</p>
                      <p className="mt-1 text-xs text-white/45 leading-relaxed">{item.note}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {steps.map((step, index) => (
                    <div key={step.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20">Step {index + 1}</p>
                      <p className="mt-2 text-sm font-black text-white">{step.title}</p>
                      <p className="mt-2 text-xs text-white/45 leading-relaxed">{step.text}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {supportNotes.map((note) => {
                    const Icon = note.icon;
                    return (
                      <div key={note.title} className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-2">
                        <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                          <Icon className="w-4 h-4" />
                        </div>
                        <p className="text-sm font-black text-white">{note.title}</p>
                        <p className="text-xs text-white/45 leading-relaxed">{note.text}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 flex items-start gap-3">
                    <Clock className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-black text-white">Hours</p>
                      <p className="text-xs text-white/45">Sunday to Thursday, 10:00 AM to 7:00 PM</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-black text-white">Admin review</p>
                      <p className="text-xs text-white/45">Tickets are stored in the feedback inbox for review</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 flex items-start gap-3">
                    <MessageSquare className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-black text-white">Response type</p>
                      <p className="text-xs text-white/45">Account help, bug fixes, feature ideas, and stage issues</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[34px] border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
              <CardContent className="p-6 sm:p-8 space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-black text-white/25">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Submit a ticket
                  </div>
                  <p className="text-sm text-white/45">No login required. The form is designed to feel quick, calm, and complete.</p>
                </div>

                {status === "success" && (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100 flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Ticket sent to the admin feedback inbox.
                  </div>
                )}

                {status === "error" && error && (
                  <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100 flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.25em] text-white/25">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/20" placeholder="you@example.com" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-[0.25em] text-white/25">Category</Label>
                    <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="h-12 w-full rounded-2xl bg-white/5 border border-white/10 px-4 text-sm text-white outline-none">
                      <option value="GENERAL">General Support</option>
                      <option value="BUG_REPORT">Bug Report</option>
                      <option value="FEATURE_REQUEST">Feature Request</option>
                      <option value="STAGE_FEEDBACK">Stage Feedback</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-[10px] font-black uppercase tracking-[0.25em] text-white/25">Subject</Label>
                    <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="h-12 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/20" placeholder="What do you need help with?" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-[10px] font-black uppercase tracking-[0.25em] text-white/25">Message</Label>
                    <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-44 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/20" placeholder="Describe the issue, what you need, and any error text." required />
                  </div>

                  <Button type="submit" disabled={status === "sending"} className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] shadow-[0_18px_40px_rgba(0,0,0,0.25)]">
                    {status === "sending" ? "Sending..." : "Send Request"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] items-start">
            <Card className="rounded-[34px] border-white/10 bg-white/5">
              <CardContent className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/25">
                  <HelpCircle className="w-3.5 h-3.5 text-primary" />
                  Frequently asked questions
                </div>
                <Accordion multiple defaultValue={[faqs[0].q]} className="space-y-3">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={faq.q} value={faq.q} className="rounded-[26px] border-white/10 bg-black/20">
                      <AccordionHeader>
                        <AccordionTrigger className="px-5 py-4 text-white/90 hover:text-white data-panel-open:text-[#fb731f]">
                          <span className="flex items-center gap-3 min-w-0">
                            <span className="w-8 h-8 rounded-2xl bg-primary/10 border border-primary/10 flex items-center justify-center text-[10px] font-black text-primary shrink-0">
                              {index + 1}
                            </span>
                            <span className="truncate">{faq.q}</span>
                          </span>
                        </AccordionTrigger>
                      </AccordionHeader>
                      <AccordionPanel className="px-5 pb-5 pt-0 text-sm text-white/45 leading-relaxed">
                        {faq.a}
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <Card className="rounded-[34px] border-white/10 bg-white/5">
              <CardContent className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/25">
                  <LifeBuoy className="w-3.5 h-3.5 text-primary" />
                  Contact details
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {contacts.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a key={item.label} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noreferrer" : undefined} className="rounded-2xl border border-white/10 bg-black/20 p-4 hover:bg-white/10 transition-all">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">{item.label}</p>
                            <p className="mt-1 text-sm font-bold text-white/80">{item.value}</p>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
