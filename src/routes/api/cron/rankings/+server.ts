import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { computeAllRankings } from "$lib/server/rankings";
import { sql } from "$lib/server/db";
import { isCronAuthorized } from "$lib/server/cron";
import { RANKING_TYPES } from "$lib/rankings";

export const POST: RequestHandler = async ({ request }) => {
  if (!isCronAuthorized(request)) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const syncLog = await sql`
    INSERT INTO sync_logs (sync_type, status)
    VALUES ('rankings', 'running')
    RETURNING id
  `;
  const syncLogId = syncLog[0].id;

  try {
    const stats = await computeAllRankings();

    const totalRankings = RANKING_TYPES.reduce(
      (sum, type) => sum + stats[type],
      0,
    );

    await sql`
      UPDATE sync_logs SET
        status = 'completed',
        projects_updated = ${totalRankings},
        completed_at = NOW()
      WHERE id = ${syncLogId}
    `;

    return json({
      success: true,
      stats,
      totalRankings,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Rankings computation error:", error);

    await sql`
      UPDATE sync_logs SET
        status = 'failed',
        errors_count = 1,
        error_details = ${JSON.stringify({ message: String(error) })},
        completed_at = NOW()
      WHERE id = ${syncLogId}
    `;

    return json({
      error: "Rankings computation failed",
      message: String(error),
    }, { status: 500 });
  }
};

export const GET: RequestHandler = async () => {
  return json({
    message: "Use POST to trigger rankings computation",
    endpoint: "/api/cron/rankings",
  });
};
