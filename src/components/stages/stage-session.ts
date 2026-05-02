export async function loadStageSessionState<T>(getAuthHeaders: () => Promise<Record<string, string>>, wordId: string): Promise<T | null> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/progress/state?wordId=${wordId}`, { headers });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.sessionState as T) || null;
  } catch {
    return null;
  }
}

export async function saveStageSessionState<T>(
  getAuthHeaders: () => Promise<Record<string, string>>,
  wordId: string,
  sessionState: T,
): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    await fetch("/api/progress/state", {
      method: "POST",
      headers,
      body: JSON.stringify({ wordId, sessionState }),
    });
  } catch {
    // Ignore transient persistence failures; the stage can still proceed.
  }
}
