export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api";

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
};

export const apiRequest = async <T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = (await response.json().catch(() => ({}))) as ApiResponse<T>;

  if (!response.ok) {
    const message = payload.message || "Request failed";
    throw new Error(message);
  }

  return payload;
};
