// Environment variable helper for v0 runtime compatibility
// In v0, env vars are available directly on globalThis
const getEnv = (key: string): string => {
  if (typeof process !== "undefined" && process.env?.[key]) {
    return process.env[key] as string
  }
  // Fallback for v0 runtime
  return (globalThis as any)[key] || ""
}

export const DATABASE_URL = getEnv("DATABASE_URL")
export const GITHUB_CLIENT_ID = getEnv("GITHUB_CLIENT_ID")
export const GITHUB_CLIENT_SECRET = getEnv("GITHUB_CLIENT_SECRET")
export const CRON_SECRET = getEnv("CRON_SECRET")
export const NODE_ENV = getEnv("NODE_ENV") || "development"
