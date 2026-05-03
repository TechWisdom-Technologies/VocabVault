"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Search,
  X,
  AlertCircle,
  Loader2,
  Mail,
  Calendar,
  Lock,
  Unlock,
  History,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MoreVertical,
  Copy,
  RefreshCw,
  Shield,
  Download
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { formatDate, cn } from "@/lib/utils";

interface AdminLog {
  id: string;
  action: string;
  reason: string;
  createdAt: string;
}

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  role: string;
  totalScore: number;
  wordsLearned: number;
  isLocked: boolean;
  lockReason: string | null;
  dob: string | null;
  nationality: string | null;
  profession: string | null;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
  logs: AdminLog[];
}

export default function AdminUsersPage() {
  const { getAuthHeaders } = useAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [banReason, setBanReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchUsers = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/admin/users", { headers });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [getAuthHeaders]);

  const handleToggleLock = async (user: AdminUser, reason?: string) => {
    try {
      setIsProcessing(true);
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          isLocked: !user.isLocked,
          lockReason: reason || null
        }),
      });

      if (res.ok) {
        await fetchUsers();
        setSelectedUser(null);
        setBanReason("");
      }
    } catch (error) {
      console.error("Failed to update user status", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateUser = async (user: AdminUser, updates: any) => {
    try {
      setIsProcessing(true);
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error("Failed to update user", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportUsers = () => {
    if (users.length === 0) return;
    const blob = new Blob([JSON.stringify(users, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `VocabVault_Users_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">User Accounts</h1>
            <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1 flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              Administrative control & account protocols
            </p>
          </div>
          
          <Button
            variant="ghost"
            onClick={handleExportUsers}
            className="h-10 px-5 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:border-white/10 text-[10px] font-black uppercase tracking-widest transition-all w-fit"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>

        <div className="relative group min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Filter by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-11 pr-6 py-3 text-sm font-medium text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-48 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-xs font-black text-white/20 uppercase tracking-widest">Accessing Vault Records...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 px-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="bg-white/5 border-white/5 rounded-[32px] overflow-hidden hover:bg-white/[0.07] transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left: Basic Info */}
                  <div className="flex-1 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${user.plan === 'PRO' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-white/10 text-white/40'}`}>
                        {user.name ? user.name[0].toUpperCase() : <Users className="w-6 h-6" />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-black text-white">{user.name || "Anonymous"}</h3>
                            <Badge className={`${user.plan === 'PRO' ? 'bg-amber-500/20 text-amber-500' : 'bg-white/10 text-white/40'} border-0 text-[9px] font-black uppercase px-2`}>{user.plan}</Badge>
                            {user.role === 'ADMIN' && (
                              <Badge className="bg-primary/20 text-primary border-0 text-[9px] font-black uppercase px-2">Admin</Badge>
                            )}
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white")}>
                              <MoreVertical className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-[#0a0a0b] border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-xl">
                              <DropdownMenuGroup>
                                <DropdownMenuLabel className="text-[10px] font-black text-white/20 uppercase tracking-widest px-3 py-2">Account Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/5" />
                                <DropdownMenuItem
                                  onClick={() => {
                                    navigator.clipboard.writeText(user.id);
                                  }}
                                  className="rounded-xl hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-white/60 hover:text-white"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  Copy User ID
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateUser(user, { resetProgress: true })}
                                  className="rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-rose-500/60 hover:text-rose-500"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  Reset Progress
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/40 font-medium">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
                      <div>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Profession</p>
                        <p className="text-sm font-bold text-white/80">{user.profession || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Location</p>
                        <p className="text-sm font-bold text-white/80">{user.nationality || "Unknown"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Score / Words</p>
                        <p className="text-sm font-black text-primary italic">{user.totalScore} / {user.wordsLearned}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: History/Timeline */}
                  <div className="flex-1 lg:border-l lg:border-white/5 lg:pl-8 space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                      <History className="w-3 h-3" />
                      Account Timeline
                    </div>

                    <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/5">
                      {/* Joined */}
                      <div className="flex items-start gap-4 relative">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center mt-1 z-10 border border-emerald-500/40">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">Joined VocabVault</p>
                          <p className="text-xs text-white/40 font-bold">{formatDate(user.createdAt)}</p>
                        </div>
                      </div>

                      {/* Recent Logs (Bans/Unbans) */}
                      {user.logs.slice(0, 3).map((log) => (
                        <div key={log.id} className="flex items-start gap-4 relative">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center mt-1 z-10 border ${log.action === 'LOCK_ACCOUNT' ? 'bg-rose-500/20 border-rose-500/40' : 'bg-sky-500/20 border-sky-500/40'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${log.action === 'LOCK_ACCOUNT' ? 'bg-rose-500' : 'bg-sky-500'}`} />
                          </div>
                          <div className="flex-1">
                            <p className={`text-[10px] font-black uppercase tracking-widest ${log.action === 'LOCK_ACCOUNT' ? 'text-rose-500' : 'text-sky-500'}`}>
                              {log.action === 'LOCK_ACCOUNT' ? 'Account Banned' : 'Access Restored'}
                            </p>
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-xs text-white/40 font-bold">{formatDate(log.createdAt)}</p>
                              <p className="text-[10px] text-white/20 font-medium italic truncate max-w-[200px]">"{log.reason}"</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Current Status if Banned but no logs show it (for transition) */}
                      {user.isLocked && user.logs.filter(l => l.action === 'LOCK_ACCOUNT').length === 0 && (
                        <div className="flex items-start gap-4 relative">
                          <div className="w-4 h-4 rounded-full bg-rose-500/20 flex items-center justify-center mt-1 z-10 border border-rose-500/40">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Currently Banned</p>
                            <p className="text-[10px] text-white/20 font-medium">Reason: {user.lockReason}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col justify-center gap-3 lg:w-48">
                    <Button
                      onClick={() => {
                        if (user.isLocked) {
                          handleToggleLock(user);
                        } else {
                          setSelectedUser(user);
                          setBanReason("");
                        }
                      }}
                      className={`w-full h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${user.isLocked ? 'bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white border border-sky-500/20' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20'}`}
                    >
                      {user.isLocked ? (
                        <><Unlock className="w-4 h-4 mr-2" /> Unban Account</>
                      ) : (
                        <><Lock className="w-4 h-4 mr-2" /> Ban Account</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Ban Reason Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <Card className="w-full max-w-lg bg-[#0a0a0b] border-white/10 rounded-[40px] shadow-2xl relative overflow-hidden">
            <CardContent className="p-10 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight uppercase italic">Confirm Ban</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white"
                  onClick={() => setSelectedUser(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-white/40 font-medium">
                  Reason for suspending <span className="text-white font-bold">{selectedUser.email}</span>:
                </p>
                <Textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Policy violation, suspicious activity, etc..."
                  className="bg-white/5 border-white/10 rounded-2xl p-6 text-sm text-white focus:border-rose-500/50 min-h-[120px]"
                />
              </div>

              <Button
                onClick={() => handleToggleLock(selectedUser, banReason)}
                disabled={isProcessing || !banReason.trim()}
                className="w-full h-14 rounded-2xl bg-rose-500 hover:bg-rose-500/90 text-white font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-95"
              >
                {isProcessing ? "Processing..." : "Ban Account Now"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
