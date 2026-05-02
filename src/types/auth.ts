export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl?: string | null;
  plan: "FREE" | "PRO";
  role: "USER" | "ADMIN";
  onboardingComplete: boolean;
  rulesAcknowledged: boolean;
  maxUnlockedIndex: number;
}

export interface DeviceInfo {
  deviceName: string;
  deviceType: "browser" | "mobile" | "desktop";
  os: string;
  ipAddress: string;
  locationCity?: string;
  locationCountry?: string;
}

export interface SessionData {
  sessionToken: string;
  user: AuthUser;
  invalidatedAll: boolean;
}
