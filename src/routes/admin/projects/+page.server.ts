import type { Actions, PageServerLoad } from "./$types";
import {
  deleteProject,
  getAllProjects,
  updateProject,
} from "$lib/server/admin";
import { fail } from "@sveltejs/kit";
import { requireAdmin } from "$lib/server/admin-auth";

export const load: PageServerLoad = async ({ url, cookies }) => {
  await requireAdmin(cookies);
  const rawPage = Number.parseInt(url.searchParams.get("page") || "1");
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  const { projects, total } = await getAllProjects(limit, offset);

  return {
    projects,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    metadata: {
      title: "Projects",
      description: `Manage ${total} projects in the database`,
    },
  };
};

export const actions = {
  async toggleFeatured({ request, cookies }) {
    const { admin } = await requireAdmin(cookies);
    const formData = await request.formData();
    const id = Number.parseInt(formData.get("id") as string);
    const is_featured = !(formData.get("is_featured") === "true");

    try {
      await updateProject(id, { is_featured }, admin.id);
      return { success: true };
    } catch (err) {
      return fail(500, { error: "Failed to update project" });
    }
  },

  async toggleArchived({ request, cookies }) {
    const { admin } = await requireAdmin(cookies);
    const formData = await request.formData();
    const id = Number.parseInt(formData.get("id") as string);
    const isArchived = formData.get("is_archived") === "true";

    try {
      await updateProject(id, { is_archived: !isArchived }, admin.id);
      return { success: true };
    } catch (err) {
      return fail(500, { error: "Failed to update project" });
    }
  },

  async delete({ request, cookies }) {
    const { admin } = await requireAdmin(cookies);
    const formData = await request.formData();
    const id = Number.parseInt(formData.get("id") as string);

    try {
      await deleteProject(id, admin.id);
      return { success: true };
    } catch (err) {
      return fail(500, { error: "Failed to delete project" });
    }
  },
} as const satisfies Actions;
