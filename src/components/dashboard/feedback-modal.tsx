"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, Loader2, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

interface FeedbackModalProps {
  wordId?: string;
  stageNumber?: number;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function FeedbackModal({ wordId, stageNumber, trigger, open, onOpenChange }: FeedbackModalProps) {
  const { getAuthHeaders } = useAuthStore();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [category, setCategory] = useState("GENERAL");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers,
        body: JSON.stringify({
          category,
          subject,
          message,
          wordId,
          stageNumber,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit report");
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        // Reset form
        setTimeout(() => {
          setIsSuccess(false);
          setSubject("");
          setMessage("");
          setCategory("GENERAL");
        }, 500);
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && (
        <DialogTrigger
          nativeButton={false}
          render={trigger as React.ReactElement}
        />
      )}
      {!trigger && open === undefined && (
        <DialogTrigger
          render={
            <Button variant="outline" size="sm" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Report</span>
            </Button>
          }
        />
      )}
      <DialogContent className="sm:max-w-[425px]">
        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Thank You!</h3>
              <p className="text-muted-foreground mt-2">
                Your report has been submitted successfully. Our team will
                review it shortly.
              </p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Send Report</DialogTitle>
              <DialogDescription>
                Found a bug? Have a suggestion? Let us know.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={(val) => setCategory(val ?? "GENERAL")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUG_REPORT">Bug Report</SelectItem>
                    <SelectItem value="FEATURE_REQUEST">Feature Request</SelectItem>
                    <SelectItem value="STAGE_FEEDBACK">Stage Feedback</SelectItem>
                    <SelectItem value="GENERAL">General</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief summary..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Detailed description..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px] resize-none"
                  maxLength={1000}
                />
                <div className="text-xs text-muted-foreground text-right">
                  {message.length}/1000
                </div>
              </div>

              {/* Context info if available */}
              {(wordId || stageNumber) && (
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded-md">
                  Context included:{" "}
                  {wordId && stageNumber
                    ? `Word ID & Stage ${stageNumber}`
                    : wordId
                      ? "Word ID"
                      : `Stage ${stageNumber}`}
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Submit
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
