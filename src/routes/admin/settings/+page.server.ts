import type { Actions, PageServerLoad } from "./$types";
import { getSiteSettings, updateSiteSetting } from "$lib/server/admin";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async () => {
  const settings = await getSiteSettings();

  const defaultSettings = [
    {
      key: "sync_interval_hours",
      value: 6,
      description: "Hours between automatic GitHub syncs",
    },
    {
      key: "ranking_update_hours",
      value: 6,
      description: "Hours between ranking recalculations",
    },
    {
      key: "min_stars_threshold",
      value: 10,
      description: "Minimum stars required for auto-indexing",
    },
    {
      key: "max_projects_per_sync",
      value: 100,
      description: "Maximum projects to sync per run",
    },
    {
      key: "featured_project_count",
      value: 6,
      description: "Number of featured projects to display",
    },
  ];

  const mergedSettings = defaultSettings.map((defaultSetting) => {
    const existingSetting = settings.find((s) => s.key === defaultSetting.key);
    return existingSetting || defaultSetting;
  });

  return { settings: mergedSettings };
};

export const actions: Actions = {
  update: async ({ request }) => {
    const formData = await request.formData();
    const key = formData.get("key") as string;
    const value = formData.get("value") as string;

    try {
      let parsedValue: unknown = value;
      if (!isNaN(Number(value))) {
        parsedValue = Number(value);
      } else if (value === "true" || value === "false") {
        parsedValue = value === "true";
      }

      await updateSiteSetting(key, parsedValue, 1);
      return { success: true };
    } catch (err) {
      return fail(500, { error: "Failed to update setting" });
    }
  },
};
