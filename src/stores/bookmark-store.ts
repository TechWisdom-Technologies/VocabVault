"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BookmarkState {
  bookmarkedWordIds: string[];
  toggleBookmark: (wordId: string) => void;
  isBookmarked: (wordId: string) => boolean;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarkedWordIds: [],
      toggleBookmark: (wordId: string) =>
        set((state) => {
          const exists = state.bookmarkedWordIds.includes(wordId);
          return {
            bookmarkedWordIds: exists
              ? state.bookmarkedWordIds.filter((id) => id !== wordId)
              : [...state.bookmarkedWordIds, wordId],
          };
        }),
      isBookmarked: (wordId: string) => get().bookmarkedWordIds.includes(wordId),
    }),
    { name: "vocabvault:bookmarks" }
  )
);
