import type { PageServerLoad, Actions } from "./$types"
import { getAllProjects, updateProject, deleteProject } from "$lib/server/admin"
import { fail } from "@sveltejs/kit"

export const load: PageServerLoad = async ({ url }) => {
  const page = Number.parseInt(url.searchParams.get("page") || "1")
  const limit = 20
  const offset = (page - 1) * limit

  const { projects, total } = await getAllProjects(limit, offset)

  return {
    projects,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

export const actions: Actions = {
  toggleFeatured: async ({ request }) => {
    const formData = await request.formData()
    const id = Number.parseInt(formData.get("id") as string)
    const isFeatured = formData.get("is_featured") === "true"

    try {
      await updateProject(id, { is_featured: !isFeatured })
      return { success: true }
    } catch (err) {
      return fail(500, { error: "Failed to update project" })
    }
  },

  toggleArchived: async ({ request }) => {
    const formData = await request.formData()
    const id = Number.parseInt(formData.get("id") as string)
    const isArchived = formData.get("is_archived") === "true"

    try {
      await updateProject(id, { is_archived: !isArchived })
      return { success: true }
    } catch (err) {
      return fail(500, { error: "Failed to update project" })
    }
  },

  delete: async ({ request }) => {
    const formData = await request.formData()
    const id = Number.parseInt(formData.get("id") as string)

    try {
      await deleteProject(id)
      return { success: true }
    } catch (err) {
      return fail(500, { error: "Failed to delete project" })
    }
  },
}
