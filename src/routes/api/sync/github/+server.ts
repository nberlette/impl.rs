import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { runGitHubSync } from "$lib/server/github";
import { isCronAuthorized } from "$lib/server/cron";
import { getSiteSettingValue } from "$lib/server/admin";

export const POST: RequestHandler = async ({ request }) => {
  if (!isCronAuthorized(request)) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const maxProjects = await getSiteSettingValue(
      "max_projects_per_sync",
      100,
    );
    const limit = Math.max(Number(maxProjects) || 100, 1);
    const url = new URL(request.url);
    const modeParam = url.searchParams.get("mode");
    const mode =
      modeParam === "existing" || modeParam === "discover" ? modeParam : "all";
    const stats = await runGitHubSync(limit, mode);

    return json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GitHub sync API error:", error);
    return json({ error: "Sync failed", message: String(error) }, {
      status: 500,
    });
  }
};

export const GET: RequestHandler = async () => {
  return json({
    message: "Use POST to trigger GitHub sync",
    endpoint: "/api/sync/github",
    modes: ["all", "existing", "discover"],
  });
};
