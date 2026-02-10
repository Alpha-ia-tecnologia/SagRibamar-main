import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  
  const corretorUrl = env.VITE_CORRETOR_URL || "http://localhost:5001";

  return {
    base: "/",
    plugins: [
      tailwindcss(),
      react(),
      federation({
        name: "sagMain",
        remotes: {
          sagCorretor: corretorUrl + "/assets/remoteEntry.js",
        },
        shared: ["react", "react-dom"],
      }),
    ],
    build: {
      target: "esnext",
      minify: false,
      cssCodeSplit: false,
    },
  };
});