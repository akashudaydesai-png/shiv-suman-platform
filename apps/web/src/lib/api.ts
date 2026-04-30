const localApiBaseUrl = "http://127.0.0.1:4000/api";

function isLocalBrowser() {
  if (typeof window === "undefined") return false;
  return ["localhost", "127.0.0.1"].includes(window.location.hostname);
}

export function isHostedDemoMode() {
  return typeof window !== "undefined" && !process.env.NEXT_PUBLIC_API_URL && !isLocalBrowser();
}

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? localApiBaseUrl;

export async function apiGet<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, { cache: "no-store" });
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}
