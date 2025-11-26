import type { PageServerLoad, Actions } from "./$types"
import { getAllSubmissions, updateSubmissionStatus } from "$lib/server/admin"
import { fail } from "@sveltejs/kit"

export const load: PageServerLoad = async () => {
  const submissions = await getAllSubmissions(100, 0)
  return { submissions }
}

export const actions: Actions = {
  approve: async ({ request }) => {
    const formData = await request.formData()
    const id = Number.parseInt(formData.get("id") as string)
    const notes = formData.get("notes") as string

    try {
      await updateSubmissionStatus(id, "approved", 1, notes)
      return { success: true }
    } catch (err) {
      return fail(500, { error: "Failed to approve submission" })
    }
  },

  reject: async ({ request }) => {
    const formData = await request.formData()
    const id = Number.parseInt(formData.get("id") as string)
    const notes = formData.get("notes") as string

    try {
      await updateSubmissionStatus(id, "rejected", 1, notes)
      return { success: true }
    } catch (err) {
      return fail(500, { error: "Failed to reject submission" })
    }
  },
}
