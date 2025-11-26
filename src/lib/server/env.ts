function env(key: string, fallback = ""): string {
  if (typeof process !== "undefined" && process.env?.[key]) {
    return process.env[key];
  }
  return (globalThis as any)[key] || fallback;
}

export const DATABASE_URL = env("DATABASE_URL");

export const GITHUB_CLIENT_ID = env("GITHUB_CLIENT_ID");

export const GITHUB_CLIENT_SECRET = env("GITHUB_CLIENT_SECRET");

export const CRON_SECRET = env("CRON_SECRET");

export const NODE_ENV = env("NODE_ENV") || "development";
