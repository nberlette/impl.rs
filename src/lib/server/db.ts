import { neon } from "@neondatabase/serverless"
import { DATABASE_URL } from "./env"

if (!DATABASE_URL) {
  console.warn("DATABASE_URL is not set - database queries will fail")
}

export const sql = neon(DATABASE_URL)
