"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSettingsPage() {
  const { getAuthHeaders } = useAuthStore();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/admin/settings", { headers });
        if (res.ok) {
          const data = await res.json();
          const map: Record<string, string> = {};
          data.settings.forEach((s: any) => {
            map[s.key] = s.value;
          });
          setSettings(map);
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [getAuthHeaders]);

  const handleSave = async (key: string, value: string) => {
    setIsSaving(key);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) {
        setSettings((prev) => ({ ...prev, [key]: value }));
      }
    } catch (error) {
      console.error("Failed to save setting", error);
    } finally {
      setIsSaving(null);
    }
  };

  const getSetting = (key: string, fallback: string) => settings[key] ?? fallback;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure global platform variables and AI prompt logic.
        </p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            AI Prompt Configuration
          </CardTitle>
          <CardDescription>Adjust the simulated AI grading logic for stages 9 and 10.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SettingItem
            title="Stage 9 Free Writing Prompt"
            settingKey="AI_PROMPT_STAGE_9"
            currentValue={getSetting("AI_PROMPT_STAGE_9", "You are an English teacher evaluating a student's paragraph. Ensure the target word is used correctly. Assess grammar and coherence. Provide a score between 0 and 100.")}
            onSave={handleSave}
            isSaving={isSaving === "AI_PROMPT_STAGE_9"}
          />
          <SettingItem
            title="Stage 10 Spoken Performance Prompt"
            settingKey="AI_PROMPT_STAGE_10"
            currentValue={getSetting("AI_PROMPT_STAGE_10", "You are an AI speech evaluator. Assess the user's transcript for fluency, pronunciation clarity, and appropriate use of the target word. Score out of 100.")}
            onSave={handleSave}
            isSaving={isSaving === "AI_PROMPT_STAGE_10"}
          />
          <SettingItem
            title="Minimum Passing Score (All Stages)"
            settingKey="MIN_PASS_SCORE"
            currentValue={getSetting("MIN_PASS_SCORE", "80")}
            onSave={handleSave}
            isSaving={isSaving === "MIN_PASS_SCORE"}
            isShort
          />
        </CardContent>
      </Card>
    </div>
  );
}

function SettingItem({ title, settingKey, currentValue, onSave, isSaving, isShort = false }: any) {
  const [val, setVal] = useState(currentValue);

  return (
    <div className="p-4 bg-muted/20 border border-border/50 rounded-lg space-y-3">
      <p className="text-sm font-semibold">{title}</p>
      <Textarea 
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className={`font-mono text-sm bg-background ${isShort ? 'min-h-[40px] w-32' : 'min-h-[100px]'}`}
      />
      <Button 
        onClick={() => onSave(settingKey, val)}
        disabled={isSaving || val === currentValue}
        size="sm"
        className="bg-primary text-primary-foreground"
      >
        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
