"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  ShieldAlert,
  Monitor,
  Smartphone,
  Laptop,
  Loader2,
  Search,
  Filter,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Globe,
  MoreVertical,
  Fingerprint,
  XCircle,
  ShieldOff,
  Copy,
  MapPin,
  ChevronRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { formatDate, cn } from "@/lib/utils";

interface DeviceSession {
  id: string;
  deviceName: string;
  deviceType: string;
  os: string;
  ipAddress: string;
  locationCity: string | null;
  locationCountry: string | null;
  lastActive: string;
  userDeviceCount: number;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export default function AdminSecurityPage() {
  const { getAuthHeaders } = useAuthStore();
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [view, setView] = useState<"SESSIONS" | "AUDIT">("SESSIONS");

  const fetchSessions = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/admin/security", { headers });
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/admin/audit", { headers });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (view === "SESSIONS") fetchSessions();
    else fetchAuditLogs();
  }, [getAuthHeaders, view]);

  const handleTerminateSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to terminate this session? The user will be logged out on this device.")) return;

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/security/${sessionId}`, {
        method: "DELETE",
        headers
      });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      }
    } catch (error) {
      console.error("Failed to terminate session", error);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "mobile": return <Smartphone className="w-5 h-5" />;
      case "desktop": return <Monitor className="w-5 h-5" />;
      default: return <Laptop className="w-5 h-5" />;
    }
  };

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.user.name && s.user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.deviceName.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === "ALL") return matchesSearch;
    if (filter === "HIGH_RISK") return matchesSearch && s.userDeviceCount > 2;
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic leading-none">Access Intelligence</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
            <ShieldAlert className="w-3 h-3 text-rose-500" />
            Monitoring Real-time {view === "SESSIONS" ? "Device Fingerprints & Sessions" : "System Audit Trails & Events"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/5 border border-white/5">
            <Button
              onClick={() => setView("SESSIONS")}
              variant="ghost"
              className={`h-9 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === "SESSIONS" ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/20 hover:text-white'}`}
            >
              Sessions
            </Button>
            <Button
              onClick={() => setView("AUDIT")}
              variant="ghost"
              className={`h-9 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === "AUDIT" ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/20 hover:text-white'}`}
            >
              Audit Trail
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-48 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-xs font-black text-white/20 uppercase tracking-widest">Scanning Network Clusters...</p>
        </div>
      ) : view === "SESSIONS" ? (
        <>
          {filteredSessions.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center gap-6">
              <div className="w-20 h-20 rounded-[32px] bg-white/5 flex items-center justify-center border border-white/5">
                <CheckCircle2 className="w-10 h-10 text-white/10" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-black text-white uppercase italic">No Matches Found</h3>
                <p className="text-white/20 text-sm font-medium mt-1">Refine your search parameters or filters.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredSessions.map((session) => {
                const isHighRisk = session.userDeviceCount > 2;

                return (
                  <Card
                    key={session.id}
                    className={`bg-white/5 border-white/5 rounded-[32px] overflow-hidden transition-all duration-500 relative group ${isHighRisk ? 'hover:bg-rose-500/[0.03] border-rose-500/10 shadow-[0_0_40px_rgba(244,63,94,0.05)]' : 'hover:bg-white/[0.08]'}`}
                  >
                    {isHighRisk && (
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500 animate-pulse" />
                    )}

                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/5">
                        {/* User & Risk Status */}
                        <div className="flex-1 p-8 space-y-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${isHighRisk ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-white/10 text-white/20'}`}>
                                {session.user.name ? session.user.name[0].toUpperCase() : <Activity className="w-6 h-6" />}
                              </div>
                              <div className="space-y-1">
                                <h3 className={`text-lg font-black tracking-tight ${isHighRisk ? 'text-rose-500' : 'text-white'}`}>
                                  {session.user.name || "Stealth User"}
                                </h3>
                                <div className="text-xs text-white/30 font-medium flex items-center gap-2">
                                  <Fingerprint className="w-3 h-3" />
                                  {session.user.email}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <Badge className={`rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest border-0 ${isHighRisk ? 'bg-rose-500/20 text-rose-500 animate-pulse' : 'bg-white/5 text-white/40'}`}>
                              {session.userDeviceCount} Active Devices
                            </Badge>
                            {isHighRisk && (
                              <Badge className="bg-rose-500 text-white border-0 text-[10px] font-black uppercase tracking-widest px-3 py-1 flex items-center gap-1.5">
                                <AlertTriangle className="w-3 h-3" />
                                CRITICAL: Cluster Detected
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Device Details */}
                        <div className="flex-[1.5] p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                              <Monitor className="w-3 h-3" />
                              Device Signature
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                {getDeviceIcon(session.deviceType)}
                              </div>
                              <div>
                                <p className="text-sm font-black text-white">{session.deviceName}</p>
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{session.os}</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                              <Globe className="w-3 h-3" />
                              Network Location
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono text-xs border-white/10 text-white/60 bg-white/5 px-3 py-1 rounded-lg tracking-wider">
                                  {session.ipAddress}
                                </Badge>
                              </div>
                              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-primary" />
                                {session.locationCity || "Unknown City"}, {session.locationCountry || "Unknown Country"}
                              </p>
                              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1 flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                Last Pulse: {formatDate(session.lastActive)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-center p-8 bg-white/[0.01] lg:w-32 group-hover:bg-white/[0.03] transition-all">
                          <DropdownMenu>
                            <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "w-12 h-12 rounded-2xl bg-white/5 border border-white/5 text-white/20 hover:text-white hover:bg-white/10")}>
                              <MoreVertical className="w-5 h-5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 bg-[#0a0a0b] border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-xl">
                              <DropdownMenuGroup>
                                <DropdownMenuLabel className="text-[10px] font-black text-white/20 uppercase tracking-widest px-3 py-2">Security Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/5" />
                                <DropdownMenuItem
                                  onClick={() => {
                                    navigator.clipboard.writeText(session.ipAddress);
                                  }}
                                  className="rounded-xl hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-white/60 hover:text-white"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  Copy IP Address
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleTerminateSession(session.id)}
                                  className="rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-rose-500/60 hover:text-rose-500"
                                >
                                  <ShieldOff className="w-3.5 h-3.5" />
                                  Terminate Session
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          {auditLogs.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center gap-6">
              <div className="w-20 h-20 rounded-[32px] bg-white/5 flex items-center justify-center border border-white/5">
                <Fingerprint className="w-10 h-10 text-white/10" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-black text-white uppercase italic">Audit Trail Empty</h3>
                <p className="text-white/20 text-sm font-medium mt-1">No system events recorded in the current cycle.</p>
              </div>
            </div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center gap-6 group hover:bg-white/[0.04] transition-all">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 shrink-0 group-hover:border-primary/50 transition-colors">
                  <Activity className="w-5 h-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-black text-[8px] uppercase tracking-widest">
                      {log.actionType.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-[10px] text-white/20 font-black uppercase tracking-widest flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white/60 truncate">
                    <span className="text-white font-black">{log.user.name || log.user.email}</span> executed administrative mutation
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 text-white/20 hover:text-white">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
