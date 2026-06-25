/// <reference types="node" />

import { defineConfig } from "vite";
import { checker } from "vite-plugin-checker";

import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    checker({
      typescript: { tsconfigPath: "./tsconfig.json" },
      eslint: { useFlatConfig: true, lintCommand: 'eslint "./src"' },
      overlay: { initialIsOpen: "error" },
    }),
  ],
  // relativní base → funguje na root doméně i na GitHub Pages v podadresáři /<repo>/
  base: "./",
  build: {
    outDir: "build",
    target: "esnext",
    chunkSizeWarningLimit: 2000,
  },
  server: {
    open: true,
    port: 3000,
  },
});
