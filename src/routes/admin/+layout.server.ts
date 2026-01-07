import type { LayoutServerLoad } from "./$types";
import { requireAdmin } from "$lib/server/admin-auth";

export const load: LayoutServerLoad = async ({ cookies }) => {
  const { user } = await requireAdmin(cookies);

  // Don't expose the access token to the client
  return {
    user: {
      id: user.id,
      github_id: user.github_id,
      github_username: user.github_username,
      name: user.name,
      avatar_url: user.avatar_url,
      starred_projects: user.starred_projects,
    },
  };
};
