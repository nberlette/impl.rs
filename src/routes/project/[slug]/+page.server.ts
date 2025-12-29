import type { PageServerLoad } from "./$types";
import { getProjectBySlug } from "$lib/server/projects";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params }) => {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    throw error(404, "Project not found");
  }

  return { project };
};
