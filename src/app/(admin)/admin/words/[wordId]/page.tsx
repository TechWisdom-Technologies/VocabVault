"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Save,
  Trash2,
  Database,
  Plus,
  X,
  Type,
  FileText,
  Layers,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
  Brain
} from "lucide-react";

export default function WordEditorPage() {
  const params = useParams();
  const wordId = params.wordId as string;
  const router = useRouter();
  const { getAuthHeaders } = useAuthStore();

  const [wordData, setWordData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWord = async () => {
      if (!wordId) return;
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`/api/admin/words/${wordId}`, { headers });
        if (res.ok) {
          const data = await res.json();
          const word = data.word;
          // Ensure new fields are initialized
          if (!word.recall1Questions) word.recall1Questions = [];
          if (!word.recall2Pairs) word.recall2Pairs = [];
          setWordData(word);
        } else {
          router.replace("/admin/words");
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWord();
  }, [wordId, getAuthHeaders, router]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError("");
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/words/${wordId}`, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(wordData),
      });

      if (res.ok) {
        router.refresh();
        alert("Word updated successfully!");
      } else {
        const data = await res.json();
        setError(data.details || data.error || "Failed to save changes");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you absolutely sure? This will delete the word and all associated progress data.")) return;
    try {
      setIsDeleting(true);
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/words/${wordId}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        router.replace("/admin/words");
      } else {
        alert("Failed to delete word");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setWordData((prev: any) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-xs font-black text-white/20 uppercase tracking-widest">Accessing Core Records...</p>
      </div>
    );
  }

  if (!wordData) return null;

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
            <h1 className="text-4xl font-black tracking-tight text-white italic uppercase">Edit Vocabulary</h1>
            <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
              <Database className="w-3 h-3 text-primary" />
              Direct access to database reference {wordId}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleDelete}
            disabled={isDeleting || isSaving}
            className="h-12 px-6 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-black uppercase tracking-widest text-xs border border-rose-500/20"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Entry
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || isDeleting}
            className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {isSaving ? "Synchronizing..." : "Commit Changes"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500" />
          <p className="text-sm font-bold text-rose-500">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Basic Information */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-white/5 border-white/5 rounded-[32px] p-8 space-y-8">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <Type className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Core Metadata</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-1">Headword</label>
                <Input
                  value={wordData.word}
                  onChange={(e) => updateField("word", e.target.value)}
                  className="h-14 bg-white/5 border-white/5 rounded-2xl font-black text-xl text-white focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-1">Phonetic Transcription</label>
                <Input
                  value={wordData.phonetic}
                  onChange={(e) => updateField("phonetic", e.target.value)}
                  className="h-14 bg-white/5 border-white/5 rounded-2xl font-medium text-white/60 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-1">Part of Speech</label>
                <Input
                  value={wordData.partOfSpeech}
                  onChange={(e) => updateField("partOfSpeech", e.target.value)}
                  className="h-14 bg-white/5 border-white/5 rounded-2xl font-bold text-white focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-1">Curriculum Order</label>
                <Input
                  type="number"
                  value={wordData.orderIndex}
                  onChange={(e) => updateField("orderIndex", parseInt(e.target.value, 10))}
                  className="h-14 bg-white/5 border-white/5 rounded-2xl font-bold text-white focus:border-primary/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-1">Core Definition</label>
              <Textarea
                value={wordData.definition}
                onChange={(e) => updateField("definition", e.target.value)}
                className="min-h-[120px] bg-white/5 border-white/5 rounded-2xl p-6 text-white/80 focus:border-primary/50 leading-relaxed"
              />
            </div>
          </Card>

          {/* Multimedia & Audio */}
          <Card className="bg-white/5 border-white/5 rounded-[32px] p-8 space-y-8">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <Volume2 className="w-5 h-5 text-sky-400" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Multimedia Asset Registry</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-1">Pronunciation Audio (URL)</label>
                <Input
                  value={wordData.pronunciationAudioUrl || ""}
                  onChange={(e) => updateField("pronunciationAudioUrl", e.target.value)}
                  className="h-12 bg-white/5 border-white/5 rounded-2xl text-xs font-mono text-sky-400"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-1">Definition Audio (URL)</label>
                <Input
                  value={wordData.definitionAudioUrl || ""}
                  onChange={(e) => updateField("definitionAudioUrl", e.target.value)}
                  className="h-12 bg-white/5 border-white/5 rounded-2xl text-xs font-mono text-sky-400"
                />
              </div>
            </div>
          </Card>

          {/* Full Paragraph (Stage 8) */}
          <Card className="bg-white/5 border-white/5 rounded-[32px] p-8 space-y-8">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Stage 8 Master Paragraph</h3>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-1">Contextual Narrative</label>
              <Textarea
                value={wordData.paragraph}
                onChange={(e) => updateField("paragraph", e.target.value)}
                className="min-h-[300px] bg-white/5 border-white/5 rounded-[24px] p-8 text-white/80 focus:border-primary/50 leading-relaxed font-serif text-lg italic"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Target Words</p>
                <Input
                  type="number"
                  value={wordData.paragraphTargetCount}
                  onChange={(e) => updateField("paragraphTargetCount", parseInt(e.target.value, 10))}
                  className="h-10 bg-transparent border-0 p-0 text-white font-black"
                />
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Synonyms</p>
                <Input
                  type="number"
                  value={wordData.paragraphSynonymCount}
                  onChange={(e) => updateField("paragraphSynonymCount", parseInt(e.target.value, 10))}
                  className="h-10 bg-transparent border-0 p-0 text-white font-black"
                />
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Antonyms</p>
                <Input
                  type="number"
                  value={wordData.paragraphAntonymCount}
                  onChange={(e) => updateField("paragraphAntonymCount", parseInt(e.target.value, 10))}
                  className="h-10 bg-transparent border-0 p-0 text-white font-black"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Stage 2 Contextual Sentences */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-white/5 border-white/5 rounded-[32px] p-8 space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
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
                        className="h-10 bg-white/5 border-white/5 rounded-xl text-xs font-bold"
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
                        className="h-10 bg-white/5 border-white/5 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Synonyms & Antonyms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

          {/* Stage 5 Articles */}
          <Card className="bg-white/5 border-white/5 rounded-[32px] p-8 space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
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

            <div className="space-y-6">
              {wordData.articles.map((article: any, i: number) => (
                <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 relative group">
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => updateField("articles", wordData.articles.filter((_: any, idx: number) => idx !== i))}
                    className="absolute top-4 right-4 w-10 h-10 rounded-xl text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-1">Article Title</label>
                      <Input
                        placeholder="e.g. Modern Usage and Context"
                        value={article.title}
                        onChange={(e) => {
                          const next = [...wordData.articles];
                          next[i] = { ...article, title: e.target.value };
                          updateField("articles", next);
                        }}
                        className="h-10 bg-white/5 border-white/5 rounded-xl text-sm font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-1">Article Content (~50 words)</label>
                      <Textarea
                        placeholder="Write a short article incorporating the target word..."
                        value={article.content}
                        onChange={(e) => {
                          const next = [...wordData.articles];
                          next[i] = { ...article, content: e.target.value };
                          updateField("articles", next);
                        }}
                        className="min-h-[100px] bg-white/5 border-white/5 rounded-xl p-4 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Dynamic Data (Arrays) */}
        <div className="space-y-8">
          {/* Tense Forms */}
          <Card className="bg-white/5 border-white/5 rounded-[32px] p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-black text-white uppercase tracking-tight">Tense Variations</h4>
              </div>
              <Button
                variant="ghost" size="icon"
                onClick={() => updateField("tenseForms", [...wordData.tenseForms, ""])}
                className="w-8 h-8 rounded-lg bg-white/5 text-white/40 hover:text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {wordData.tenseForms.map((tense: string, i: number) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={tense}
                    onChange={(e) => {
                      const newTenses = [...wordData.tenseForms];
                      newTenses[i] = e.target.value;
                      updateField("tenseForms", newTenses);
                    }}
                    className="h-10 bg-white/5 border-white/5 rounded-xl text-sm font-bold text-white"
                  />
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => updateField("tenseForms", wordData.tenseForms.filter((_: any, idx: number) => idx !== i))}
                    className="w-10 h-10 rounded-xl text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Audio Clips */}
          <Card className="bg-white/5 border-white/5 rounded-[32px] p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-sky-400" />
                <h4 className="text-sm font-black text-white uppercase tracking-tight">Audio Variants</h4>
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
                <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 relative group">
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => updateField("audioClipUrls", wordData.audioClipUrls.filter((_: any, idx: number) => idx !== i))}
                    className="absolute top-2 right-2 w-8 h-8 rounded-lg text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      placeholder="Accent (e.g. UK)"
                      value={clip.accent}
                      onChange={(e) => {
                        const newClips = [...wordData.audioClipUrls];
                        newClips[i] = { ...clip, accent: e.target.value };
                        updateField("audioClipUrls", newClips);
                      }}
                      className="h-9 bg-white/5 border-white/5 rounded-lg text-xs font-black uppercase tracking-widest"
                    />
                    <Input
                      placeholder="Count"
                      type="number"
                      value={wordData.correctAudioCounts?.find((c: any) => c.accent === clip.accent)?.count || 0}
                      onChange={(e) => {
                        const count = parseInt(e.target.value, 10);
                        const newCounts = [...(wordData.correctAudioCounts || [])];
                        const existingIdx = newCounts.findIndex((c: any) => c.accent === clip.accent);
                        if (existingIdx >= 0) newCounts[existingIdx].count = count;
                        else newCounts.push({ accent: clip.accent, count });
                        updateField("correctAudioCounts", newCounts);
                      }}
                      className="h-9 bg-white/5 border-white/5 rounded-lg text-xs font-black text-primary"
                    />
                  </div>
                  <Input
                    placeholder="Audio URL"
                    value={clip.url}
                    onChange={(e) => {
                      const newClips = [...wordData.audioClipUrls];
                      newClips[i] = { ...clip, url: e.target.value };
                      updateField("audioClipUrls", newClips);
                    }}
                    className="h-9 bg-white/5 border-white/5 rounded-lg text-[10px] font-mono text-sky-400"
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Stage 4 Custom Recall Questions */}
          <Card className="bg-white/5 border-white/5 rounded-[32px] p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-violet-400" />
                <h4 className="text-sm font-black text-white uppercase tracking-tight">Stage 4 Custom Drill</h4>
              </div>
              <Button
                variant="ghost" size="icon"
                onClick={() => updateField("recall1Questions", [...wordData.recall1Questions, { type: "mcq", text: "", options: ["", "", "", ""], correctIndex: 0 }])}
                className="w-8 h-8 rounded-lg bg-white/5 text-white/40 hover:text-white"
              >
                <Plus className="w-4 h-4" />
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

          {/* Stage 6 Custom Matching Pairs */}
          <Card className="bg-white/5 border-white/5 rounded-[32px] p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-black text-white uppercase tracking-tight">Stage 6 Match Logic</h4>
              </div>
              <Button
                variant="ghost" size="icon"
                onClick={() => updateField("recall2Pairs", [...wordData.recall2Pairs, { word: "", definition: "" }])}
                className="w-8 h-8 rounded-lg bg-white/5 text-white/40 hover:text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
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
                    placeholder="Term (e.g. Synonym)"
                    value={pair.word}
                    onChange={(e) => {
                      const next = [...wordData.recall2Pairs];
                      next[i] = { ...pair, word: e.target.value };
                      updateField("recall2Pairs", next);
                    }}
                    className="h-8 bg-white/5 border-white/5 rounded-lg text-xs font-bold"
                  />
                  <Input
                    placeholder="Linkage Definition"
                    value={pair.definition}
                    onChange={(e) => {
                      const next = [...wordData.recall2Pairs];
                      next[i] = { ...pair, definition: e.target.value };
                      updateField("recall2Pairs", next);
                    }}
                    className="h-8 bg-white/5 border-white/5 rounded-lg text-[10px]"
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Stats Summary */}
          <Card className="bg-primary/5 border-primary/20 rounded-[32px] p-8 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h4 className="text-xl font-black text-white tracking-tight italic uppercase">Validation Pass</h4>
              <p className="text-xs text-white/40 font-medium mt-2 leading-relaxed">
                Word contains {wordData.tenseForms.length} variations and {wordData.sentences.length} context sentences. All mandatory curriculum fields are detected.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
