import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ─── Session Keys ────────────────────────────────────────

export const sessionKey = (userId: string, sessionToken: string) =>
  `session:${userId}:${sessionToken}`;

export const userSessionsKey = (userId: string) =>
  `sessions:${userId}`;

export const dailyLimitKey = (userId: string, date: string) =>
  `daily_limit:${userId}:${date}`;

export const leaderboardCacheKey = () => `leaderboard:cache`;

export const settingsCacheKey = () => `settings:cache`;

export const rateLimitKey = (identifier: string) =>
  `ratelimit:${identifier}`;
