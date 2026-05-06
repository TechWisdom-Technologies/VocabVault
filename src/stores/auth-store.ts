import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { AuthUser, DeviceInfo, SessionData } from "@/types/auth";

let authStateReadyPromise: Promise<FirebaseUser | null> | null = null;

interface CachedClientToken {
  uid: string;
  token: string;
  timestamp: number;
}

let clientTokenCache: CachedClientToken | null = null;
const CLIENT_TOKEN_CACHE_TTL = 60_000;

function waitForFirebaseUser(): Promise<FirebaseUser | null> {
  if (auth.currentUser) {
    return Promise.resolve(auth.currentUser);
  }

  if (!authStateReadyPromise) {
    authStateReadyPromise = new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        unsubscribe();
        authStateReadyPromise = null;
        resolve(firebaseUser);
      });
    });
  }

  return authStateReadyPromise;
}

async function getCachedFirebaseToken(firebaseUser: FirebaseUser): Promise<string> {
  if (
    clientTokenCache &&
    clientTokenCache.uid === firebaseUser.uid &&
    Date.now() - clientTokenCache.timestamp < CLIENT_TOKEN_CACHE_TTL
  ) {
    return clientTokenCache.token;
  }

  const token = await firebaseUser.getIdToken();
  clientTokenCache = { uid: firebaseUser.uid, token, timestamp: Date.now() };
  return token;
}

interface AuthState {
  // State
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  sessionToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<SessionData>;
  loginWithGoogle: () => Promise<SessionData>;
  // redirect flow removed per user request
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  setSessionToken: (token: string | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  getAuthHeaders: () => Promise<Record<string, string>>;
  acknowledgeRules: () => void;
  isSessionExpired: boolean;
  setSessionExpired: (expired: boolean) => void;
  syncUser: () => Promise<void>;
}

function getDeviceInfo(): DeviceInfo {
  const ua = navigator.userAgent;
  let deviceType: "browser" | "mobile" | "desktop" = "browser";
  let os = "Unknown";
  let deviceName = "Unknown Browser";

  // Detect OS
  if (ua.includes("Win")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  // Detect device type
  if (/Mobi|Android/i.test(ua)) deviceType = "mobile";
  else deviceType = "browser";

  // Detect browser name
  if (ua.includes("Chrome") && !ua.includes("Edg")) deviceName = "Chrome";
  else if (ua.includes("Firefox")) deviceName = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) deviceName = "Safari";
  else if (ua.includes("Edg")) deviceName = "Edge";

  return {
    deviceName: `${deviceName} on ${os}`,
    deviceType,
    os,
    ipAddress: "0.0.0.0", // Will be set server-side from request
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      firebaseUser: null,
      sessionToken: null,
      isLoading: false,
      isInitialized: false,
      isSessionExpired: false,
      error: null,

      setSessionExpired: (expired) => set({ isSessionExpired: expired }),

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ prompt: "select_account" });

          const credential = await signInWithPopup(auth, provider);
          const firebaseUser = credential.user;

          if (!firebaseUser.emailVerified) {
            await signOut(auth);
            throw new Error("EMAIL_NOT_VERIFIED");
          }

          const firebaseToken = await firebaseUser.getIdToken();
          const deviceInfo = getDeviceInfo();

          const response = await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firebaseToken, deviceInfo }),
          });

          if (!response.ok) {
            const data = await response.json();
            if (data.emailVerified === false) {
              await signOut(auth);
              throw new Error("EMAIL_NOT_VERIFIED");
            }
            if (data.locked) {
              throw new Error(`ACCOUNT_LOCKED:${data.reason}`);
            }
            throw new Error(data.error || "Failed to create session");
          }

          const sessionData: SessionData = await response.json();

          set({
            user: sessionData.user,
            firebaseUser,
            sessionToken: sessionData.sessionToken,
            isLoading: false,
          });

          return sessionData;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Google login failed";
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      // redirect-based login removed; using popup-only flow

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // Firebase sign-in
          const credential = await signInWithEmailAndPassword(auth, email, password);
          const firebaseUser = credential.user;

          if (!firebaseUser.emailVerified) {
            await signOut(auth);
            throw new Error("EMAIL_NOT_VERIFIED");
          }

          // Get Firebase ID token
          const firebaseToken = await firebaseUser.getIdToken();
          const deviceInfo = getDeviceInfo();

          // Create server session
          const response = await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firebaseToken, deviceInfo }),
          });

          if (!response.ok) {
            const data = await response.json();
            if (data.emailVerified === false) {
              await signOut(auth); // Sign out from firebase immediately
              throw new Error("EMAIL_NOT_VERIFIED");
            }
            if (data.locked) {
              throw new Error(`ACCOUNT_LOCKED:${data.reason}`);
            }
            throw new Error(data.error || "Failed to create session");
          }

          const sessionData: SessionData = await response.json();

          set({
            user: sessionData.user,
            firebaseUser,
            sessionToken: sessionData.sessionToken,
            isLoading: false,
          });

          return sessionData;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Login failed";
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      signup: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const credential = await createUserWithEmailAndPassword(auth, email, password);
          await sendEmailVerification(credential.user);
          await signOut(auth); // Sign out — they need to verify first
          set({ isLoading: false });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Sign up failed";
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      logout: async () => {
        const { sessionToken, firebaseUser } = get();
        try {
          if (sessionToken && firebaseUser) {
            await fetch("/api/auth/session", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionToken,
                firebaseUid: firebaseUser.uid,
              }),
            });
          }
          await signOut(auth);
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          clientTokenCache = null;
          set({
            user: null,
            firebaseUser: null,
            sessionToken: null,
            error: null,
          });
        }
      },

      setUser: (user) => set({ user }),
      setSessionToken: (token) => set({ sessionToken: token }),
      setError: (error) => set({ error }),
      setLoading: (loading) => set({ isLoading: loading }),
      setInitialized: (initialized) => set({ isInitialized: initialized }),
      setFirebaseUser: (firebaseUser) => set({ firebaseUser }),

      getAuthHeaders: async () => {
        const { sessionToken, firebaseUser } = get();

        if (!sessionToken) {
          throw new Error("Not authenticated");
        }

        const activeFirebaseUser = firebaseUser ?? (await waitForFirebaseUser());

        if (!activeFirebaseUser) {
          throw new Error("Not authenticated");
        }

        const firebaseToken = await getCachedFirebaseToken(activeFirebaseUser);

        return {
          Authorization: `Bearer ${firebaseToken}`,
          "x-session-token": sessionToken,
          "Content-Type": "application/json",
        };
      },

      acknowledgeRules: () => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, rulesAcknowledged: true } });
        }
      },
      syncUser: async () => {
        const { getAuthHeaders, user } = get();
        if (!user) return;
        try {
          const headers = await getAuthHeaders();
          // Add cache buster to bypass API response cache and server-side auth cache
          const res = await fetch(`/api/user/profile?refresh=${Date.now()}`, { 
            headers: {
              ...headers,
              "x-refresh-user": "true"
            } 
          });
          if (res.ok) {
            const data = await res.json();
            // Update if important fields changed, including rules acknowledgment
            if (
              data.plan !== user.plan || 
              data.name !== user.name || 
              data.avatarUrl !== user.avatarUrl ||
              data.rulesAcknowledged !== user.rulesAcknowledged ||
              data.onboardingComplete !== user.onboardingComplete ||
              data.timezone !== user.timezone ||
              data.maxUnlockedIndex !== user.maxUnlockedIndex
            ) {
              set({ user: { ...user, ...data } });
            }
          } else if (res.status === 401) {
            console.warn("User sync detected expired session (401)");
            set({ isSessionExpired: true });
          }
        } catch (err) {
          console.error("User sync failed", err);
        }
      },
    }),
    {
      name: "vocabvault-auth",
      partialize: (state) => ({
        sessionToken: state.sessionToken,
        user: state.user,
      }),
    }
  )
);

// Firebase auth state listener — call this once in app layout
export function initializeAuthListener() {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    const store = useAuthStore.getState();
    if (firebaseUser && !firebaseUser.emailVerified) {
      await signOut(auth);
      store.setFirebaseUser(null);
      store.setUser(null);
      store.setSessionToken(null);
    } else if (firebaseUser) {
      store.setFirebaseUser(firebaseUser);
    } else {
      clientTokenCache = null;
      store.setFirebaseUser(null);
      store.setUser(null);
      store.setSessionToken(null);
    }

    store.setInitialized(true);
  });
}
