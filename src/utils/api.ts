import { useAuth } from "../hooks/useAuth";

const API_URL = window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL;

interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
}

export const createAuthenticatedFetch = (token: string | null) => {
  return async (url: string, options: ApiOptions = {}) => {
    const { requireAuth = true, ...fetchOptions } = options;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    if (requireAuth && token) {
      // Garantir que o token não está vazio e tem o formato correto
      headers['Authorization'] = `Bearer ${token}`;
    }

    const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;

    return fetch(fullUrl, {
      ...fetchOptions,
      headers,
    });
  };
};

export const useApi = () => {
  const { token } = useAuth();
  
  const apiCall = createAuthenticatedFetch(token);
  
  return {
    get: (url: string, options: ApiOptions = {}) => 
      apiCall(url, { ...options, method: 'GET' }),
    
    post: (url: string, data?: any, options: ApiOptions = {}) => 
      apiCall(url, { 
        ...options, 
        method: 'POST', 
        body: data ? JSON.stringify(data) : undefined 
      }),
    
    put: (url: string, data?: any, options: ApiOptions = {}) => 
      apiCall(url, { 
        ...options, 
        method: 'PUT', 
        body: data ? JSON.stringify(data) : undefined 
      }),
    
    delete: (url: string, options: ApiOptions = {}) => 
      apiCall(url, { ...options, method: 'DELETE' }),
    
    patch: (url: string, data?: any, options: ApiOptions = {}) => 
      apiCall(url, { 
        ...options, 
        method: 'PATCH', 
        body: data ? JSON.stringify(data) : undefined 
      }),
  };
};
