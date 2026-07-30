import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

// Standard TanStack Start + Vite + React + Tailwind v4 config for Node/Render.
// The custom SSR error wrapper lives in src/server.ts.
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    tanstackStart({ server: { entry: "server" } }),
    tsConfigPaths(),
  ],
});
