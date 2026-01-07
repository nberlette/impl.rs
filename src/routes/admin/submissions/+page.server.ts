import type { Actions, PageServerLoad } from "./$types";
import { getAllSubmissions, updateSubmissionStatus } from "$lib/server/admin";
import { fail } from "@sveltejs/kit";
import { requireAdmin } from "$lib/server/admin-auth";

export const load: PageServerLoad = async ({ cookies }) => {
  await requireAdmin(cookies);
  const submissions = await getAllSubmissions(100, 0);
  return {
    submissions,
    metadata: {
      title: "Submissions",
      description: "Review and moderate user-submitted projects",
    },
  };
};

export const actions: Actions = {
  approve: async ({ request, cookies }) => {
    const { admin } = await requireAdmin(cookies);
    const formData = await request.formData();
    const id = Number.parseInt(formData.get("id") as string);
    const notes = formData.get("notes") as string;

    try {
      await updateSubmissionStatus(id, "approved", admin.id, notes);
      return { success: true };
    } catch (err) {
      return fail(500, { error: "Failed to approve submission" });
    }
  },

  reject: async ({ request, cookies }) => {
    const { admin } = await requireAdmin(cookies);
    const formData = await request.formData();
    const id = Number.parseInt(formData.get("id") as string);
    const notes = formData.get("notes") as string;

    try {
      await updateSubmissionStatus(id, "rejected", admin.id, notes);
      return { success: true };
    } catch (err) {
      return fail(500, { error: "Failed to reject submission" });
    }
  },
};
