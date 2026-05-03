"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore, initializeAuthListener } from "@/stores/auth-store";
import LoadingScreen from "@/components/ui/loading-screen";

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
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
