import type { Actions, PageServerLoad } from "./$types";
import {
  getSiteSettingValue,
  getSyncLogs,
  logAuditAction,
} from "$lib/server/admin";
import { fail } from "@sveltejs/kit";
import { requireAdmin } from "$lib/server/admin-auth";
import { runGitHubSync } from "$lib/server/github";
import { runCratesSync } from "$lib/server/crates";
import { computeAllRankings } from "$lib/server/rankings";
import { sql } from "$lib/server/db";
import { RANKING_TYPES } from "$lib/rankings";

export const load: PageServerLoad = async ({ cookies }) => {
  await requireAdmin(cookies);
  const syncLogs = await getSyncLogs(50);
  return {
    syncLogs,
    metadata: {
      title: "Scrape & Sync",
      description:
        "Manage the crawler and synchronize impl.rs with GitHub and crates.io",
    },
  };
};

export const actions: Actions = {
  triggerSync: async ({ cookies }) => {
    const { admin } = await requireAdmin(cookies);
    try {
      const maxProjects = await getSiteSettingValue(
        "max_projects_per_sync",
        100,
      );
      const limit = Math.max(Number(maxProjects) || 100, 1);

      await logAuditAction(admin.id, "sync_triggered", "sync", -1, {
        limit,
        mode: "all",
      });

      const [github, crates] = await Promise.all([
        runGitHubSync(limit),
        runCratesSync(limit),
      ]);

      await logAuditAction(admin.id, "sync_completed", "sync", -1, {
        github,
        crates,
        mode: "all",
      });

      return {
        success: true,
        message: "Sync completed successfully",
      };
    } catch (err) {
      return fail(500, { error: "Failed to trigger sync" });
    }
  },
  syncExisting: async ({ cookies }) => {
    const { admin } = await requireAdmin(cookies);
    try {
      const maxProjects = await getSiteSettingValue(
        "max_projects_per_sync",
        100,
      );
      const limit = Math.max(Number(maxProjects) || 100, 1);

      await logAuditAction(admin.id, "sync_triggered", "sync", -1, {
        limit,
        mode: "existing",
      });

      const github = await runGitHubSync(limit, "existing");

      await logAuditAction(admin.id, "sync_completed", "sync", -1, {
        github,
        mode: "existing",
      });

      return {
        success: true,
        message: "Existing projects synced successfully",
      };
    } catch (err) {
      return fail(500, { error: "Failed to sync existing projects" });
    }
  },
  discoverNew: async ({ cookies }) => {
    const { admin } = await requireAdmin(cookies);
    try {
      const maxProjects = await getSiteSettingValue(
        "max_projects_per_sync",
        100,
      );
      const limit = Math.max(Number(maxProjects) || 100, 1);

      await logAuditAction(admin.id, "sync_triggered", "sync", -1, {
        limit,
        mode: "discover",
      });

      const github = await runGitHubSync(limit, "discover");

      await logAuditAction(admin.id, "sync_completed", "sync", -1, {
        github,
        mode: "discover",
      });

      return {
        success: true,
        message: "New projects discovered successfully",
      };
    } catch (err) {
      return fail(500, { error: "Failed to discover new projects" });
    }
  },
  computeRankings: async ({ cookies }) => {
    const { admin } = await requireAdmin(cookies);
    try {
      const stats = await computeAllRankings();
      const total_rankings = RANKING_TYPES.reduce(
        (sum, type) => sum + stats[type],
        0,
      );
      await logAuditAction(admin.id, "rankings_computed", "ranking", 0, {
        total_rankings,
        stats,
      });
      return {
        success: true,
        message:
          `Rankings computed, total of ${total_rankings} metrics updated.`,
      };
    } catch (err) {
      return fail(500, { error: "Failed to compute rankings" });
    }
  },
  cancelSync: async ({ request, cookies }) => {
    const { admin } = await requireAdmin(cookies);
    const formData = await request.formData();
    const id = Number.parseInt(formData.get("id") as string);
    if (!Number.isFinite(id)) {
      return fail(400, { error: "Invalid sync id" });
    }

    try {
      const result = await sql`
        UPDATE sync_logs
        SET status = 'cancelled', completed_at = NOW()
        WHERE id = ${id} AND status IN ('running', 'pending')
        RETURNING *
      `;

      if (result.length === 0) {
        return fail(400, { error: "Sync is not running" });
      }

      await logAuditAction(admin.id, "sync_cancelled", "sync", id, result[0]);

      return { success: true, message: "Sync cancelled" };
    } catch (err) {
      return fail(500, { error: "Failed to cancel sync" });
    }
  },
  purgeLogs: async ({ request, cookies }) => {
    const { admin } = await requireAdmin(cookies);
    const formData = await request.formData();
    const status = String(formData.get("status") || "failed");
    const days = Number.parseInt(formData.get("days") as string);
    const olderThanDays = Number.isFinite(days) ? Math.max(days, 0) : 30;

    const statusFilter =
      status === "failed" || status === "completed" || status === "cancelled"
        ? status
        : "failed";

    try {
      const deleted = await sql`
        DELETE FROM sync_logs
        WHERE status = ${statusFilter}
          AND started_at < NOW() - ${olderThanDays} * INTERVAL '1 day'
        RETURNING id
      `;

      await logAuditAction(admin.id, "sync_logs_purged", "sync", 0, {
        status: statusFilter,
        older_than_days: olderThanDays,
        deleted_count: deleted.length,
        deleted_ids: deleted.map((row) => row.id),
      });

      return {
        success: true,
        message: `Purged ${deleted.length} ${statusFilter} logs`,
      };
    } catch (err) {
      return fail(500, { error: "Failed to purge logs" });
    }
  },
};
