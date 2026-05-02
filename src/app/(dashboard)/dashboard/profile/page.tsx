"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, ArrowLeft, Camera, Phone, Globe, Briefcase, Target, Calendar as CalendarIcon } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const { user, getAuthHeaders, setUser } = useAuthStore();
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
      } else {
        alert("Failed to save profile.");
      }
    } catch (error) {
      console.error(error);
      alert("Error saving profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-black tracking-tight">My Profile</h1>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="rounded-xl px-6">
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Basic Info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-border/50 overflow-hidden">
            <div className="h-24 bg-linear-to-r from-primary to-indigo-600" />
            <CardContent className="pt-0 -mt-12 flex flex-col items-center text-center">
              <div className="relative group">
                <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
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
              <div className="mt-4">
                <h2 className="text-xl font-bold">{fullProfile?.name}</h2>
                <p className="text-sm text-muted-foreground">{fullProfile?.email}</p>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Badge variant={fullProfile?.plan === "PRO" ? "default" : "secondary"}>
                  {fullProfile?.plan} Plan
                </Badge>
                {fullProfile?.role === "ADMIN" && <Badge className="bg-amber-500 text-white border-0">Admin</Badge>}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Day Count</span>
                <span className="font-bold">{fullProfile?.dayCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current Streak</span>
                <span className="font-bold text-orange-500">{fullProfile?.currentStreak} 🔥</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Words Learned</span>
                <span className="font-bold text-primary">{fullProfile?.masteredCount || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Detailed Info */}
        <div className="md:col-span-2">
          <Card className="border-border/50 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Profile Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Full Name</label>
                      <input 
                        className="w-full bg-muted/50 border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20"
                        value={newName} onChange={(e) => setNewName(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Phone</label>
                      <input 
                        className="w-full bg-muted/50 border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20"
                        value={newPhone} onChange={(e) => setNewPhone(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Nationality</label>
                      <input 
                        className="w-full bg-muted/50 border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20"
                        value={newNationality} onChange={(e) => setNewNationality(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Date of Birth</label>
                      <input 
                        type="date"
                        className="w-full bg-muted/50 border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20"
                        value={newDob} onChange={(e) => setNewDob(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Profession</label>
                      <input 
                        className="w-full bg-muted/50 border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20"
                        value={newProfession} onChange={(e) => setNewProfession(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Learning Goal</label>
                      <select 
                        className="w-full bg-muted/50 border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20"
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
                  <div className="flex gap-3 pt-4">
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: any, label: string, value?: string | null }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-tighter text-muted-foreground">{label}</p>
        <p className="font-semibold mt-0.5">{value || "Not specified"}</p>
      </div>
    </div>
  );
}
