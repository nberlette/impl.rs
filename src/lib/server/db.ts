import { neon } from "@neondatabase/serverless"

let _sql: ReturnType<typeof neon> | null = null

export function getSql() {
  if (!_sql) {
    // In v0 runtime, env vars might be in different locations
    const dbUrl =
      process.env.DATABASE_URL ||
      (globalThis as any).DATABASE_URL ||
      (typeof import.meta !== "undefined" && (import.meta as any).env?.DATABASE_URL)

    if (!dbUrl) {
      throw new Error(
        "DATABASE_URL environment variable is not set. " +
          "Please check that the Neon integration is connected in the 'Vars' section.",
      )
    }

    _sql = neon(dbUrl)
  }
  return _sql
}

// Export sql getter for backwards compatibility
export const sql = new Proxy({} as ReturnType<typeof neon>, {
  get(target, prop) {
    return (getSql() as any)[prop]
  },
  apply(target, thisArg, args) {
    return getSql().apply(thisArg, args)
  },
  ownKeys(t) {
    return Reflect.ownKeys(getSql());
  },
  has(t, p) {
    return Reflect.has(getSql(), p);
  },
})
