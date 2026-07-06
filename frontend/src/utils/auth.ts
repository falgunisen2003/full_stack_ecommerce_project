// Define the structure of the tokens argument
interface AuthTokens {
  access: string;
  refresh: string;
}

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

  return fetch(url, {
    ...options,
    headers,
  });
};