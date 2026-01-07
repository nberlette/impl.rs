import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { runGitHubSync } from "$lib/server/github";
import { runCratesSync } from "$lib/server/crates";
import { getSiteSettingValue } from "$lib/server/admin";
import { isCronAuthorized } from "$lib/server/cron";

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
    // const githubStats = await runGitHubSync(limit);
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // const cratesStats = await runCratesSync(Math.min(limit, 100));

    const [github, crates] = await Promise.all([
      runGitHubSync(limit),
      runCratesSync(limit),
    ]);

    return json({
      success: true,
      github,
      crates,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Full sync API error:", error);
    return json({ error: "Sync failed", message: String(error) }, {
      status: 500,
    });
  }
};
