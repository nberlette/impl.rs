<script lang="ts">
  import { cn, formatNumber, timeAgo } from "$lib/utils";
  import Badge from "$lib/components/ui/badge.svelte";
  import Card from "$lib/components/ui/card.svelte";
  import type { RankedProject } from "$lib/types";
  import {
    Star,
    GitFork,
    Download,
    Clock,
    ExternalLink,
    TrendingUp,
    Flame,
    Sparkles,
    Trophy
  } from "lucide-svelte";

  interface Props {
    project: RankedProject;
    rank?: number;
    showRankBadge?: boolean;
    class?: string;
  }

  let {
    project,
    rank,
    showRankBadge = false,
    class: className = ""
  }: Props = $props();

  const rankingIcons = {
    hot: Flame,
    trending: TrendingUp,
    new: Sparkles,
    top: Trophy
  };

  let RankIcon = $derived(
    project.ranking?.ranking_type
      ? rankingIcons[project.ranking.ranking_type]
      : null
  );
</script>

<Card class={cn("group relative overflow-hidden transition-all", 
  "hover:shadow-md hover:border-primary/20", className)}>
  <a
    href="/project/{project.slug}"
    class="block p-5"
    aria-label="View {project.name} project details"
  >
    {#if showRankBadge && rank}
      <div
        class="absolute top-3 right-3 flex h-8 w-8 items-center justify-center
               rounded-full bg-primary/10 text-sm font-bold text-primary"
      >
        #{rank}
      </div>
    {/if}

    <div class="flex items-start gap-4">
      {#if project.avatar_url}
        <img
          src={project.avatar_url || "/placeholder.svg"}
          alt=""
          class="h-12 w-12 rounded-lg bg-muted object-cover"
          loading="lazy"
        />
      {:else}
        <div
          class="flex h-12 w-12 items-center justify-center rounded-lg 
                 bg-primary/10 text-primary"
        >
          <span class="text-lg font-bold">
            {project.name.charAt(0).toUpperCase()}
          </span>
        </div>
      {/if}

      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <h3
            class="truncate text-lg font-semibold text-foreground 
                   group-hover:text-primary transition-colors"
          >
            {project.name}
          </h3>
          {#if project.is_featured}
            <Badge variant="default" class="text-[10px]">Featured</Badge>
          {/if}
          {#if project.is_user_submitted}
            <Badge variant="outline" class="text-[10px]">Community</Badge>
          {/if}
        </div>

        <p
          class="mt-1 line-clamp-2 text-sm text-muted-foreground text-pretty"
        >
          {project.description || "No description available"}
        </p>
      </div>
    </div>

    <div class="mt-4 flex flex-wrap gap-1.5">
      {#each (project.topics || []).slice(0, 4) as topic}
        <span
          class="rounded-full bg-secondary px-2 py-0.5 text-xs 
                 text-secondary-foreground"
        >
          {topic}
        </span>
      {/each}
      {#if project.topics && project.topics.length > 4}
        <span class="text-xs text-muted-foreground">
          +{project.topics.length - 4} more
        </span>
      {/if}
    </div>

    <div
      class="mt-4 flex flex-wrap items-center gap-4 text-sm 
             text-muted-foreground"
    >
      <div class="flex items-center gap-1" title="Stars">
        <Star class="h-4 w-4" />
        <span>{formatNumber(project.stars)}</span>
      </div>
      <div class="flex items-center gap-1" title="Forks">
        <GitFork class="h-4 w-4" />
        <span>{formatNumber(project.forks)}</span>
      </div>
      {#if project.total_downloads > 0}
        <div class="flex items-center gap-1" title="Downloads">
          <Download class="h-4 w-4" />
          <span>{formatNumber(project.total_downloads)}</span>
        </div>
      {/if}
      {#if project.last_commit_at}
        <div class="flex items-center gap-1" title="Last updated">
          <Clock class="h-4 w-4" />
          <span>{timeAgo(project.last_commit_at)}</span>
        </div>
      {/if}
    </div>

    {#if project.ranking?.score_breakdown}
      <div
        class="mt-3 flex items-center gap-2 border-t pt-3 text-xs 
               text-muted-foreground"
      >
        {#if RankIcon}
          <RankIcon class="h-3.5 w-3.5 text-primary" />
        {/if}
        <span>
          Score: {project.ranking.score.toFixed(2)}
        </span>
      </div>
    {/if}
  </a>
</Card>
