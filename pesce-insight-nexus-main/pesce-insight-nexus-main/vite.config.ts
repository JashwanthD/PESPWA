// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // SPA mode: generates dist/client/_shell.html as a static entry point for Nginx.
  // Without this, the build only produces JS/CSS chunks with no index.html,
  // which causes Nginx to return 403 Forbidden on all routes.
  tanstackStart: {
    spa: {
      enabled: true,
    },
  },
  vite: {
    server: {
      proxy: {
        // Dev proxy: /api/* → FastAPI backend
        // Mirrors the Nginx reverse proxy used inside Docker
        "/api": {
          target: "http://127.0.0.1:8001",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  },
});

