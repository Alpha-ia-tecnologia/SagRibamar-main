// env.d.ts
declare global {
  interface Window {
    __ENV__?: {
      API_URL?: string;
      APP_NAME?: string;
    };
  }
}
export {};

// uso
const api = window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL ?? "https://fallback";
const appName = window.__ENV__?.APP_NAME ?? "SAG";
