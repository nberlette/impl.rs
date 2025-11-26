import type { PageServerLoad, Actions } from "./$types"
import { getSyncLogs } from "$lib/server/admin"
import { sql } from "$lib/server/db"
import { fail } from "@sveltejs/kit"

export const load: PageServerLoad = async () => {
  const syncLogs = await getSyncLogs(50)
  return { syncLogs }
}

export const actions: Actions = {
  triggerSync: async () => {
    try {
      await sql`
        INSERT INTO sync_logs (sync_type, status)
        VALUES ('manual', 'pending')
      `
      return { success: true, message: "Sync triggered successfully" }
    } catch (err) {
      return fail(500, { error: "Failed to trigger sync" })
    }
  },
}
