import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { verifyUserSession } from "$lib/server/github-auth";
import { getUserAccessToken } from "$lib/server/github-star";
import { starRepoOnGitHub, unstarRepoOnGitHub } from "$lib/server/github-star";
import {
  addStarredProject,
  removeStarredProject,
} from "$lib/server/github-auth";
import { sql } from "$lib/server/db";

export const POST: RequestHandler = async ({ request, cookies }) => {
  const sessionToken = cookies.get("session");
  if (!sessionToken) {
    return json({ error: "Not authenticated" }, { status: 401 });
  }

  const session = verifyUserSession(sessionToken);
  if (!session) {
    return json({ error: "Invalid session" }, { status: 401 });
  }

  const { projectId, action } = await request.json();

  if (!projectId || !["star", "unstar"].includes(action)) {
    return json({ error: "Invalid request" }, { status: 400 });
  }

  // Get project details
  const projects = await sql`
    SELECT repository_owner, repository_name 
    FROM projects WHERE id = ${projectId}
  `;

  if (projects.length === 0) {
    return json({ error: "Project not found" }, { status: 404 });
  }

  const { repository_owner, repository_name } = projects[0];

  // Get user's access token
  const accessToken = await getUserAccessToken(session.id);
  if (!accessToken) {
    return json({ error: "No GitHub access token" }, { status: 401 });
  }

  try {
    let success: boolean;

    if (action === "star") {
      success = await starRepoOnGitHub(
        accessToken,
        repository_owner,
        repository_name,
      );
      if (success) {
        await addStarredProject(session.id, projectId);
      }
    } else {
      success = await unstarRepoOnGitHub(
        accessToken,
        repository_owner,
        repository_name,
      );
      if (success) {
        await removeStarredProject(session.id, projectId);
      }
    }

    return json({ success, action });
  } catch (err) {
    console.error("Star action error:", err);
    return json({ error: "Failed to update star" }, { status: 500 });
  }
};
