<script lang="ts">
  import type { PageData } from "./$types";
  import Card from "$lib/components/ui/card.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import {
    CheckCircle,
    RefreshCw,
    Save,
    Settings,
    XCircle,
  } from "lucide-svelte";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  type StatusState = "idle" | "saving" | "success" | "error";
  type StatusEntry = { state: StatusState; message?: string };
  let statusByKey = $state<Record<string, StatusEntry>>({});

  const handleResult = (
    key: string,
    result: { type?: string; data?: { error?: string } },
  ) => {
    if (
      !result.type ||
      result.type === "success" ||
      result.type === "redirect" ||
      (result.type === "failure" && !result.data?.error)
    ) {
      statusByKey = {
        ...statusByKey,
        [key]: { state: "success", message: "Saved" },
      };
      setTimeout(() => {
        if (statusByKey[key]?.state === "success") {
          statusByKey = {
            ...statusByKey,
            [key]: { state: "idle" },
          };
        }
      }, 2000);
      return;
    }

    if (result.type === "failure") {
      statusByKey = {
        ...statusByKey,
        [key]: {
          state: "error",
          message: result.data?.error || "Save failed",
        },
      };
      return;
    }

    statusByKey = {
      ...statusByKey,
      [key]: { state: "error", message: "Save failed" },
    };
  };

  const enhanceSettings = ({
    formData,
  }: {
    formData: FormData;
  }) => {
    const key = String(formData.get("key") || "");
    if (key) {
      statusByKey = {
        ...statusByKey,
        [key]: { state: "saving" },
      };
    }
    return async ({
      result,
      update,
    }: {
      result: { type?: string; data?: { error?: string } };
      update: (opts?: { reset?: boolean }) => Promise<void>;
    }) => {
      await update({ reset: false });
      if (result.type !== "error") {
        await invalidateAll();
      }
      if (key) {
        handleResult(key, result);
      }
    };
  };
</script>

<div class="space-y-6">
  <Card class="divide-y">
    {#each data.settings as setting}
      <form
        method="POST"
        action="?/update"
        use:enhance={enhanceSettings}
        class="
          flex flex-col gap-4 p-5 sm:flex-row sm:items-center
          sm:justify-between
        "
      >
        <div class="min-w-0 flex-1">
          <label for={setting.key} class="font-medium">
            {
              setting.key.replace(/_/g, " ").replace(/\b\w/g, (l) =>
                l.toUpperCase())
            }
          </label>
          <p class="text-sm text-muted-foreground">{setting.description}</p>
        </div>
        <div class="flex items-center gap-2">
          <input type="hidden" name="key" value={setting.key} />
          <input
            type="hidden"
            name="description"
            value={setting.description ?? ""}
          />
          <Input
            id={setting.key}
            name="value"
            type={typeof setting.value === "number" ? "number" : "text"}
            value={String(setting.value)}
            class="w-20"
          />
          <Button
            type="submit"
            size="icon"
            variant={statusByKey[setting.key]?.state === "error"
              ? "destructive"
              : "outline"}
            disabled={statusByKey[setting.key]?.state === "saving"}
            aria-live="polite"
            title={statusByKey[setting.key]?.state === "error"
              ? statusByKey[setting.key]?.message
              : undefined}
          >
            {#if statusByKey[setting.key]?.state === "saving"}
              <RefreshCw class="size-5 animate-spin" />
              <span class="sr-only">Saving</span>
            {:else if statusByKey[setting.key]?.state === "success"}
              <CheckCircle class="size-5" />
              <span class="sr-only">Saved</span>
            {:else if statusByKey[setting.key]?.state === "error"}
              <XCircle class="size-5" />
              <span class="sr-only">Retry</span>
            {:else}
              <Save class="size-5" />
              <span class="sr-only">Save</span>
            {/if}
          </Button>
        </div>
      </form>
    {/each}
  </Card>

  <Card class="p-5">
    <div class="flex items-start gap-4">
      <Settings class="size-5 text-muted-foreground" />
      <div>
        <h3 class="font-semibold">About Settings</h3>
        <p class="mt-1 text-sm text-muted-foreground">
          These settings control how impl.rs operates. Changes take effect
          immediately. Be careful when modifying sync intervals or thresholds as
          they can affect system performance.
        </p>
      </div>
    </div>
  </Card>
</div>
