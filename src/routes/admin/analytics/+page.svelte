<script lang="ts">
  import type { PageData } from "./$types";
  import Card from "$lib/components/ui/card.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import { formatNumber } from "$lib/utils";
  import { Download, Star, Scale, Tag, TrendingUp } from "lucide-svelte";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  function exportData(type: string) {
    const dataMap: Record<string, unknown[]> = {
      stars: data.topByStars,
      downloads: data.topByDownloads,
      licenses: data.byLicense,
      topics: data.byTopics
    };

    const exportData = dataMap[type];
    if (!exportData) return;

    const csv = [
      Object.keys(exportData[0] || {}).join(","),
      ...exportData.map((row) => Object.values(row as Record<string, unknown>).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `impl-rs-${type}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold">Analytics</h2>
      <p class="text-muted-foreground">Insights and metrics about your projects</p>
    </div>
    <Button variant="outline" onclick={() => exportData("stars")}>
      <Download class="h-4 w-4" />
      Export
    </Button>
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <Card class="p-5">
      <div class="mb-4 flex items-center gap-2">
        <Star class="h-5 w-5 text-primary" />
        <h3 class="font-semibold">Top by Stars</h3>
      </div>
      <div class="space-y-3">
        {#each data.topByStars as project, i}
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span
                class="flex h-6 w-6 items-center justify-center rounded-full 
                       bg-secondary text-xs font-medium"
              >
                {i + 1}
              </span>
              <a
                href="/project/{project.slug}"
                class="font-medium hover:text-primary"
              >
                {project.name}
              </a>
            </div>
            <span class="text-sm text-muted-foreground">
              {formatNumber(project.stars)} stars
            </span>
          </div>
        {/each}
      </div>
    </Card>

    <Card class="p-5">
      <div class="mb-4 flex items-center gap-2">
        <Download class="h-5 w-5 text-primary" />
        <h3 class="font-semibold">Top by Downloads</h3>
      </div>
      <div class="space-y-3">
        {#each data.topByDownloads as project, i}
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span
                class="flex h-6 w-6 items-center justify-center rounded-full 
                       bg-secondary text-xs font-medium"
              >
                {i + 1}
              </span>
              <a
                href="/project/{project.slug}"
                class="font-medium hover:text-primary"
              >
                {project.name}
              </a>
            </div>
            <span class="text-sm text-muted-foreground">
              {formatNumber(project.total_downloads)}
            </span>
          </div>
        {/each}
        {#if data.topByDownloads.length === 0}
          <p class="text-sm text-muted-foreground">No download data yet</p>
        {/if}
      </div>
    </Card>

    <Card class="p-5">
      <div class="mb-4 flex items-center gap-2">
        <Scale class="h-5 w-5 text-primary" />
        <h3 class="font-semibold">By License</h3>
      </div>
      <div class="space-y-2">
        {#each data.byLicense as item}
          <div class="flex items-center justify-between">
            <span class="text-sm">{item.license}</span>
            <div class="flex items-center gap-2">
              <div class="h-2 w-24 overflow-hidden rounded-full bg-secondary">
                <div
                  class="h-full bg-primary"
                  style="width: {Math.min(
                    (Number(item.count) / Number(data.byLicense[0]?.count || 1)) * 100,
                    100
                  )}%"
                ></div>
              </div>
              <span class="w-8 text-right text-xs text-muted-foreground">
                {item.count}
              </span>
            </div>
          </div>
        {/each}
      </div>
    </Card>

    <Card class="p-5">
      <div class="mb-4 flex items-center gap-2">
        <Tag class="h-5 w-5 text-primary" />
        <h3 class="font-semibold">Popular Topics</h3>
      </div>
      <div class="flex flex-wrap gap-2">
        {#each data.byTopics as item}
          <span
            class="rounded-full bg-secondary px-3 py-1 text-sm 
                   text-secondary-foreground"
          >
            {item.topic}
            <span class="ml-1 text-xs text-muted-foreground">{item.count}</span>
          </span>
        {/each}
      </div>
    </Card>
  </div>

  <Card class="p-5">
    <div class="mb-4 flex items-center gap-2">
      <TrendingUp class="h-5 w-5 text-primary" />
      <h3 class="font-semibold">Projects Added (Last 30 Days)</h3>
    </div>
    <div class="flex h-32 items-end gap-1">
      {#each data.recentActivity as day}
        <div
          class="flex-1 rounded-t bg-primary/80 transition-all hover:bg-primary"
          style="height: {Math.max(
            (Number(day.count) /
              Math.max(...data.recentActivity.map((d) => Number(d.count)), 1)) *
              100,
            4
          )}%"
          title="{day.date}: {day.count} projects"
        ></div>
      {/each}
      {#if data.recentActivity.length === 0}
        <p class="w-full text-center text-sm text-muted-foreground">
          No recent activity
        </p>
      {/if}
    </div>
  </Card>
</div>
