import type { PageServerLoad } from "./$types";
import { sql } from "$lib/server/db";
import { requireAdmin } from "$lib/server/admin-auth";

export const load: PageServerLoad = async ({ cookies }) => {
  await requireAdmin(cookies);
  const [topByStars, topByDownloads, byLicense, byTopics, recentActivity] =
    await Promise.all([
      sql`
        SELECT name, slug, stars, forks
        FROM projects
        WHERE is_archived = false
        ORDER BY stars DESC
        LIMIT 10
      `,
      sql`
        SELECT name, slug, total_downloads, weekly_downloads
        FROM projects
        WHERE is_archived = false AND total_downloads > 0
        ORDER BY total_downloads DESC
        LIMIT 10
      `,
      sql`
        SELECT 
          COALESCE(license, 'Unknown') as license,
          COUNT(*) as count
        FROM projects
        WHERE is_archived = false
        GROUP BY license
        ORDER BY count DESC
        LIMIT 10
      `,
      sql`
        SELECT 
          unnest(topics) as topic,
          COUNT(*) as count
        FROM projects
        WHERE is_archived = false AND topics IS NOT NULL
        GROUP BY topic
        ORDER BY count DESC
        LIMIT 15
      `,
      sql`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM projects
        WHERE created_at > NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
    ]);

  return {
    topByStars,
    topByDownloads,
    byLicense,
    byTopics,
    recentActivity,
    metadata: {
      title: "Analytics",
      description: "Insights and metrics about your projects",
    },
  };
};
