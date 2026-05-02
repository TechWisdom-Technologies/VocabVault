"use client";

import { useEffect } from "react";
import { useAccessibilityStore } from "@/stores/accessibility-store";

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const { screenReaderMode, highContrast, largeText, reducedMotion } = useAccessibilityStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("a11y-screen-reader", screenReaderMode);
    root.classList.toggle("a11y-high-contrast", highContrast);
    root.classList.toggle("a11y-large-text", largeText);
    root.classList.toggle("a11y-reduced-motion", reducedMotion);
  }, [screenReaderMode, highContrast, largeText, reducedMotion]);

  return <>{children}</>;
}
