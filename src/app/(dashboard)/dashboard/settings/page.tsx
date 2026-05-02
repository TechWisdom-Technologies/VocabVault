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
  Sparkles
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

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const headers = await getAuthHeaders();
        const [profileRes, devicesRes] = await Promise.all([
          fetch("/api/user/profile", { headers }),
          fetch("/api/user/devices", { headers }),
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
        if (devicesRes.ok) {
          const data = await devicesRes.json();
          setDevices(data.devices);
        }
      } catch (error) {
        console.error("Failed to fetch settings data", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchAll();
  }, [user, getAuthHeaders]);

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
    { id: "notifications", label: "Alerts", icon: Bell, desc: "Manage notifications" },
    { id: "appearance", label: "Theme", icon: Palette, desc: "Custom style & UI" },
    { id: "security", label: "Security", icon: Shield, desc: "Devices & auth" },
  ];

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
                    <Card className="border-border/50 shadow-xl rounded-3xl overflow-hidden border-t-emerald-500/20">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold uppercase tracking-tight">Guardian Hub</CardTitle>
                        <CardDescription className="font-medium">Active terminal sessions and device authorization</CardDescription>
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
                          devices.map((device) => {
                            const isCurrent = device.sessionToken === sessionToken;
                            return (
                              <div key={device.id} className="flex items-center justify-between p-5 rounded-2xl border border-border/50 bg-muted/10 group transition-all">
                                <div className="flex items-center gap-4">
                                  <div className={cn(
                                    "w-12 h-12 rounded-xl border flex items-center justify-center transition-all shadow-xs",
                                    isCurrent ? "bg-primary/5 border-primary/20 text-primary" : "bg-background border-border text-muted-foreground"
                                  )}>
                                    {getDeviceIcon(device.deviceType)}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-bold text-sm uppercase tracking-tight">{device.deviceName}</p>
                                      {isCurrent && <Badge className="bg-primary/10 text-primary border-none text-[9px] h-5 rounded-full px-2 font-bold uppercase">Current</Badge>}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-bold opacity-70 mt-1 uppercase">
                                      {device.os} • {device.ipAddress}
                                    </p>
                                  </div>
                                </div>
                                {!isCurrent && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-xl h-9 text-[10px] font-bold uppercase tracking-wider text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => revokeDevice(device.sessionToken)}
                                  >
                                    Revoke
                                  </Button>
                                )}
                              </div>
                            );
                          })
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
