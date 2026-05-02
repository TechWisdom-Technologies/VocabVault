"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore, initializeAuthListener } from "@/stores/auth-store";
import { Loader2 } from "lucide-react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = initializeAuthListener();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!user) {
      router.replace(`/login?redirect=${pathname}`);
      return;
    }

    if (user.role !== "ADMIN") {
      router.replace("/dashboard");
      return;
    }

    setIsAuthorized(true);
  }, [user, isInitialized, router, pathname]);

  if (!isInitialized || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
