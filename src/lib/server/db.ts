import { neon } from "@neondatabase/serverless"

let _sql = null;

export function getSql() {
  if (!_sql) {
    const dbUrl =
      process.env.DATABASE_URL ||
      globalThis.DATABASE_URL ||
      (typeof import.meta !== "undefined" && import.meta.env?.DATABASE_URL);

    if (!dbUrl) {
      throw new Error(
        "DATABASE_URL environment variable is not set. " +
          "Please check that the Neon integration is connected in the 'Vars' section.",
      );
    }

    _sql = neon(dbUrl);
  }
  return _sql
}

// Export sql getter for backwards compatibility
export const sql = new Proxy(() => {}, {
  get(_, prop) {
    return getSql()[prop];
  },
  apply(_, thisArg, args) {
    return getSql().apply(thisArg, args);
  },
  ownKeys(t) {
    return Reflect.ownKeys(getSql());
  },
  has(t, p) {
    return Reflect.has(getSql(), p);
  },
})
