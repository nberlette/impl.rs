<script lang="ts">
  import { formatNumber } from "$lib/utils";
  import { Download, Package, RefreshCw, Star } from "lucide-svelte";

  interface Props {
    totalProjects: number;
    totalStars: number;
    totalDownloads: number;
    recentlyUpdated: number;
  }

  let {
    totalProjects,
    totalStars,
    totalDownloads,
    recentlyUpdated,
  }: Props = $props();

  const stats = $derived([
    {
      label: "Projects",
      value: formatNumber(totalProjects),
      icon: Package,
    },
    {
      label: "Total Stars",
      value: formatNumber(totalStars),
      icon: Star,
    },
    {
      label: "Downloads",
      value: formatNumber(totalDownloads),
      icon: Download,
    },
    {
      label: "Updated This Week",
      value: formatNumber(recentlyUpdated),
      icon: RefreshCw,
    },
  ]);
</script>

<div
  class="grid grid-cols-2 gap-4 rounded-xl border bg-card p-4 md:grid-cols-4"
>
  {#each stats as stat}
    <div class="flex items-center gap-3">
      <div
        class="
          flex size-10 shrink-0 items-center justify-center rounded-lg
          bg-primary/10 text-primary
        "
      >
        <stat.icon class="size-5" />
      </div>
      <div>
        <p class="text-lg font-bold text-foreground">{stat.value}</p>
        <p class="text-xs text-foreground/70">{stat.label}</p>
      </div>
    </div>
  {/each}
</div>
