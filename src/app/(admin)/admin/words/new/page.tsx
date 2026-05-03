"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ChevronLeft, 
  Save, 
  Plus, 
  X,
  Type,
  FileText,
  Brain,
  Zap,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles
} from "lucide-react";

interface WordData {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  tenseForms: string[];
  pronunciationAudioUrl: string;
  definitionAudioUrl: string;
  synonyms: { word: string; sentence: string }[];
  antonyms: { word: string; sentence: string }[];
  sentences: { tense: string; sentence: string }[];
  articles: { title: string; content: string }[];
  paragraph: string;
  audioClipUrls: { accent: string; url: string }[];
  correctAudioCounts: { accent: string; count: number }[];
  paragraphTargetCount: number;
  paragraphSynonymCount: number;
  paragraphAntonymCount: number;
  recall1Questions: { type: string; text: string; options: string[]; correctIndex: number }[];
  recall2Pairs: { word: string; definition: string }[];
  orderIndex: number;
}

export default function NewWordPage() {
  const router = useRouter();
  const { getAuthHeaders } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [wordData, setWordData] = useState<WordData>({
    word: "",
    phonetic: "",
    partOfSpeech: "",
    definition: "",
    tenseForms: [],
    pronunciationAudioUrl: "",
    definitionAudioUrl: "",
    synonyms: [],
    antonyms: [],
    sentences: [],
    articles: [],
    paragraph: "",
    audioClipUrls: [],
    correctAudioCounts: [],
    paragraphTargetCount: 0,
    paragraphSynonymCount: 0,
    paragraphAntonymCount: 0,
    recall1Questions: [],
    recall2Pairs: [],
    orderIndex: 0,
  });

  const handleSave = async () => {
    if (!wordData.word) {
      setError("Headword is required");
      return;
    }
    try {
      setIsSaving(true);
      setError("");
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/words`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(wordData),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/admin/words/${data.word.id}`);
        alert("Word created successfully!");
      } else {
        const data = await res.json();
        setError(data.details || data.error || "Failed to create word");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setWordData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:border-white/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white italic uppercase">New Vocabulary</h1>
            <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1 flex items-center gap-2">
              <Plus className="w-3 h-3 text-primary" />
              Initializing fresh database record
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            {isSaving ? "Saving..." : "Create Word"}
            <Save className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Primary Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Core Metadata */}
          <Card className="bg-white/5 border-white/5 rounded-[40px] p-10 space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-all" />
            
            <div className="flex items-center gap-3 pb-6 border-b border-white/5">
              <Type className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Core Lexical Data</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-1">Headword</label>
                <Input 
                  value={wordData.word} 
                  onChange={(e) => updateField("word", e.target.value)}
                  placeholder="e.g. Ubiquitous"
                  className="h-14 bg-white/5 border-white/5 rounded-2xl font-black text-xl text-white focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-1">Phonetic Transcription</label>
                <Input 
                  value={wordData.phonetic} 
                  onChange={(e) => updateField("phonetic", e.target.value)}
                  placeholder="/juːˈbɪkwɪtəs/"
                  className="h-14 bg-white/5 border-white/5 rounded-2xl font-medium text-white/60 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-1">Part of Speech</label>
                <Input 
                  value={wordData.partOfSpeech} 
                  onChange={(e) => updateField("partOfSpeech", e.target.value)}
                  placeholder="e.g. Adjective"
                  className="h-14 bg-white/5 border-white/5 rounded-2xl font-bold text-white focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-1">Curriculum Order (Optional)</label>
                <Input 
                  type="number"
                  value={wordData.orderIndex || ""} 
                  onChange={(e) => updateField("orderIndex", parseInt(e.target.value, 10) || 0)}
                  placeholder="Auto-calculate"
                  className="h-14 bg-white/5 border-white/5 rounded-2xl font-bold text-white focus:border-primary/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-1">Core Definition</label>
              <Textarea 
                value={wordData.definition} 
                onChange={(e) => updateField("definition", e.target.value)}
                placeholder="The fundamental meaning of the word..."
                className="min-h-[120px] bg-white/5 border-white/5 rounded-2xl p-6 text-white/80 focus:border-primary/50 leading-relaxed"
              />
            </div>
          </Card>

          {/* Stage 2 Sentence Registry */}
          <Card className="bg-white/5 border-white/5 rounded-[40px] p-10 space-y-8">
            <div className="flex items-center justify-between pb-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Stage 2 Sentence Registry</h3>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => updateField("sentences", [...wordData.sentences, { tense: "", sentence: "" }])}
                className="rounded-xl bg-white/5 text-white/40 hover:text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Context
              </Button>
            </div>

            <div className="space-y-6">
              {wordData.sentences.map((item: any, i: number) => (
                <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 relative group">
                  <Button 
                    variant="ghost" size="icon" 
                    onClick={() => updateField("sentences", wordData.sentences.filter((_: any, idx: number) => idx !== i))}
                    className="absolute top-4 right-4 w-10 h-10 rounded-xl text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-1">Tense / Label</label>
                      <Input 
                        placeholder="e.g. Present"
                        value={item.tense} 
                        onChange={(e) => {
                          const next = [...wordData.sentences];
                          next[i] = { ...item, tense: e.target.value };
                          updateField("sentences", next);
                        }}
                        className="h-10 bg-white/5 border-white/5 rounded-xl text-sm font-bold"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-1">Contextual Sentence</label>
                      <Input 
                        placeholder="Use the word in a clear context..."
                        value={item.sentence} 
                        onChange={(e) => {
                          const next = [...wordData.sentences];
                          next[i] = { ...item, sentence: e.target.value };
                          updateField("sentences", next);
                        }}
                        className="h-10 bg-white/5 border-white/5 rounded-xl text-sm italic"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {wordData.sentences.length === 0 && (
                <div className="py-10 text-center border-2 border-dashed border-white/5 rounded-2xl">
                  <p className="text-xs font-black text-white/10 uppercase tracking-widest">No immersion sentences defined</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Supplementary Data */}
        <div className="space-y-8">
          {/* Synonyms & Antonyms */}
          <div className="grid grid-cols-1 gap-8">
            <Card className="bg-white/5 border-white/5 rounded-[32px] p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">Synonyms</h3>
                </div>
                <Button 
                  variant="ghost" size="icon" 
                  onClick={() => updateField("synonyms", [...wordData.synonyms, { word: "", sentence: "" }])}
                  className="w-8 h-8 rounded-lg bg-white/5 text-white/40 hover:text-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                {wordData.synonyms.map((syn: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 relative group">
                    <Button 
                      variant="ghost" size="icon" 
                      onClick={() => updateField("synonyms", wordData.synonyms.filter((_: any, idx: number) => idx !== i))}
                      className="absolute top-2 right-2 w-7 h-7 rounded-lg text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Input 
                      placeholder="Word"
                      value={syn.word} 
                      onChange={(e) => {
                        const next = [...wordData.synonyms];
                        next[i] = { ...syn, word: e.target.value };
                        updateField("synonyms", next);
                      }}
                      className="h-9 bg-white/5 border-white/5 rounded-lg text-xs font-bold"
                    />
                    <Input 
                      placeholder="Example sentence"
                      value={syn.sentence} 
                      onChange={(e) => {
                        const next = [...wordData.synonyms];
                        next[i] = { ...syn, sentence: e.target.value };
                        updateField("synonyms", next);
                      }}
                      className="h-9 bg-white/5 border-white/5 rounded-lg text-[10px]"
                    />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-white/5 border-white/5 rounded-[32px] p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">Antonyms</h3>
                </div>
                <Button 
                  variant="ghost" size="icon" 
                  onClick={() => updateField("antonyms", [...wordData.antonyms, { word: "", sentence: "" }])}
                  className="w-8 h-8 rounded-lg bg-white/5 text-white/40 hover:text-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                {wordData.antonyms.map((ant: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 relative group">
                    <Button 
                      variant="ghost" size="icon" 
                      onClick={() => updateField("antonyms", wordData.antonyms.filter((_: any, idx: number) => idx !== i))}
                      className="absolute top-2 right-2 w-7 h-7 rounded-lg text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Input 
                      placeholder="Word"
                      value={ant.word} 
                      onChange={(e) => {
                        const next = [...wordData.antonyms];
                        next[i] = { ...ant, word: e.target.value };
                        updateField("antonyms", next);
                      }}
                      className="h-9 bg-white/5 border-white/5 rounded-lg text-xs font-bold"
                    />
                    <Input 
                      placeholder="Example sentence"
                      value={ant.sentence} 
                      onChange={(e) => {
                        const next = [...wordData.antonyms];
                        next[i] = { ...ant, sentence: e.target.value };
                        updateField("antonyms", next);
                      }}
                      className="h-9 bg-white/5 border-white/5 rounded-lg text-[10px]"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Audio Variants */}
          <Card className="bg-white/5 border-white/5 rounded-[32px] p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-tight">Audio Drills</h3>
              </div>
              <Button 
                variant="ghost" size="icon" 
                onClick={() => updateField("audioClipUrls", [...wordData.audioClipUrls, { accent: "", url: "" }])}
                className="w-8 h-8 rounded-lg bg-white/5 text-white/40 hover:text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {wordData.audioClipUrls.map((clip: any, i: number) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3 relative group">
                  <Button 
                    variant="ghost" size="icon" 
                    onClick={() => updateField("audioClipUrls", wordData.audioClipUrls.filter((_: any, idx: number) => idx !== i))}
                    className="absolute top-2 right-2 w-8 h-8 rounded-lg text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Input 
                      placeholder="Accent"
                      value={clip.accent} 
                      onChange={(e) => {
                        const next = [...wordData.audioClipUrls];
                        next[i] = { ...clip, accent: e.target.value };
                        updateField("audioClipUrls", next);
                      }}
                      className="h-8 bg-white/5 border-white/5 rounded-lg text-[10px] uppercase font-bold"
                    />
                    <Input 
                      placeholder="Word Count"
                      type="number"
                      value={wordData.correctAudioCounts.find((c: any) => c.accent === clip.accent)?.count || 0}
                      onChange={(e) => {
                        const count = parseInt(e.target.value, 10) || 0;
                        const nextCounts = [...wordData.correctAudioCounts];
                        const idx = nextCounts.findIndex((c: any) => c.accent === clip.accent);
                        if (idx >= 0) nextCounts[idx].count = count;
                        else nextCounts.push({ accent: clip.accent, count });
                        updateField("correctAudioCounts", nextCounts);
                      }}
                      className="h-8 bg-white/5 border-white/5 rounded-lg text-[10px] text-primary font-bold"
                    />
                  </div>
                  <Input 
                    placeholder="Audio URL"
                    value={clip.url} 
                    onChange={(e) => {
                      const next = [...wordData.audioClipUrls];
                      next[i] = { ...clip, url: e.target.value };
                      updateField("audioClipUrls", next);
                    }}
                    className="h-8 bg-white/5 border-white/5 rounded-lg text-[9px] font-mono"
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Full Width Sections */}
      <div className="space-y-8">
        {/* Stage 5 Articles */}
        <Card className="bg-white/5 border-white/5 rounded-[40px] p-10 space-y-8">
          <div className="flex items-center justify-between pb-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Stage 5 Article Study</h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => updateField("articles", [...wordData.articles, { title: "", content: "" }])}
              className="rounded-xl bg-white/5 text-white/40 hover:text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Article
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wordData.articles.map((art: any, i: number) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 relative group">
                <Button 
                  variant="ghost" size="icon" 
                  onClick={() => updateField("articles", wordData.articles.filter((_: any, idx: number) => idx !== i))}
                  className="absolute top-4 right-4 w-10 h-10 rounded-xl text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-5 h-5" />
                </Button>
                <Input 
                  placeholder="Article Title"
                  value={art.title}
                  onChange={(e) => {
                    const next = [...wordData.articles];
                    next[i] = { ...art, title: e.target.value };
                    updateField("articles", next);
                  }}
                  className="h-10 bg-white/5 border-white/5 rounded-xl text-sm font-bold"
                />
                <Textarea 
                  placeholder="Article Content..."
                  value={art.content}
                  onChange={(e) => {
                    const next = [...wordData.articles];
                    next[i] = { ...art, content: e.target.value };
                    updateField("articles", next);
                  }}
                  className="min-h-[150px] bg-white/5 border-white/5 rounded-xl text-sm"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Stage 4 & 6 Custom Recall */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-white/5 border-white/5 rounded-[40px] p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-violet-400" />
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Stage 4 Custom Drills</h3>
              </div>
              <Button 
                variant="ghost" size="icon" 
                onClick={() => updateField("recall1Questions", [...wordData.recall1Questions, { type: "mcq", text: "", options: ["", "", "", ""], correctIndex: 0 }])}
                className="w-10 h-10 rounded-xl bg-white/5 text-white/40 hover:text-white"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <div className="space-y-4">
              {wordData.recall1Questions.map((q: any, i: number) => (
                <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 relative group">
                   <Button 
                    variant="ghost" size="icon" 
                    onClick={() => updateField("recall1Questions", wordData.recall1Questions.filter((_: any, idx: number) => idx !== i))}
                    className="absolute top-2 right-2 w-8 h-8 rounded-lg text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  <Input 
                    placeholder="Question Text"
                    value={q.text}
                    onChange={(e) => {
                      const next = [...wordData.recall1Questions];
                      next[i] = { ...q, text: e.target.value };
                      updateField("recall1Questions", next);
                    }}
                    className="h-9 bg-white/5 border-white/5 rounded-lg text-xs font-bold"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt: string, optIdx: number) => (
                      <div key={optIdx} className="flex gap-2">
                        <Input 
                          placeholder={`Opt ${optIdx + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const next = [...wordData.recall1Questions];
                            const nextOpts = [...q.options];
                            nextOpts[optIdx] = e.target.value;
                            next[i] = { ...q, options: nextOpts };
                            updateField("recall1Questions", next);
                          }}
                          className={`h-8 bg-white/5 border-white/5 rounded-lg text-[10px] ${q.correctIndex === optIdx ? "border-emerald-500/50 text-emerald-400" : ""}`}
                        />
                        <input 
                          type="radio" 
                          checked={q.correctIndex === optIdx}
                          onChange={() => {
                            const next = [...wordData.recall1Questions];
                            next[i] = { ...q, correctIndex: optIdx };
                            updateField("recall1Questions", next);
                          }}
                          className="w-4 h-4 mt-2 accent-emerald-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-white/5 border-white/5 rounded-[40px] p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Stage 6 Match Pairs</h3>
              </div>
              <Button 
                variant="ghost" size="icon" 
                onClick={() => updateField("recall2Pairs", [...wordData.recall2Pairs, { word: "", definition: "" }])}
                className="w-10 h-10 rounded-xl bg-white/5 text-white/40 hover:text-white"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <div className="space-y-4">
              {wordData.recall2Pairs.map((pair: any, i: number) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3 relative group">
                  <Button 
                    variant="ghost" size="icon" 
                    onClick={() => updateField("recall2Pairs", wordData.recall2Pairs.filter((_: any, idx: number) => idx !== i))}
                    className="absolute top-2 right-2 w-8 h-8 rounded-lg text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  <Input 
                    placeholder="Term"
                    value={pair.word}
                    onChange={(e) => {
                      const next = [...wordData.recall2Pairs];
                      next[i] = { ...pair, word: e.target.value };
                      updateField("recall2Pairs", next);
                    }}
                    className="h-9 bg-white/5 border-white/5 rounded-lg text-xs font-bold"
                  />
                  <Input 
                    placeholder="Definition"
                    value={pair.definition}
                    onChange={(e) => {
                      const next = [...wordData.recall2Pairs];
                      next[i] = { ...pair, definition: e.target.value };
                      updateField("recall2Pairs", next);
                    }}
                    className="h-9 bg-white/5 border-white/5 rounded-lg text-[10px]"
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
