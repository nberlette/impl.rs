import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { runCratesSync } from "$lib/server/crates";
import { isCronAuthorized } from "$lib/server/cron";
import { getSiteSettingValue } from "$lib/server/admin";

export const POST: RequestHandler = async ({ request }) => {
  if (!isCronAuthorized(request)) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const maxProjects = await getSiteSettingValue(
      "max_projects_per_sync",
      50,
    );
    const limit = Math.max(Number(maxProjects) || 50, 1);
    const stats = await runCratesSync(Math.min(limit, 100));

    return json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Crates sync API error:", error);
    return json({ error: "Sync failed", message: String(error) }, {
      status: 500,
    });
  }
};

export const GET: RequestHandler = async () => {
  return json({
    message: "Use POST to trigger crates.io sync",
    endpoint: "/api/sync/crates",
  });
};
