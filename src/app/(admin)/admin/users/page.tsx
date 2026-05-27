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
  ArrowUpRight,
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
import Link from "next/link";
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

  const summary = {
    total: users.length,
    locked: users.filter((user) => user.isLocked).length,
    admins: users.filter((user) => user.role === "ADMIN").length,
    pro: users.filter((user) => user.plan === "PRO").length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">User Accounts</h1>
          <p className="text-white/40 text-sm max-w-2xl leading-relaxed">
            Review each user, check profile details, and manage locks or progress from one compact view.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" onClick={handleExportUsers} className="h-10 px-4 rounded-xl bg-white/5 border border-white/5 text-white/50 hover:text-white hover:border-white/10 text-[10px] font-black uppercase tracking-widest transition-all">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Link href="/dashboard">
            <Button variant="ghost" className="h-10 px-4 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Users", value: summary.total },
          { label: "Locked", value: summary.locked },
          { label: "Admins", value: summary.admins },
          { label: "PRO", value: summary.pro },
        ].map((item) => (
          <Card key={item.label} className="rounded-2xl border-white/5 bg-white/5">
            <CardContent className="p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/25">{item.label}</p>
              <p className="mt-2 text-3xl font-black text-white">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 bg-white/5 border border-white/5 rounded-xl pl-11 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>

        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-white/20">
          {filteredUsers.length} records
        </div>
      </div>

      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-xs font-black text-white/20 uppercase tracking-widest">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card className="rounded-3xl border-white/5 bg-white/5">
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-white/15 mx-auto" />
            <p className="mt-4 text-sm font-bold text-white/50">No users matched your search.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => {
            const isPro = user.plan === "PRO";
            return (
              <Card key={user.id} className="rounded-3xl border-white/5 bg-white/5 overflow-hidden">
                <CardContent className="p-6 lg:p-7 space-y-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black ${isPro ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-white/10 text-white/40"}`}>
                        {user.name ? user.name[0].toUpperCase() : <Users className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black text-white truncate">{user.name || "Anonymous"}</h3>
                          <Badge className={`${isPro ? "bg-amber-500/20 text-amber-500" : "bg-white/10 text-white/40"} border-0 text-[9px] font-black uppercase px-2`}>{user.plan}</Badge>
                          {user.role === "ADMIN" && <Badge className="bg-primary/20 text-primary border-0 text-[9px] font-black uppercase px-2">Admin</Badge>}
                          {user.isLocked && <Badge className="bg-rose-500/15 text-rose-400 border-0 text-[9px] font-black uppercase px-2">Locked</Badge>}
                        </div>
                        <p className="mt-1 text-sm text-white/40 flex items-center gap-2 break-all">
                          <Mail className="w-3.5 h-3.5" />
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start">
                      <DropdownMenu>
                        <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white")}>
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-[#0a0a0b] border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-xl">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-[10px] font-black text-white/20 uppercase tracking-widest px-3 py-2">Account Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/5" />
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)} className="rounded-xl hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-white/60 hover:text-white">
                              <Copy className="w-3.5 h-3.5" />
                              Copy User ID
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateUser(user, { resetProgress: true })} className="rounded-xl hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-white/60 hover:text-white">
                              <RefreshCw className="w-3.5 h-3.5" />
                              Reset Progress
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        onClick={() => {
                          if (user.isLocked) {
                            handleToggleLock(user);
                          } else {
                            setSelectedUser(user);
                            setBanReason("");
                          }
                        }}
                        className={`h-9 px-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${user.isLocked ? "bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-white border border-sky-500/20" : "bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20"}`}
                      >
                        {user.isLocked ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                        {user.isLocked ? "Unban" : "Ban"}
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-sm">
                    <div className="rounded-2xl bg-white/5 border border-white/5 p-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20 mb-1">Joined</p>
                      <p className="text-white/80 font-medium">{formatDate(user.createdAt)}</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 border border-white/5 p-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20 mb-1">Updated</p>
                      <p className="text-white/80 font-medium">{formatDate(user.updatedAt)}</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 border border-white/5 p-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20 mb-1">Progress</p>
                      <p className="text-white/80 font-medium">Score {user.totalScore} / Words {user.wordsLearned}</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 border border-white/5 p-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20 mb-1">Status</p>
                      <p className={`font-medium ${user.isLocked ? "text-rose-400" : "text-emerald-400"}`}>
                        {user.isLocked ? `Locked: ${user.lockReason || "No reason provided"}` : "Active"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/5 border border-white/5 p-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20 mb-1">Profession</p>
                      <p className="text-white/80 font-medium">{user.profession || "Not specified"}</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 border border-white/5 p-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20 mb-1">Nationality</p>
                      <p className="text-white/80 font-medium">{user.nationality || "Not specified"}</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 border border-white/5 p-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20 mb-1">Date of Birth</p>
                      <p className="text-white/80 font-medium">{user.dob || "Not provided"}</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 border border-white/5 p-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20 mb-1">Registration Reason</p>
                      <p className="text-white/80 font-medium">{user.reason || "Not provided"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Ban Reason Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
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
                  className="bg-white/5 border-white/10 rounded-2xl p-6 text-sm text-white focus:border-rose-500/50 min-h-30"
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
