import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { fileURLToPath, URL } from "node:url";

const monacoEsm = fileURLToPath(new URL("./node_modules/monaco-editor/esm/vs", import.meta.url));

export default defineConfig({
  build: {
    assetsDir: "statics",
    emptyOutDir: false,
  },
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      {
        // monaco-editor's "exports" map does not expose deep esm subpaths, so
        // the worker entry points must be aliased to concrete files.
        find: "monaco-editor/esm/vs/editor/editor.worker.js",
        replacement: `${monacoEsm}/editor/editor.worker.js`,
      },
      {
        find: "monaco-editor/esm/vs/language/json/json.worker.js",
        replacement: `${monacoEsm}/language/json/json.worker.js`,
      },
      {
        // The package root resolves to esm/vs/index.js (bare API without the
        // editor.main contributions and language features) — point the bare
        // specifier at the full editor bundle instead.
        find: "monaco-editor",
        replacement: `${monacoEsm}/editor/editor.main.js`,
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
  },
});
