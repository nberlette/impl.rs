import type { Actions, PageServerLoad } from "./$types";
import {
  getSiteSettings,
  logAuditAction,
  updateSiteSetting,
} from "$lib/server/admin";
import { fail } from "@sveltejs/kit";
import { isString } from "@nick/is/string";
import { requireAdmin } from "$lib/server/admin-auth";

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

export const load: PageServerLoad = async ({ cookies }) => {
  await requireAdmin(cookies);
  const settings = await getSiteSettings();

  const merged = defaultSettings.map((d) => {
    const existing = settings.find((s) => s.key === d.key);
    if (!existing) return d;
    return {
      ...existing,
      value: existing.value ?? d.value,
      description: existing.description ?? d.description,
    };
  });

  return {
    settings: merged,
    metadata: {
      title: "Settings",
      description: "Configure your impl.rs platform",
    },
  };
};

export const actions = {
  async update({ request, cookies }) {
    const { admin } = await requireAdmin(cookies);
    const formData = await request.formData();
    const key = formData.get("key");
    const value = formData.get("value");
    const description = formData.get("description");

    if (!isString(key)) {
      throw fail(500, { error: `Invalid settings key: ${key}` as const });
    }
    let parsedValue: unknown = value;
    if (!isNaN(Number(value))) {
      parsedValue = Number(value);
    } else if (value === "true" || value === "false") {
      parsedValue = value === "true";
    }

    try {
      const settingId = await updateSiteSetting(
        key,
        parsedValue,
        admin.id,
        isString(description) && description.length ? description : undefined,
      );
      if (settingId) {
        await logAuditAction(
          admin.id,
          "setting_updated",
          "site_setting",
          settingId,
          {
            key,
          },
        );
      }
      return { success: true };
    } catch (err) {
      return fail(500, {
        error: "Failed to update setting. Caused by: " + err,
      });
    }
  },
} as const satisfies Actions;
