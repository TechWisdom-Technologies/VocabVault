"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore, initializeAuthListener } from "@/stores/auth-store";
import LoadingScreen from "@/components/ui/loading-screen";

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
    return <LoadingScreen message="Accessing Admin Portal" submessage="Verifying administrative credentials..." />;
  }

  return <>{children}</>;
}
