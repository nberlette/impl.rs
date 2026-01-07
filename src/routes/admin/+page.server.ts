import type { PageServerLoad } from "./$types";
import {
  getAdminStats,
  getPendingSubmissions,
  getSyncLogs,
} from "$lib/server/admin";
import { requireAdmin } from "$lib/server/admin-auth";

export const load: PageServerLoad = async ({ cookies }) => {
  await requireAdmin(cookies);
  const [stats, pendingSubmissions, recentSyncs] = await Promise.all([
    getAdminStats(),
    getPendingSubmissions(),
    getSyncLogs(5),
  ]);

  return {
    stats,
    pendingSubmissions: pendingSubmissions.slice(0, 5),
    recentSyncs,
    metadata: {
      title: "Dashboard",
      description: "Overview of your impl.rs platform",
    },
  };
};
