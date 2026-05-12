const configuredApiUrl = import.meta.env.VITE_API_URL;
const defaultApiUrls = [
  "http://127.0.0.1:8000",
  "http://localhost:8000",
];

export const API_URL = configuredApiUrl || defaultApiUrls[0];

export async function apiRequest(path, options = {}, token) {
  const headers = {
    ...(options.headers || {}),
  };

  let body = options.body;

  if (body && !(body instanceof FormData) && typeof body !== "string") {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
    body = JSON.stringify(body);
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const apiUrls = configuredApiUrl ? [configuredApiUrl] : defaultApiUrls;
  let response;

  for (const apiUrl of apiUrls) {
    try {
      response = await fetch(`${apiUrl}/${path.replace(/^\//, '')}`, {
        ...options,
        body,
        headers,
      });
      break;
    } catch {
      // Try the next local backend URL.
    }
  }

  if (!response) {
    throw new Error(
      `Cannot connect to backend at ${apiUrls.join(" or ")}. Make sure FastAPI is running.`
    );
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.detail || "Request failed");
  }

  return data;
}
