"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Edit, 
  X, 
  BookOpen, 
  Database, 
  Code, 
  Search,
  MoreVertical,
  Calendar,
  Hash,
  Loader2,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Trash2,
  Info
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
import { formatDate } from "@/lib/utils";
import * as XLSX from "xlsx";

interface AdminWord {
  id: string;
  word: string;
  partOfSpeech: string;
  orderIndex: number;
  createdAt: string;
}

export default function AdminWordsPage() {
  const router = useRouter();
  const { getAuthHeaders } = useAuthStore();
  const [words, setWords] = useState<AdminWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [importStatus, setImportStatus] = useState<any>(null);

  const fetchWords = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/admin/words", { headers });
      if (res.ok) {
        const data = await res.json();
        setWords(data.words);
      }
    } catch (error) {
      console.error("Failed to fetch words", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWords();
  }, [getAuthHeaders]);

  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSubmitting(true);
    setErrorMsg("");
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Basic formatting/validation before sending
        const formattedData = data.map((item: any) => ({
          ...item,
          tenseForms: item.tenseForms ? (typeof item.tenseForms === 'string' ? item.tenseForms.split(',').map((s: string) => s.trim()) : item.tenseForms) : [],
          synonyms: item.synonyms ? (typeof item.synonyms === 'string' ? JSON.parse(item.synonyms) : item.synonyms) : [],
          antonyms: item.antonyms ? (typeof item.antonyms === 'string' ? JSON.parse(item.antonyms) : item.antonyms) : [],
          sentences: item.sentences ? (typeof item.sentences === 'string' ? JSON.parse(item.sentences) : item.sentences) : [],
          articles: item.articles ? (typeof item.articles === 'string' ? JSON.parse(item.articles) : item.articles) : [],
          audioClipUrls: item.audioClipUrls ? (typeof item.audioClipUrls === 'string' ? JSON.parse(item.audioClipUrls) : item.audioClipUrls) : [],
          correctAudioCounts: item.correctAudioCounts ? (typeof item.correctAudioCounts === 'string' ? JSON.parse(item.correctAudioCounts) : item.correctAudioCounts) : [],
          recall1Questions: item.recall1Questions ? (typeof item.recall1Questions === 'string' ? JSON.parse(item.recall1Questions) : item.recall1Questions) : [],
          recall2Pairs: item.recall2Pairs ? (typeof item.recall2Pairs === 'string' ? JSON.parse(item.recall2Pairs) : item.recall2Pairs) : [],
        }));

        const headers = await getAuthHeaders();
        const res = await fetch("/api/admin/words/bulk", {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ data: formattedData }),
        });

        if (res.ok) {
          const result = await res.json();
          setImportStatus(result.results);
          fetchWords();
        } else {
          const err = await res.json();
          setErrorMsg(err.error || "Import failed");
        }
      } catch (err: any) {
        setErrorMsg("Failed to parse file. Ensure it's a valid Excel/CSV and JSON fields are correctly formatted.");
      } finally {
        setIsSubmitting(false);
        e.target.value = ""; // Reset file input
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDeleteWord = async (wordId: string) => {
    if (!confirm("Are you sure you want to delete this word? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/admin/words/${wordId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete word");

      setWords(prev => prev.filter(w => w.id !== wordId));
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete word");
    }
  };

  const getPOSColor = (pos: string) => {
    const p = pos?.toLowerCase() || '';
    if (p.includes('noun')) return 'bg-sky-500/10 text-sky-500 border-sky-500/20';
    if (p.includes('verb')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (p.includes('adj')) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-white/5 text-white/40 border-white/10';
  };

  const handleDownloadGuide = () => {
    const content = `VOCABVAULT - MASTER IMPORT GUIDE
================================

COLUMN MAPPING & TECHNICAL REQUIREMENTS
---------------------------------------

1. word (Required)
   Description: The vocabulary word (Unique)
   Example: Resilient

2. phonetic (Required)
   Description: IPA pronunciation notation
   Example: /rɪˈzɪliənt/

3. partOfSpeech (Required)
   Description: Noun, Verb, Adjective, etc.
   Example: Adjective

4. definition (Required)
   Description: Core dictionary definition
   Example: Able to withstand or recover quickly from difficult conditions.

5. tenseForms (Required)
   Description: Comma separated list
   Example: Resilience, Resiliently

6. synonyms (JSON Required)
   Description: Array of 3 entries with context
   Structure: [{"word": "Tough", "sentence": "He is a tough competitor."}, ...]

7. antonyms (JSON Required)
   Description: Array of 3 entries with context
   Structure: [{"word": "Fragile", "sentence": "Handle with care."}, ...]

8. sentences (JSON Required)
   Description: Array of 6 entries for all tenses
   Structure: [{"tense": "Present", "sentence": "I am resilient."}, ...]

9. articles (JSON Required)
   Description: Array of 3 short articles (~50 words each)
   Structure: [{"title": "News", "content": "..."}, ...]

10. paragraph (Required)
    Description: 200+ word paragraph for Stage 8 context
    Example: In the heart of the storm...

11. paragraphTargetCount / paragraphSynonymCount / paragraphAntonymCount
    Description: Integer counts of target/synonym/antonym words in paragraph.

12. audioClipUrls (JSON Required)
    Description: Array of S3 URLs for multi-accent audio
    Structure: [{"accent": "US", "url": "..."}, {"accent": "UK", "url": "..."}]

13. correctAudioCounts (JSON Required)
    Description: Array of counts for audio challenges
    Structure: [{"accent": "US", "count": 5}, ...]

14. orderIndex (Required)
    Description: Unique integer for sorting order.

---------------------------------------
IMPORTANT TECHNICAL NOTE:
All columns marked as (JSON Required) MUST be valid JSON strings in your Excel file.
Example: ["A", "B"] is valid. A, B is INVALID and will cause import failure.
================================`;

    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'VocabVault_Import_Guide.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleBulkExport = () => {
    if (words.length === 0) return;
    
    const ws = XLSX.utils.json_to_sheet(words);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "VocabVault_Words");
    XLSX.writeFile(wb, `VocabVault_Words_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white italic uppercase">Word Management</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
            <Database className="w-3 h-3 text-amber-500" />
            Curate and expand the global vocabulary database
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost"
            onClick={handleDownloadGuide}
            className="h-11 px-6 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:border-white/10 text-xs font-black uppercase tracking-widest flex items-center justify-center cursor-pointer transition-colors outline-none"
          >
            <Info className="w-4 h-4 mr-2" />
            Import Guide
          </Button>

          <Button 
            variant="ghost"
            onClick={handleBulkExport}
            className="h-11 px-6 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:border-white/10 text-xs font-black uppercase tracking-widest flex items-center justify-center transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Bulk Export
          </Button>

          <input 
            type="file" 
            id="bulk-import" 
            className="hidden" 
            accept=".xlsx, .xls, .csv" 
            onChange={handleBulkImport}
            disabled={isSubmitting}
          />
          <Button 
            variant="ghost"
            onClick={() => document.getElementById('bulk-import')?.click()}
            disabled={isSubmitting}
            className="h-11 px-6 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:border-white/10 text-xs font-black uppercase tracking-widest"
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Import
          </Button>
          <Button 
            onClick={() => router.push("/admin/words/new")} 
            className="h-11 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      {importStatus && (
        <Card className="bg-emerald-500/10 border-emerald-500/20 rounded-3xl p-6 animate-in zoom-in-95">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight">Import Processed</h4>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-widest">Created: <span className="text-white">{importStatus.created}</span></span>
                  <span className="text-[10px] font-bold text-sky-400/60 uppercase tracking-widest">Updated: <span className="text-white">{importStatus.updated}</span></span>
                  <span className="text-[10px] font-bold text-rose-400/60 uppercase tracking-widest">Failed: <span className="text-white">{importStatus.failed}</span></span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setImportStatus(null)} className="text-white/20 hover:text-white">
              <X className="w-4 h-4" />
            </Button>
          </div>
          {importStatus.errors.length > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-black/20 space-y-1">
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <AlertCircle className="w-3 h-3" />
                Error Log
              </p>
              {importStatus.errors.slice(0, 5).map((err: string, i: number) => (
                <p key={i} className="text-[10px] text-white/40 font-mono">{err}</p>
              ))}
              {importStatus.errors.length > 5 && <p className="text-[10px] text-white/20 italic">...and {importStatus.errors.length - 5} more errors</p>}
            </div>
          )}
        </Card>
      )}

      {errorMsg && (
        <Card className="bg-rose-500/10 border-rose-500/20 rounded-3xl p-6 flex items-center gap-4">
          <AlertCircle className="w-6 h-6 text-rose-500" />
          <p className="text-sm font-bold text-rose-500">{errorMsg}</p>
          <Button variant="ghost" size="icon" onClick={() => setErrorMsg("")} className="ml-auto text-rose-500/40 hover:text-rose-500">
            <X className="w-4 h-4" />
          </Button>
        </Card>
      )}

      <Card className="bg-white/5 border-white/5 rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-xs font-black text-white/20 uppercase tracking-widest">Indexing database...</p>
            </div>
          ) : words.length === 0 ? (
            <div className="py-32 text-center">
              <BookOpen className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-sm font-bold text-white/40 uppercase tracking-[0.2em]">Zero records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-8 py-5 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] w-20 text-center">Index</th>
                    <th className="px-8 py-5 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Vocabulary</th>
                    <th className="px-8 py-5 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Class</th>
                    <th className="px-8 py-5 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-right">Registered</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {words.map((word) => (
                    <tr key={word.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-6 text-center">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/5 text-xs font-black text-white/40 group-hover:text-primary transition-colors">
                          {word.orderIndex.toString().padStart(3, '0')}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-black text-white text-xl tracking-tight capitalize group-hover:text-primary transition-colors">{word.word}</div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">
                          <Hash className="w-3 h-3" />
                          REF-{word.id.slice(0, 8)}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <Badge variant="outline" className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border-0 ${getPOSColor(word.partOfSpeech)}`}>
                          {word.partOfSpeech}
                        </Badge>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-white/60 mb-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(word.createdAt)}
                          </div>
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Added to Core</p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              console.log("Navigating to word:", word.id);
                              router.push(`/admin/words/${word.id}`);
                            }}
                            className="w-10 h-10 rounded-xl text-white hover:text-primary hover:bg-white/5"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger 
                              render={
                                <button type="button" className="w-10 h-10 rounded-xl text-white/20 hover:text-white hover:bg-white/5 flex items-center justify-center cursor-pointer transition-colors outline-none border-0 bg-transparent">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              }
                            />
                            <DropdownMenuContent align="end" className="w-56 bg-[#0A0A0B] border-white/5 rounded-2xl p-2 shadow-2xl">
                              <DropdownMenuGroup>
                                <DropdownMenuLabel className="text-[10px] font-black text-white/20 uppercase tracking-widest px-3 py-2">Management</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/5" />
                                <DropdownMenuItem 
                                  onClick={() => navigator.clipboard.writeText(word.id)}
                                  className="rounded-xl hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-white/60 hover:text-white"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  Copy Reference ID
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => window.open(`https://www.oxfordlearnersdictionaries.com/definition/english/${word.word.toLowerCase()}`, '_blank')}
                                  className="rounded-xl hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-white/60 hover:text-white"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  Oxford Reference
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                              
                              <DropdownMenuSeparator className="bg-white/5" />
                              
                              <DropdownMenuGroup>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteWord(word.id)}
                                  className="rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-rose-500/60 hover:text-rose-500"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete Entry
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
