import { useAuthStore } from "@/stores/auth-store";

/**
 * A wrapper around fetch that automatically includes authentication headers
 * and handles 401 Unauthorized errors by triggering the session expired modal.
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const store = useAuthStore.getState();
  
  try {
    const authHeaders = await store.getAuthHeaders();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      console.warn("Session expired (401) detected in fetchWithAuth");
      store.setSessionExpired(true);
    }

    return response;
  } catch (error: any) {
    // If getAuthHeaders throws "Not authenticated", we should also handle it
    if (error.message === "Not authenticated") {
      store.setSessionExpired(true);
    }
    throw error;
  }
}
