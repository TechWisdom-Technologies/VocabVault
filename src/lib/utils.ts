import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function getToday(tzIdentifier: number | string = 0): string {
  const now = new Date();
  
  if (typeof tzIdentifier === "string") {
    try {
      // Use Intl.DateTimeFormat to get the date in the specified timezone
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: tzIdentifier,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return formatter.format(now); // returns YYYY-MM-DD in en-CA locale
    } catch (e) {
      console.error(`Invalid timezone identifier: ${tzIdentifier}. Falling back to UTC.`);
      return now.toISOString().split("T")[0];
    }
  }

  // Adjust UTC time by the user's local offset (minutes)
  const localTime = new Date(now.getTime() - (tzIdentifier * 60 * 1000));
  return localTime.toISOString().split("T")[0];
}

export function generateSessionToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(20)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function sanitizeString(str: string): string {
  return str.replace(/<[^>]*>?/gm, "").trim();
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
