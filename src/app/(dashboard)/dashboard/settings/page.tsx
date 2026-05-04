"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Monitor,
  Smartphone,
  Laptop,
  LogOut,
  ShieldCheck,
  User,
  ArrowLeft,
  Sun,
  Moon,
  SunMoon,
  Eye,
  Type,
  Zap,
  Loader2,
  Bell,
  Palette,
  Shield,
  CreditCard,
  ChevronRight,
  Globe,
  Mail,
  SmartphoneNfc,
  Sparkles,
  Clock
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { cn, formatDate } from "@/lib/utils";

import { auth } from "@/lib/firebase/client";
import { sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";
import { useAccessibilityStore } from "@/stores/accessibility-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

interface DeviceSession {
  id: string;
  sessionToken: string;
  deviceName: string;
  deviceType: "browser" | "mobile" | "desktop";
  os: string;
  lastActive: string;
  ipAddress: string;
  locationCity?: string;
  locationCountry?: string;
}

export default function SettingsPage() {
  const { user, sessionToken, getAuthHeaders } = useAuthStore();
  const [devices, setDevices] = useState<DeviceSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("account");

  const [notificationPreferences, setNotificationPreferences] = useState({
    streakReminders: true,
    weeklyDigest: false,
    productUpdates: true,
    securityAlerts: true,
    emailNewsletter: false,
  });
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const headers = await getAuthHeaders();
        const [profileRes, sessionsRes] = await Promise.all([
          fetch("/api/user/profile", { headers }),
          fetch("/api/user/sessions", { headers }),
        ]);
        if (profileRes.ok) {
          const data = await profileRes.json();
          setNotificationPreferences(data.notificationPreferences || {
            streakReminders: true,
            weeklyDigest: false,
            productUpdates: true,
            securityAlerts: true,
            emailNewsletter: false,
          });
        }
        if (sessionsRes.ok) {
          const data = await sessionsRes.json();
          setDevices(data.sessions);
        }
      } catch (error) {
        console.error("Failed to fetch settings data", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchAll();
  }, [user, getAuthHeaders]);

  const handleLogoutDevice = async (sessionId: string) => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/auth/session/remote-logout", {
        method: "POST",
        headers,
        body: JSON.stringify({ sessionId })
      });

      if (res.ok) {
        setDevices(prev => prev.filter(d => d.id !== sessionId));
      }
    } catch (e) {
      console.error("Failed to logout device", e);
    }
  };

  const togglePreference = (key: string) => {
    setNotificationPreferences(prev => ({ ...prev, [key]: !prev[key as keyof typeof notificationPreferences] }));
  };

  const revokeDevice = async (token: string) => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/user/devices", {
        method: "DELETE",
        headers,
        body: JSON.stringify({ sessionToken: token }),
      });
      if (res.ok) {
        setDevices((prev) => prev.filter((d) => d.sessionToken !== token));
      }
    } catch (error) {
      console.error("Failed to revoke device", error);
    }
  };

  const getDeviceIcon = (type: string) => {
    if (type === "mobile") return <Smartphone className="w-5 h-5" />;
    if (type === "desktop") return <Monitor className="w-5 h-5" />;
    return <Laptop className="w-5 h-5" />;
  };

  const tabs = [
    { id: "account", label: "Account", icon: User, desc: "Personal info & profile" },
    { id: "billing", label: "Billing", icon: CreditCard, desc: "Plan & subscription" },
    { id: "notifications", label: "Alerts", icon: Bell, desc: "Manage notifications" },
    { id: "appearance", label: "Theme", icon: Palette, desc: "Custom style & UI" },
    { id: "security", label: "Security", icon: Shield, desc: "Devices & auth" },
  ];

  const handleUpgrade = async () => {
    try {
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
    }
  };
  const handleManageBilling = async () => {
    try {
      setIsPortalLoading(true);
      const headers = await getAuthHeaders();
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers,
      });
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      } else {
        const data = await res.json();
        if (data.error === "Simulated Billing Portal") {
          alert("🛠️ Dev Mode: This is a simulated PRO account.\n\nTo see the REAL Stripe Billing Portal, please perform a test checkout using the 'Upgrade' button with a test card (4242...).");
        } else {
          alert(`Billing Error: ${data.error}\n\n${data.details || ""}`);
        }
      }
    } catch (error) {
      console.error("Failed to open billing portal", error);
      alert("An unexpected error occurred while connecting to the billing portal.");
    } finally {
      setIsPortalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 pb-20 overflow-hidden">
      {/* Background Polish */}
      <div className="absolute top-0 left-0 w-full h-64 bg-linear-to-b from-primary/5 to-transparent -z-10" />

      <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-primary/5 group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gradient">Preferences</h1>
              <p className="text-muted-foreground font-medium text-sm">Tune your linguistic environment</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative group overflow-hidden",
                  activeTab === tab.id
                    ? "bg-background shadow-lg shadow-primary/5 ring-1 ring-border/50 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                  activeTab === tab.id ? "bg-primary/10" : "bg-muted"
                )}>
                  <tab.icon className="w-5 h-5" />
                </div>
                <div className="text-left min-w-0">
                  <p className="font-bold text-sm uppercase tracking-wider">{tab.label}</p>
                  <p className="text-[10px] font-medium opacity-70 truncate">{tab.desc}</p>
                </div>
                <ChevronRight className={cn(
                  "w-4 h-4 ml-auto transition-transform",
                  activeTab === tab.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                )} />
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute left-0 top-0 w-1 h-full bg-primary"
                  />
                )}
              </button>
            ))}

            <div className="pt-6 mt-6 border-t border-border/50">
              <Button
                variant="ghost"
                className="w-full justify-start gap-4 p-4 h-auto rounded-2xl text-destructive hover:bg-destructive/5 hover:text-destructive transition-all"
                onClick={() => auth.signOut()}
              >
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <LogOut className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm uppercase tracking-wider">Sign Out</p>
                  <p className="text-[10px] font-medium opacity-70">End your current session</p>
                </div>
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {activeTab === "account" && (
                  <Card className="border-border/50 shadow-xl rounded-3xl overflow-hidden relative group border-t-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl font-bold uppercase tracking-tight">Identity Profile</CardTitle>
                      <CardDescription className="font-medium">Your digital presence across VocabVault</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 py-8">
                      <div className="flex flex-col sm:flex-row items-center gap-8">
                        <div className="relative">
                          <div className="absolute -inset-2 bg-linear-to-r from-primary to-violet-500 rounded-full opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
                          <Avatar className="w-28 h-28 border-4 border-background shadow-2xl relative">
                            <AvatarImage src={user?.avatarUrl || undefined} className="object-cover" />
                            <AvatarFallback className="text-3xl bg-linear-to-br from-primary to-violet-600 text-white font-bold">
                              {user?.name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 text-center sm:text-left space-y-2">
                          <div className="flex items-center justify-center sm:justify-start gap-3">
                            <h3 className="font-bold text-3xl tracking-tighter">{user?.name}</h3>
                            <Badge className="bg-primary/10 text-primary border-none px-3 h-6 text-[10px] font-bold uppercase tracking-wider">
                              {user?.plan}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground font-bold flex items-center justify-center sm:justify-start gap-2">
                            <Mail className="w-4 h-4" />
                            {user?.email}
                          </p>
                          <div className="pt-4">
                            <Link href="/dashboard/profile">
                              <Button className="rounded-2xl px-8 h-12 shadow-lg shadow-primary/20 hover:scale-105 transition-transform font-bold uppercase tracking-wider text-xs">
                                Edit Profile
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === "billing" && (
                  <Card className="border-border/50 shadow-xl rounded-3xl overflow-hidden border-t-emerald-500/20">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold uppercase tracking-tight">Subscription Hub</CardTitle>
                      <CardDescription className="font-medium">Manage your membership and linguistic privileges</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-10">
                      <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-muted/10 border border-border/50 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Current Membership</p>
                          <h3 className="text-2xl font-black tracking-tight flex items-center justify-center md:justify-start gap-3">
                            VocabVault {user?.plan}
                            {user?.plan === "PRO" && <Badge className="bg-emerald-500 text-white border-none">Active</Badge>}
                          </h3>
                        </div>
                        {user?.plan === "FREE" && (
                          <Button
                            onClick={handleUpgrade}
                            className="w-full md:w-auto h-12 px-8 rounded-xl bg-linear-to-r from-primary to-violet-600 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                          >
                            Upgrade to Lifetime PRO
                          </Button>
                        )}
                        {user?.plan === "PRO" && (
                          <Button
                            onClick={handleManageBilling}
                            disabled={isPortalLoading}
                            variant="outline"
                            className="w-full md:w-auto h-12 px-8 rounded-xl border-primary/30 hover:border-primary bg-background shadow-sm hover:shadow-primary/10 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 font-black uppercase tracking-widest text-[10px] transition-all group/btn relative overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                            {isPortalLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                            ) : (
                              <CreditCard className="w-3.5 h-3.5 mr-2 group-hover/btn:rotate-12 transition-transform" />
                            )}
                            Manage Subscription
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4 p-6 rounded-2xl border border-border/50 bg-background/50">
                          <h4 className="font-black text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                            Free Tier Limits
                          </h4>
                          <ul className="space-y-3">
                            {[
                              "5 New words per day",
                              "Basic AI feedback",
                              "Limited audio accents",
                              "Standard support"
                            ].map((feat, i) => (
                              <li key={i} className="text-xs font-medium flex items-center gap-2 text-muted-foreground">
                                <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
                                {feat}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-4 p-6 rounded-2xl border-2 border-primary/20 bg-primary/5 relative">
                          <div className="absolute -top-3 right-4 px-3 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">Recommended</div>
                          <h4 className="font-black text-xs uppercase tracking-widest text-primary flex items-center gap-2">
                            <Sparkles className="w-3 h-3" />
                            Pro privileges
                          </h4>
                          <ul className="space-y-3">
                            {[
                              "Unlimited daily words",
                              "Advanced neural AI evaluation",
                              "Full multi-accent audio engine",
                              "Priority executive support",
                              "Early access to new modules"
                            ].map((feat, i) => (
                              <li key={i} className="text-xs font-bold flex items-center gap-2 text-foreground">
                                <Sparkles className="w-3 h-3 text-primary" />
                                {feat}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {user?.plan === "PRO" && (
                        <div className="p-4 rounded-xl bg-muted/10 border border-dashed border-border/50 text-center">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">
                            You have Lifetime Access. No further payments are required.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {activeTab === "notifications" && (
                  <Card className="border-border/50 shadow-xl rounded-3xl overflow-hidden border-t-amber-500/20">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold uppercase tracking-tight">Notification Engine</CardTitle>
                      <CardDescription className="font-medium">Orchestrate your alert flow and engagement triggers</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { key: "streakReminders", label: "Momentum Nudges", desc: "Keep the fire alive with daily streak reminders.", icon: Zap },
                        { key: "weeklyDigest", label: "Strategic Digest", desc: "A comprehensive weekly report on your mastery evolution.", icon: Globe },
                        { key: "productUpdates", label: "Protocol Updates", desc: "New feature alerts and system improvements.", icon: Sparkles },
                        { key: "securityAlerts", label: "Vault Protection", desc: "Critical alerts regarding your account security.", icon: Shield },
                      ].map((item) => (
                        <div
                          key={item.key}
                          onClick={() => togglePreference(item.key)}
                          className="flex items-center justify-between p-5 rounded-2xl border border-border/50 bg-muted/10 hover:bg-muted/30 cursor-pointer transition-all group border-l-4 border-l-transparent hover:border-l-primary"
                        >
                          <div className="flex items-center gap-4 min-w-0 pr-4">
                            <div className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                              <item.icon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm uppercase tracking-tight">{item.label}</p>
                              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5 font-medium">{item.desc}</p>
                            </div>
                          </div>
                          <div className={cn(
                            "relative w-11 h-6 rounded-full transition-all shrink-0",
                            notificationPreferences[item.key as keyof typeof notificationPreferences] ? "bg-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]" : "bg-muted-foreground/30"
                          )}>
                            <motion.div
                              animate={{ x: notificationPreferences[item.key as keyof typeof notificationPreferences] ? 20 : 2 }}
                              className="absolute top-1 left-0 w-4 h-4 rounded-full bg-white shadow-md"
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {activeTab === "appearance" && (
                  <Card className="border-border/50 shadow-xl rounded-3xl overflow-hidden border-t-violet-500/20">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold uppercase tracking-tight">Environmental Aesthetics</CardTitle>
                      <CardDescription className="font-medium">Define your visual workspace and accessibility layer</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-10">
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Theme Selection</p>
                        <ThemeSwitcher />
                      </div>
                      <div className="pt-8 border-t border-border/50">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1 mb-4">Accessibility Layer</p>
                        <AccessibilityToggles />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === "security" && (
                  <div className="space-y-6">
                    <Card className="border-border/50 shadow-xl rounded-3xl overflow-hidden border-t-emerald-500/20 bg-background/50 backdrop-blur-md">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-xl font-black uppercase tracking-tight">Guardian Hub</CardTitle>
                          <CardDescription className="font-medium">Active terminal sessions and device authorization</CardDescription>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <ShieldCheck className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Active Protection</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {isLoading ? (
                          <div className="py-20 flex flex-col items-center gap-4">
                            <div className="relative">
                              <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse rounded-full" />
                              <Loader2 className="w-10 h-10 animate-spin text-primary relative z-10" />
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Scanning network...</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-4">
                            {devices.map((device) => {
                              const isCurrent = device.sessionToken === sessionToken;
                              return (
                                <motion.div
                                  key={device.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={cn(
                                    "flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl border transition-all relative group",
                                    isCurrent
                                      ? "bg-primary/5 border-primary/20 shadow-lg shadow-primary/5"
                                      : "bg-muted/10 border-border/50 hover:bg-muted/30"
                                  )}
                                >
                                  {isCurrent && (
                                    <div className="absolute top-0 right-0 p-3">
                                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[8px] font-black uppercase tracking-widest">Live Now</span>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-start gap-5">
                                    <div className={cn(
                                      "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                                      isCurrent ? "bg-primary text-white" : "bg-background border border-border"
                                    )}>
                                      {getDeviceIcon(device.deviceType)}
                                    </div>
                                    <div className="space-y-1.5">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-black text-base tracking-tight">{device.deviceName}</h4>
                                        {isCurrent && <Badge className="bg-primary/20 text-primary border-none text-[8px] h-4 rounded-full px-2 font-black uppercase">Current Session</Badge>}
                                      </div>

                                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                          <Monitor className="w-3 h-3" />
                                          <span className="text-[10px] font-bold uppercase tracking-wider">{device.os}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                          <Globe className="w-3 h-3" />
                                          <span className="text-[10px] font-bold uppercase tracking-wider">
                                            {device.ipAddress}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                          <Shield className="w-3 h-3" />
                                          <span className="text-[10px] font-bold uppercase tracking-wider">
                                            {device.locationCity && device.locationCountry
                                              ? `${device.locationCity}, ${device.locationCountry}`
                                              : "Geographic data pending..."
                                            }
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest pt-1">
                                        <Clock className="w-2.5 h-2.5" />
                                        Last active {new Date(device.lastActive).toLocaleString()}
                                      </div>
                                    </div>
                                  </div>

                                  {!isCurrent && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="mt-6 sm:mt-0 rounded-xl h-10 px-5 text-[10px] font-black uppercase tracking-[0.2em] text-destructive hover:text-destructive hover:bg-destructive/10 transition-all border border-transparent hover:border-destructive/20"
                                      onClick={() => handleLogoutDevice(device.id)}
                                    >
                                      Revoke Access
                                    </Button>
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-destructive/20 bg-destructive/5 rounded-3xl overflow-hidden border-t-destructive/40">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold uppercase tracking-tight text-destructive">Protocol Override</CardTitle>
                        <CardDescription className="font-medium">Reset security credentials and access tokens</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto h-12 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-white font-bold uppercase tracking-wider text-xs px-8"
                          onClick={async () => {
                            if (!auth.currentUser?.email) return;
                            setIsSendingReset(true);
                            try {
                              await sendPasswordResetEmail(auth, auth.currentUser.email);
                              alert("Check your email for the reset link.");
                            } catch (error) {
                              console.error(error);
                            } finally { setIsSendingReset(false); }
                          }}
                          disabled={isSendingReset}
                        >
                          {isSendingReset ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                          {isSendingReset ? "Processing..." : "Force Security Reset"}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Theme Switcher ─────────────────────────── */
function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="grid grid-cols-3 gap-3"><div className="h-20 rounded-2xl bg-muted/30 animate-pulse" /></div>;

  const options = [
    { value: "light", label: "Solar", icon: Sun, color: "bg-orange-500" },
    { value: "dark", label: "Obsidian", icon: Moon, color: "bg-indigo-600" },
    { value: "system", label: "Auto", icon: SunMoon, color: "bg-slate-500" },
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-4">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={cn(
              "flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all relative group",
              isActive
                ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5"
                : "border-border/50 hover:border-primary/30 hover:bg-muted/30 text-muted-foreground"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm",
              isActive ? opt.color + " text-white" : "bg-muted"
            )}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
            {isActive && (
              <motion.div
                layoutId="activeTheme"
                className="absolute inset-0 ring-2 ring-primary rounded-2xl"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Accessibility Toggles ──────────────────── */
function AccessibilityToggles() {
  const {
    screenReaderMode, toggleScreenReader,
    highContrast, toggleHighContrast,
    largeText, toggleLargeText,
    reducedMotion, toggleReducedMotion,
  } = useAccessibilityStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="space-y-3"><div className="h-16 rounded-2xl bg-muted/30 animate-pulse" /></div>;

  const toggles = [
    { label: "Neural Clarity", description: "Enhanced focus indicators and ARIA optimizations", checked: screenReaderMode, onToggle: toggleScreenReader, icon: Eye },
    { label: "High Definition", description: "Bolder contrast and strokes for visual precision", checked: highContrast, onToggle: toggleHighContrast, icon: Sun },
    { label: "Maximized Type", description: "Scaling interface typography for readability", checked: largeText, onToggle: toggleLargeText, icon: Type },
    { label: "Fluid Mode", description: "Minimizing kinetic energy and transitions", checked: reducedMotion, onToggle: toggleReducedMotion, icon: Zap },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {toggles.map((t) => {
        const Icon = t.icon;
        return (
          <label
            key={t.label}
            className={cn(
              "flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 cursor-pointer transition-all hover:shadow-md",
              t.checked
                ? "border-primary/30 bg-primary/5 ring-1 ring-primary/20"
                : "border-border/50 bg-muted/10 hover:bg-muted/30"
            )}
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                t.checked ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-tight">{t.label}</p>
                <p className="text-[10px] text-muted-foreground font-medium line-clamp-1">{t.description}</p>
              </div>
            </div>
            <div
              role="switch"
              aria-checked={t.checked}
              onClick={t.onToggle}
              className={cn(
                "relative w-11 h-6 rounded-full shrink-0 transition-colors cursor-pointer",
                t.checked ? "bg-primary" : "bg-muted-foreground/30"
              )}
            >
              <motion.div
                animate={{ x: t.checked ? 20 : 2 }}
                className="absolute top-1 left-0 w-4 h-4 rounded-full bg-white shadow-md"
              />
            </div>
          </label>
        );
      })}
    </div>
  );
}
