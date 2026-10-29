import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  workers: 1,
  timeout: 45000,
  use: { baseURL: "http://localhost:5173", browserName: "chromium" },
  webServer: {
    command: "npm run preview -- --host localhost --port 5173 --strictPort",
    url: "http://localhost:5173",
    reuseExistingServer: false,
  },
});
