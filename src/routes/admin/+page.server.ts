import type { PageServerLoad } from "./$types";
import {
  getAdminStats,
  getPendingSubmissions,
  getSyncLogs,
} from "$lib/server/admin";

export const load: PageServerLoad = async () => {
  const [stats, pendingSubmissions, recentSyncs] = await Promise.all([
    getAdminStats(),
    getPendingSubmissions(),
    getSyncLogs(5),
  ]);

  return {
    stats,
    pendingSubmissions: pendingSubmissions.slice(0, 5),
    recentSyncs,
  };
};
