import { useAuth } from "../hooks/useAuth";

const API_URL = window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL;

interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
}

export const createAuthenticatedFetch = (token: string | null) => {
  return async (url: string, options: ApiOptions = {}) => {
    const { requireAuth = true, body, headers: optHeaders, ...fetchOptions } = options;

    // Sempre trabalhe com Headers
    const headers = new Headers(optHeaders);

    // Content-Type só quando o body NÃO é FormData e não foi definido
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    if (!isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (requireAuth && token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`;

    // Se o body é objeto/array e não é FormData, serialize
    const finalBody =
      body && !isFormData && typeof body !== "string" ? JSON.stringify(body) : body;

    return fetch(fullUrl, {
      ...fetchOptions,
      headers,
      body: finalBody,
    });
  };
};

export const useApi = () => {
  const { token } = useAuth();
  const apiCall = createAuthenticatedFetch(token);

  return {
    get: (url: string, options: ApiOptions = {}) =>
      apiCall(url, { ...options, method: "GET" }),

    post: (url: string, data?: any, options: ApiOptions = {}) =>
      apiCall(url, { ...options, method: "POST", body: data }),

    put: (url: string, data?: any, options: ApiOptions = {}) =>
      apiCall(url, { ...options, method: "PUT", body: data }),

    patch: (url: string, data?: any, options: ApiOptions = {}) =>
      apiCall(url, { ...options, method: "PATCH", body: data }),

    delete: (url: string, options: ApiOptions = {}) =>
      apiCall(url, { ...options, method: "DELETE" }),
  };
};
