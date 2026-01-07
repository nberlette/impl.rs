import { type FullQueryResults, neon } from "@neondatabase/serverless";
import { DATABASE_URL } from "$env/static/private";

let _sql: SqlTag = null!;
let _sqlFull: ExtTag | null;

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
    // @ts-ignore readonly re-assignment
    _sql.full = _sqlFull ??= neon(dbUrl, { fullResults: true });
  }
  return _sql;
}

type SqlTag = ReturnType<typeof neon<false, false>>;
type ExtTag = ReturnType<typeof neon<false, true>>;

export type FullResults<T extends Record<string, unknown>> =
  & Omit<FullQueryResults<false>, "rows">
  & {
    readonly rows: T[];
  };

export interface SqlFull extends ExtTag {
  <T extends Record<string, any>>(
    ...args: Parameters<ExtTag>
  ): Promise<FullResults<T>>;
}

export interface Sql extends SqlTag {
  <T extends Record<string, any>>(...args: Parameters<SqlTag>): Promise<T[]>;

  readonly full: SqlFull;
}

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
