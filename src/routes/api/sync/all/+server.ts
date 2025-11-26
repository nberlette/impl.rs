import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import { runGitHubSync } from "$lib/server/github"
import { runCratesSync } from "$lib/server/crates"

export const POST: RequestHandler = async ({ request }) => {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const githubStats = await runGitHubSync(100)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const cratesStats = await runCratesSync(50)

    return json({
      success: true,
      github: githubStats,
      crates: cratesStats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Full sync API error:", error)
    return json({ error: "Sync failed", message: String(error) }, { status: 500 })
  }
}
