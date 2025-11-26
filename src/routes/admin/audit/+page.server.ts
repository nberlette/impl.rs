import type { PageServerLoad } from "./$types"
import { getAuditLogs } from "$lib/server/admin"

export const load: PageServerLoad = async () => {
  const auditLogs = await getAuditLogs(100)
  return { auditLogs }
}
