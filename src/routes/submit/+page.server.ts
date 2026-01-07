import type { Actions } from "./$types";
import { sql } from "$lib/server/db";
import { fail } from "@sveltejs/kit";

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const github_url = formData.get("github_url") as string;
    const submitted_by_email = formData.get("email") as string;
    const submitted_by_name = formData.get("name") as string;
    const reason = formData.get("reason") as string;

    if (!github_url) {
      return fail(400, { error: "GitHub URL is required", github_url });
    }

    const githubUrlPattern = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;
    if (!githubUrlPattern.test(github_url)) {
      return fail(400, {
        error: "Please provide a valid GitHub repository URL",
        github_url,
      });
    }

    try {
      const existing = await sql`
        SELECT * FROM user_submissions
        WHERE github_url = ${github_url}
        LIMIT 1
      `;

      if (existing.length > 0) {
        let error = "This project is already ";
        if (existing[0].status === "pending") {
          error += "pending review. Check back soon!";
        } else if (existing[0].status === "approved") {
          error += "approved and in our database!";
        } else {
          error =
            "This project was previously submitted, but appears to have been rejected. If you feel this is an error, please contact us!";
        }

        return fail(400, { error, github_url });
      }

      await sql`
        INSERT INTO user_submissions
        (github_url, submitted_by_email, submitted_by_name, reason)
        VALUES (${github_url}, ${submitted_by_email || null},
                ${submitted_by_name || null}, ${reason || null})
      `;

      return { success: true };
    } catch (err) {
      console.error("Submission error:", err);
      return fail(500, {
        error: "An error occurred. Please try again.",
        github_url,
      });
    }
  },
};
