import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  base: "/",
  plugins: [
    tailwindcss(),
    react(),
    federation({
      name: "sagMain",
      remotes: {
        sagCorretor: {
          external: `Promise.resolve((window.__ENV__?.CORRETOR_URL || import.meta.env.VITE_CORRETOR_URL || "http://localhost:5001") + "/assets/remoteEntry.js")`,
          externalType: "promise",
          from: "vite",
        },
      },
      shared: ["react", "react-dom"],
    }),
  ],
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
  },
});