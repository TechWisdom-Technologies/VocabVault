"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Edit, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AdminWord {
  id: string;
  word: string;
  partOfSpeech: string;
  orderIndex: number;
  createdAt: string;
}

export default function AdminWordsPage() {
  const { getAuthHeaders } = useAuthStore();
  const [words, setWords] = useState<AdminWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add Word State
  const [showAddModal, setShowAddModal] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

  const handleAddWord = async () => {
    setErrorMsg("");
    try {
      const payload = JSON.parse(jsonInput);
      setIsSubmitting(true);
      const headers = await getAuthHeaders();
      const res = await fetch("/api/admin/words", {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        setShowAddModal(false);
        setJsonInput("");
        fetchWords(); // Refresh the list
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Failed to add word");
      }
    } catch (e: any) {
      setErrorMsg("Invalid JSON: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Word Management</h1>
          <p className="text-muted-foreground mt-1">
            View and manage the global vocabulary database.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Add New Word
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Vocabulary Database ({words.length} words)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : words.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              No words found in the database.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/20">
                  <tr>
                    <th className="px-6 py-3 font-medium w-16 text-center">#</th>
                    <th className="px-6 py-3 font-medium">Word</th>
                    <th className="px-6 py-3 font-medium">Part of Speech</th>
                    <th className="px-6 py-3 font-medium text-right">Added On</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {words.map((word) => (
                    <tr key={word.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 text-center text-muted-foreground">
                        {word.orderIndex}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-foreground capitalize text-lg">{word.word}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-xs uppercase">
                          {word.partOfSpeech}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground">
                        {formatDate(word.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Word Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl border-border/50 shadow-2xl relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4"
              onClick={() => setShowAddModal(false)}
            >
              <X className="w-4 h-4" />
            </Button>
            <CardHeader>
              <CardTitle>Add New Word</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Paste the full JSON payload for the new word.
              </p>
              <Textarea 
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="font-mono text-xs min-h-75"
                placeholder='{ "word": "example", "phonetic": "/igˈzampəl/", "partOfSpeech": "noun", "definition": "...", ... }'
              />
              {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}
              <Button onClick={handleAddWord} disabled={isSubmitting || !jsonInput.trim()} className="w-full">
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                {isSubmitting ? "Adding..." : "Add Word"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
