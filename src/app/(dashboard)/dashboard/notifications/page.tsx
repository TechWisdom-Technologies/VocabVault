"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Bell, Trophy, Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const { user, getAuthHeaders } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const headers = await getAuthHeaders();
        // Fetch all notifications history
        const res = await fetch("/api/notifications", { headers });
        if (res.ok) {
          const { notifications } = await res.json();
          setNotifications(notifications);
          
          // Mark all as read
          const unreadIds = notifications.filter((n: any) => !n.read).map((n: any) => n.id);
          if (unreadIds.length > 0) {
            await fetch("/api/notifications/read", {
              method: "POST",
              headers: { ...headers, "Content-Type": "application/json" },
              body: JSON.stringify({ notificationIds: unreadIds })
            });
          }
        }
      } catch (err) {
        console.error("Failed to load notifications", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchNotifications();
  }, [user, getAuthHeaders]);

  return (
    <div className="min-h-screen bg-muted/30 pb-20 sm:pb-0">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-12 max-w-3xl mx-auto space-y-6 mt-12 sm:mt-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">Stay updated on your challenges and alerts</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <Card className="border-border/50 bg-background/50">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <Bell className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">You're all caught up!</p>
              <p className="text-sm text-muted-foreground/70 mt-1">No new notifications right now.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <Card key={notif.id} className={`border-border/50 transition-colors ${!notif.read ? 'bg-primary/5 border-primary/20' : 'bg-background hover:bg-muted/30'}`}>
                <CardContent className="p-4 sm:p-5 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {notif.type === "CHALLENGE_RECEIVED" ? <Trophy className="w-5 h-5 text-primary" /> : <Bell className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold flex items-center gap-2">
                      {notif.title}
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                    
                    {notif.type === "CHALLENGE_RECEIVED" && notif.metadata?.wordId && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button 
                          size="sm" 
                          className="bg-primary hover:bg-primary/90"
                          onClick={async () => {
                            try {
                              const headers = await getAuthHeaders();
                              const res = await fetch("/api/challenges/accept", {
                                method: "POST",
                                headers: { ...headers, "Content-Type": "application/json" },
                                body: JSON.stringify({ challengeId: notif.metadata.challengeId })
                              });
                              if (res.ok) {
                                const data = await res.json();
                                window.location.href = data.redirectUrl;
                              }
                            } catch (err) {
                              console.error("Failed to accept challenge", err);
                            }
                          }}
                        >
                          Accept Challenge
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-3">
                      {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
