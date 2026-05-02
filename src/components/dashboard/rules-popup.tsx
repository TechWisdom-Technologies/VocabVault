"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

export default function RulesPopup() {
  const { user, acknowledgeRules, getAuthHeaders } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show if user exists but hasn't acknowledged rules
  const isOpen = user !== null && !user.rulesAcknowledged;

  const handleAcknowledge = async () => {
    setIsSubmitting(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/user/rules", {
        method: "PATCH",
        headers,
      });

      if (res.ok) {
        acknowledgeRules(); // Updates local store
      }
    } catch (error) {
      console.error("Failed to acknowledge rules", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Platform Rules</DialogTitle>
          <DialogDescription className="text-center">
            Before you begin, please acknowledge our strict learning protocols.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex gap-3 items-start">
            <div className="mt-0.5 bg-primary/20 p-1 rounded-full text-primary shrink-0">
              <Check className="w-3 h-3" />
            </div>
            <p className="text-sm"><strong>No Skipping:</strong> You must complete all 10 stages sequentially for every word.</p>
          </div>
          <div className="flex gap-3 items-start">
            <div className="mt-0.5 bg-primary/20 p-1 rounded-full text-primary shrink-0">
              <Check className="w-3 h-3" />
            </div>
            <p className="text-sm"><strong>Daily Limit:</strong> You can only learn up to 5 words per day to ensure deep retention.</p>
          </div>
          <div className="flex gap-3 items-start">
            <div className="mt-0.5 bg-primary/20 p-1 rounded-full text-primary shrink-0">
              <Check className="w-3 h-3" />
            </div>
            <p className="text-sm"><strong>Device Limits:</strong> Your account is restricted to 2 active devices. Logging into a 3rd device will securely log you out everywhere.</p>
          </div>
          <div className="flex gap-3 items-start">
            <div className="mt-0.5 bg-primary/20 p-1 rounded-full text-primary shrink-0">
              <Check className="w-3 h-3" />
            </div>
            <p className="text-sm"><strong>Scoring:</strong> You need at least 80/100 points to pass a word. Lower scores require stage retries.</p>
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button 
            className="w-full tap-target bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25"
            onClick={handleAcknowledge}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "I Understand & Agree"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
