"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  ArrowLeft, 
  Camera, 
  Phone, 
  Globe, 
  Briefcase, 
  Target, 
  Calendar as CalendarIcon,
  Flame,
  Award,
  Clock,
  ShieldCheck,
  Zap,
  Loader2,
  Mail,
  Settings2,
  LogOut
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { user, getAuthHeaders, setUser, logout } = useAuthStore();
  const [fullProfile, setFullProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit states
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newNationality, setNewNationality] = useState("");
  const [newProfession, setNewProfession] = useState("");
  const [newReason, setNewReason] = useState("");
  const [newDob, setNewDob] = useState("");
  const [newAvatar, setNewAvatar] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/user/profile", { headers });
        if (res.ok) {
          const data = await res.json();
          setFullProfile(data);
          setNewName(data.name || "");
          setNewPhone(data.phone || "");
          setNewNationality(data.nationality || "");
          setNewProfession(data.profession || "");
          setNewReason(data.reason || "Other");
          setNewDob(data.dob ? data.dob.split('T')[0] : "");
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user, getAuthHeaders]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
        } else {
          if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
        }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        setNewAvatar(compressedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    if (!newName.trim()) return;
    setIsSaving(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers,
        body: JSON.stringify({ 
          name: newName,
          phone: newPhone,
          nationality: newNationality,
          profession: newProfession,
          reason: newReason,
          dob: newDob ? new Date(newDob).toISOString() : null,
          avatarUrl: newAvatar || fullProfile?.avatarUrl,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (user) setUser({ ...user, name: data.name, avatarUrl: data.avatarUrl });
        setFullProfile({ ...fullProfile, ...data });
        setIsEditing(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto space-y-10">
      {/* Simple Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-xl border">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-black tracking-tight">My Profile</h1>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} className="rounded-xl px-6">
              <Settings2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
          <Button variant="outline" onClick={() => logout()} className="rounded-xl text-rose-500 hover:bg-rose-500/10">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="md:col-span-1 rounded-2xl border-white/5 bg-background shadow-xl overflow-hidden h-fit">
          <div className="h-24 bg-linear-to-r from-primary/20 to-indigo-600/20" />
          <CardContent className="pt-0 -mt-12 flex flex-col items-center text-center pb-8">
            <div className="relative group">
              <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                <AvatarImage src={newAvatar || fullProfile?.avatarUrl || undefined} className="object-cover" />
                <AvatarFallback className="text-2xl bg-muted text-muted-foreground font-black">
                  {user?.name?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              )}
            </div>
            <div className="mt-4 space-y-1">
              <h2 className="text-xl font-bold">{fullProfile?.name}</h2>
              <p className="text-sm text-muted-foreground">{fullProfile?.email}</p>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Badge variant={fullProfile?.plan === "PRO" ? "default" : "secondary"}>
                {fullProfile?.plan} Plan
              </Badge>
              {fullProfile?.role === "ADMIN" && (
                <Badge className="bg-amber-500 text-white border-0">Admin</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats & Details Column */}
        <div className="md:col-span-2 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <StatBox icon={Flame} label="Streak" value={fullProfile?.currentStreak} color="text-orange-500" />
            <StatBox icon={Award} label="Mastered" value={fullProfile?.masteredCount || 0} color="text-primary" />
            <StatBox icon={Clock} label="Day" value={fullProfile?.dayCount} color="text-emerald-500" />
          </div>

          {/* Detailed Info Card */}
          <Card className="rounded-2xl border-white/5 bg-background shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <EditField label="Full Name" value={newName} onChange={setNewName} />
                    <EditField label="Phone" value={newPhone} onChange={setNewPhone} />
                    <EditField label="Nationality" value={newNationality} onChange={setNewNationality} />
                    <EditField label="Date of Birth" value={newDob} onChange={setNewDob} type="date" />
                    <EditField label="Profession" value={newProfession} onChange={setNewProfession} />
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Learning Goal</label>
                      <select 
                        className="w-full bg-muted/50 border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20"
                        value={newReason} onChange={(e) => setNewReason(e.target.value)}
                      >
                        <option value="IELTS Preparation">IELTS Preparation</option>
                        <option value="General English Improvement">General English Improvement</option>
                        <option value="Academic Vocabulary">Academic Vocabulary</option>
                        <option value="Professional Communication">Professional Communication</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-6 border-t border-white/5">
                    <Button onClick={saveProfile} disabled={isSaving} className="rounded-xl px-8">
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                  <DetailItem icon={Phone} label="Phone" value={fullProfile?.phone} />
                  <DetailItem icon={Globe} label="Nationality" value={fullProfile?.nationality} />
                  <DetailItem icon={CalendarIcon} label="Date of Birth" value={fullProfile?.dob ? new Date(fullProfile.dob).toLocaleDateString() : null} />
                  <DetailItem icon={Briefcase} label="Profession" value={fullProfile?.profession} />
                  <DetailItem icon={Target} label="Learning Goal" value={fullProfile?.reason} />
                  <DetailItem icon={ShieldCheck} label="Account" value={fullProfile?.role === "ADMIN" ? "Administrator" : "Standard User"} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }: { icon: any, label: string, value: any, color: string }) {
  return (
    <Card className="rounded-2xl border-white/5 bg-background p-4 flex flex-col items-center justify-center text-center shadow-sm">
      <Icon className={cn("w-5 h-5 mb-2", color)} />
      <p className="text-[10px] font-bold text-muted-foreground uppercase">{label}</p>
      <p className="text-xl font-black">{value}</p>
    </Card>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: any, label: string, value?: string | null }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{label}</p>
        <p className="font-semibold text-sm mt-0.5">{value || "Not specified"}</p>
      </div>
    </div>
  );
}

function EditField({ label, value, onChange, type = "text" }: { label: string, value: string, onChange: (v: string) => void, type?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-muted-foreground uppercase">{label}</label>
      <input 
        type={type}
        className="w-full bg-muted/50 border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20"
        value={value} onChange={(e) => onChange(e.target.value)} 
      />
    </div>
  );
}
