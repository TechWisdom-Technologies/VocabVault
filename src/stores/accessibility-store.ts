"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AccessibilityState {
  screenReaderMode: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  toggleScreenReader: () => void;
  toggleHighContrast: () => void;
  toggleLargeText: () => void;
  toggleReducedMotion: () => void;
}

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      screenReaderMode: false,
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      toggleScreenReader: () => set((s) => ({ screenReaderMode: !s.screenReaderMode })),
      toggleHighContrast: () => set((s) => ({ highContrast: !s.highContrast })),
      toggleLargeText: () => set((s) => ({ largeText: !s.largeText })),
      toggleReducedMotion: () => set((s) => ({ reducedMotion: !s.reducedMotion })),
    }),
    { name: "vocabvault:accessibility" }
  )
);
