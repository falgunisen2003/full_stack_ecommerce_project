// Define the structure of the tokens argument
interface AuthTokens {
  access: string;
  refresh: string;
}

// Get the base URL from the .env file, fallback to localhost for development
const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL || "http://127.0.0.1:8000";

export const saveToken = (tokens: AuthTokens): void => {
  localStorage.setItem("access_token", tokens.access);
  localStorage.setItem("refresh_token", tokens.refresh);
};

export const clearTokens = (): void => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem("access_token");
};

export const authFetch = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAccessToken();

  // Explicitly type headers as a Record so we can dynamically add properties safely
  const headers: Record<string, string> = options.headers
    ? { ...(options.headers as Record<string, string>) }
    : {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  headers["Content-Type"] = "application/json";

  let finalUrl = url;

  // 1. If it's a full production URL containing the remote IP, swap it with BASE_URL
  if (url.includes("3.6.92.227")) {
    finalUrl = url.replace("http://3.6.92.227", BASE_URL);
  } 
  // 2. If it's already a local full URL, leave it as is
  else if (url.startsWith("http://localhost") || url.startsWith("http://127.0.0.1")) {
    finalUrl = url;
  } 
  // 3. If it's a relative path (e.g., "/api/cart/" or "api/cart/")
  else {
    const cleanPath = url.startsWith("/") ? url : `/${url}`;
    finalUrl = `${BASE_URL}${cleanPath}`;
  }

  // 4. Ensure a trailing slash is present for Django compliance (unless it's a file format)
  if (!finalUrl.endsWith("/") && !finalUrl.split("/").pop()?.includes(".")) {
    finalUrl = `${finalUrl}/`;
  }

  // Safely merge options and authorization headers together
  return fetch(finalUrl, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string>),
    },
  });
};