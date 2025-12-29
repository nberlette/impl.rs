import { neon } from "@neondatabase/serverless";
import { DATABASE_URL } from "$env/static/private";

let _sql: ReturnType<typeof neon> = null!;

export function getSql() {
  if (!_sql) {
    const dbUrl = DATABASE_URL ||
      (typeof import.meta !== "undefined" && import.meta.env?.DATABASE_URL);

    if (!dbUrl) {
      throw new Error(
        "DATABASE_URL environment variable is not set. " +
          "Please check that the Neon integration is connected in the 'Vars' section.",
      );
    }

    _sql = neon(dbUrl);
  }
  return _sql;
}

export type Sql = ReturnType<typeof neon>;

export const sql: Sql = new Proxy((() => {}) as {} as Sql, {
  get(_, prop) {
    return (getSql() as any)[prop];
  },
  apply(_, thisArg, args) {
    return getSql().apply(thisArg, args as Parameters<Sql>);
  },
  ownKeys(t) {
    return Reflect.ownKeys(getSql());
  },
  has(t, p) {
    return Reflect.has(getSql(), p);
  },
});
