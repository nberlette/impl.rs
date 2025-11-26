<script lang="ts">
  import type { PageData } from "./$types";
  import Card from "$lib/components/ui/card.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import { enhance } from "$app/forms";
  import { Settings, Save } from "lucide-svelte";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<div class="space-y-6">
  <div>
    <h2 class="text-2xl font-bold">Settings</h2>
    <p class="text-muted-foreground">Configure your impl.rs platform</p>
  </div>

  <Card class="divide-y">
    {#each data.settings as setting}
      <form
        method="POST"
        action="?/update"
        use:enhance
        class="flex flex-col gap-4 p-5 sm:flex-row sm:items-center 
               sm:justify-between"
      >
        <div class="min-w-0 flex-1">
          <label for={setting.key} class="font-medium">
            {setting.key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </label>
          <p class="text-sm text-muted-foreground">{setting.description}</p>
        </div>
        <div class="flex items-center gap-2">
          <input type="hidden" name="key" value={setting.key} />
          <Input
            id={setting.key}
            name="value"
            type={typeof setting.value === "number" ? "number" : "text"}
            value={String(setting.value)}
            class="w-32"
          />
          <Button type="submit" size="sm" variant="outline">
            <Save class="h-4 w-4" />
          </Button>
        </div>
      </form>
    {/each}
  </Card>

  <Card class="p-5">
    <div class="flex items-start gap-4">
      <Settings class="h-5 w-5 text-muted-foreground" />
      <div>
        <h3 class="font-semibold">About Settings</h3>
        <p class="mt-1 text-sm text-muted-foreground">
          These settings control how impl.rs operates. Changes take effect
          immediately. Be careful when modifying sync intervals or thresholds
          as they can affect system performance.
        </p>
      </div>
    </div>
  </Card>
</div>
