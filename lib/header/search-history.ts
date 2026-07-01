const HISTORY_KEY = "search_history";
const MAX_HISTORY = 8;

export function getSearchHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addSearchHistory(term: string) {
  const prev = getSearchHistory().filter((t) => t !== term);
  localStorage.setItem(HISTORY_KEY, JSON.stringify([term, ...prev].slice(0, MAX_HISTORY)));
}

export function removeSearchHistory(term: string) {
  const prev = getSearchHistory().filter((t) => t !== term);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(prev));
}

export function clearSearchHistory() {
  localStorage.removeItem(HISTORY_KEY);
}
