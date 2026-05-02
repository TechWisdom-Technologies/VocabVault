"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  role: string;
  totalScore: number;
  wordsLearned: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsersPage() {
  const { getAuthHeaders } = useAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/admin/users", { headers });
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users);
        }
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [getAuthHeaders]);

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Users & Accounts</h1>
        <p className="text-muted-foreground mt-1">
          Manage platform users, view their progress, and monitor roles.
        </p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Recent Users (Top 100)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/20">
                  <tr>
                    <th className="px-6 py-3 font-medium">User</th>
                    <th className="px-6 py-3 font-medium">Plan / Role</th>
                    <th className="px-6 py-3 font-medium text-right">Words</th>
                    <th className="px-6 py-3 font-medium text-right">Score</th>
                    <th className="px-6 py-3 font-medium text-right">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{user.name || "Unnamed"}</div>
                        <div className="text-muted-foreground">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Badge variant={user.plan === "PRO" ? "default" : "secondary"} className={user.plan === "PRO" ? "bg-amber-500 hover:bg-amber-600 text-white border-0" : ""}>
                            {user.plan}
                          </Badge>
                          {user.role === "ADMIN" && (
                            <Badge variant="destructive">Admin</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-emerald-600">
                        {user.wordsLearned}
                      </td>
                      <td className="px-6 py-4 text-right font-bold">
                        {user.totalScore.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground">
                        {formatDate(user.createdAt)}
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
