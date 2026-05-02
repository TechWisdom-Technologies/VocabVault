"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore, initializeAuthListener } from "@/stores/auth-store";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isInitialized, sessionToken, setInitialized } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = initializeAuthListener();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    if (!user || !sessionToken) {
      router.replace("/login");
      return;
    }

    if (!user.onboardingComplete && pathname !== "/onboarding") {
      router.replace("/onboarding");
      return;
    }

    setIsChecking(false);
  }, [isInitialized, user, sessionToken, pathname, router]);

  if (!isInitialized || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
