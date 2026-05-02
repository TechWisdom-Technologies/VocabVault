"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Monitor, Smartphone, Laptop, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface DeviceSession {
  id: string;
  deviceName: string;
  deviceType: string;
  os: string;
  ipAddress: string;
  lastActive: string;
  user: {
    name: string | null;
    email: string;
  };
}

export default function AdminSecurityPage() {
  const { getAuthHeaders } = useAuthStore();
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/admin/security", { headers });
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions);
        }
      } catch (error) {
        console.error("Failed to fetch sessions", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, [getAuthHeaders]);

  const getDeviceIcon = (type: string) => {
    if (type === "mobile") return <Smartphone className="w-5 h-5 text-muted-foreground" />;
    if (type === "desktop") return <Monitor className="w-5 h-5 text-muted-foreground" />;
    return <Laptop className="w-5 h-5 text-muted-foreground" />;
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Security & Logs</h1>
        <p className="text-muted-foreground mt-1">
          Monitor platform access logs and real-time active sessions.
        </p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            Global Active Sessions (Top 100)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-20 flex items-center justify-center text-muted-foreground">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              No active sessions detected.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/20">
                  <tr>
                    <th className="px-6 py-3 font-medium">User</th>
                    <th className="px-6 py-3 font-medium">Device & OS</th>
                    <th className="px-6 py-3 font-medium">IP Address</th>
                    <th className="px-6 py-3 font-medium text-right">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{session.user.name || "Unnamed"}</div>
                        <div className="text-muted-foreground text-xs">{session.user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            {getDeviceIcon(session.deviceType)}
                          </div>
                          <div>
                            <div className="font-medium">{session.deviceName}</div>
                            <div className="text-xs text-muted-foreground">{session.os}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="font-mono">{session.ipAddress}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground">
                        {formatDate(session.lastActive)}
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
