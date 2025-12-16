// Environment variable helper for v0 and standard SvelteKit compatibility

function getEnv(key: string, fallback = ""): string {
  // Check process.env first (standard Node.js)
  if (typeof process !== "undefined" && process.env?.[key]) {
    return process.env[key]
  }

  // Check globalThis for v0 runtime
  if (typeof globalThis !== "undefined" && (globalThis as any)[key]) {
    return (globalThis as any)[key]
  }

  // Check import.meta.env for Vite/SvelteKit
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.[key]) {
    return (import.meta as any).env[key]
  }

  return fallback
}

export const DATABASE_URL = getEnv("DATABASE_URL")
export const GITHUB_CLIENT_ID = getEnv("GITHUB_CLIENT_ID")
export const GITHUB_CLIENT_SECRET = getEnv("GITHUB_CLIENT_SECRET")
export const CRON_SECRET = getEnv("CRON_SECRET")
export const NODE_ENV = getEnv("NODE_ENV", "development")
