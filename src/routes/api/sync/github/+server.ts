import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import { runGitHubSync } from "$lib/server/github"

export const POST: RequestHandler = async ({ request }) => {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const stats = await runGitHubSync(100)

    return json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("GitHub sync API error:", error)
    return json({ error: "Sync failed", message: String(error) }, { status: 500 })
  }
}

export const GET: RequestHandler = async () => {
  return json({
    message: "Use POST to trigger GitHub sync",
    endpoint: "/api/sync/github",
  })
}
