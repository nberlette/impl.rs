import type { PageServerLoad } from "./$types";
import { getAuditLogFilters, searchAuditLogs } from "$lib/server/admin";
import { requireAdmin } from "$lib/server/admin-auth";

export const load: PageServerLoad = async ({ cookies, url }) => {
  await requireAdmin(cookies);
  const query = url.searchParams.get("q");
  const action = url.searchParams.get("action");
  const entityType = url.searchParams.get("entityType");
  const adminName = url.searchParams.get("admin");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const [auditLogs, filters] = await Promise.all([
    searchAuditLogs({
      limit: 200,
      query,
      action,
      entityType,
      adminName,
      from,
      to,
    }),
    getAuditLogFilters(),
  ]);

  return {
    auditLogs,
    filters,
    current: {
      q: query || "",
      action: action || "",
      entityType: entityType || "",
      admin: adminName || "",
      from: from || "",
      to: to || "",
    },
    metadata: {
      title: "Audit Logs",
      description: "Track all administrative actions",
    },
  };
};
