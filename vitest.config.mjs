import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

// Note: Storybook's browser-test project was removed — its aria-query ESM
// import breaks under vitest browser mode. Stories still run manually via
// `npm run storybook` (localhost:6006). Unit tests are the default gate.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src")
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e/**", "tests/e2e/**", "src/**/*.stories.*"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      exclude: ["node_modules/**", ".next/**", "src/**/*.d.ts"]
    }
  }
});
