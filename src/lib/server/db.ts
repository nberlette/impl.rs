import { neon } from "@neondatabase/serverless"

// In SvelteKit, $env/static/private auto-exports env vars at build time
// We use a dynamic import pattern for flexibility
const DATABASE_URL = process.env.DATABASE_URL || ""

if (!DATABASE_URL) {
  console.warn("DATABASE_URL is not set - database queries will fail")
}

export const sql = neon(DATABASE_URL)
