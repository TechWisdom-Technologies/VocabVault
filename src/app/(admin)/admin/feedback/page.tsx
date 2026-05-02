"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function AdminFeedbackPage() {
  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Feedback & Reports</h1>
        <p className="text-muted-foreground mt-1">
          Review user bug reports, feature requests, and stage feedback.
        </p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
            <AlertTriangle className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p>No feedback available in this demo environment.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
