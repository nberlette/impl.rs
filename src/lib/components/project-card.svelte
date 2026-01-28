<script lang="ts">
  import { cn, formatNumber, timeAgo } from "$lib/utils";
  import Badge from "$lib/components/ui/badge.svelte";
  import Card from "$lib/components/ui/card.svelte";
  import StarButton from "$lib/components/star-button.svelte";
  import type { RankedProject } from "$lib/types";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import {
    Clock,
    Download,
    Factory,
    Flame,
    GitFork,
    Newspaper,
    Sparkles,
    TrendingUp,
    Trophy,
  } from "lucide-svelte";
  import type { ClassValue } from "svelte/elements";
  import RankBadge from "./rank-badge.svelte";
  import { markdownToHTML } from "comrak";

  interface Props {
    project: RankedProject;
    rank?: number;
    showRankBadge?: boolean;
    showFeaturedBadge?: boolean;
    showContributedBadge?: boolean;
    class?: ClassValue;

    [rest: string]: unknown;
  }

  let {
    project = $bindable(),
    rank = $bindable(),
    showRankBadge = true,
    showContributedBadge = true,
    showFeaturedBadge = true,
    class: className = "",
    ...rest
  }: Props = $props();

  let user = $derived(page.data.user);

  const rankingIcons = {
    hot: Flame,
    trending: TrendingUp,
    recent: Factory,
    new: Newspaper,
    top: Trophy,
  };

  let RankIcon = $derived(
    project.ranking?.ranking_type
      ? rankingIcons[project.ranking.ranking_type]
      : null,
  );

  function handleCardClick(event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    if (target?.closest("a,button")) return;
    void goto(`/project/${project.slug}`);
  }

  function handleCardKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null;
    if (target?.closest("a,button")) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      void goto(`/project/${project.slug}`);
    }
  }
</script>

<Card
  class={[
    "group relative overflow-hidden transition-all shadow-sm",
    "hover:shadow-md hover:border-primary/20!",
    className,
  ]}
  role="link"
  tabindex="0"
  aria-label={`View details for ${project.name}`}
  onkeydown={handleCardKeydown}
>
  <div class="relative z-10 block p-5">
    {#if showRankBadge && rank}
      <RankBadge {rank} variant="muted" size="md" prefix="" />
    {/if}

    <div class="flex items-start gap-4">
      <a
        href={`/project/${project.slug}`}
        data-sveltekit-preload-data
        data-sveltekit-preload-code="viewport"
      >
        {#if project.avatar_url}
          <img
            src={project.avatar_url}
            alt=""
            class="size-12 rounded-lg bg-muted object-cover"
            loading="lazy"
          />
        {:else}
          <div
            class="
              flex size-12 items-center justify-center rounded-lg
              bg-primary/10 text-primary
            "
          >
            <span class="text-lg font-bold">
              {project.name.charAt(0).toUpperCase()}
            </span>
          </div>
        {/if}
      </a>

      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <a
            href="/project/{project.slug}"
            class="
              truncate text-lg font-semibold text-foreground
              group-hover:text-primary transition-colors
            "
            data-sveltekit-preload-code="viewport"
            data-sveltekit-preload-data="hover"
          >
            {project.name}
          </a>
          {#if project.is_featured && showFeaturedBadge}
            <Badge variant="default" class="text-2xs lowercase">Feat<span
                class="not-lg:sr-only"
              >ured</span></Badge>
          {/if}
          {#if project.is_user_submitted && showContributedBadge}
            <Badge variant="outline" class="text-2xs lowercase">Contrib<span
                class="not-lg:sr-only"
              >uted</span></Badge>
          {/if}
        </div>

        {#if project.description}
          {@const           description = markdownToHTML(project.description, {
            extension: { shortcodes: true, tasklist: true },
          })}
          <p
            class="mt-1 line-clamp-3 text-sm text-foreground/70 text-pretty"
          >
            {@html description}
          </p>
        {/if}
      </div>
    </div>

    <div class="mt-4 flex flex-wrap gap-1.5">
      {#each (project.topics || []).slice(0, 8) as topic}
        <span
          class="
            rounded-full bg-secondary px-2 py-0.5 text-xs select-none
            text-secondary-foreground/40 hover:text-secondary-foreground
            shadow-sm hover:shadow-md duration-300 transition-all ease-in-out
          "
        >
          {topic}
        </span>
      {/each}
      {#if project.topics && project.topics.length > 8}
        <span class="text-xs text-foreground/60">
          +{project.topics.length - 8} more
        </span>
      {/if}
    </div>

    <div
      class="mt-4 flex flex-wrap items-center justify-between gap-4"
    >
      <div class="flex flex-wrap items-center gap-4 text-sm text-foreground/70">
        <StarButton
          projectId={project.id}
          isAuthenticated={!!user}
          count={project.stars}
          showCount
          size="sm"
          label="sr-only"
        />
        <a
          class="select-none inline-flex items-center gap-1 text-xs"
          title="Forks"
          href="https://github.com/{project.repository_owner}/{project.repository_name}/forks"
          target="_blank"
          rel="noreferrer"
        >
          <GitFork class="size-4" />
          <span>{formatNumber(project.forks)}</span>
        </a>
        {#if project.total_downloads > 0}
          <a
            href="/project/{project.slug}/#downloads"
            class="inline-flex items-center gap-1 select-none text-xs"
            title="{project.name} has been downloaded {formatNumber(project.total_downloads)} times!"
          >
            <Download class="size-4" />
            <span>{formatNumber(project.total_downloads)}</span>
          </a>
        {/if}
        {#if project.last_commit_at}
          <a
            class="select-none inline-flex items-center gap-1 text-xs"
            title="Last updated"
            href="https://github.com/{project.repository_owner}/{project.repository_name}/commits"
            target="_blank"
            rel="noreferrer"
          >
            <Clock class="size-4" />
            <time datetime={project.last_commit_at}>{
              timeAgo(project.last_commit_at)
            }</time>
          </a>
        {/if}
      </div>
    </div>

    {#if project.ranking?.score_breakdown}
      <div
        class="
          mt-3 flex items-center gap-2 border-t pt-3 text-xs
          text-foreground/60 select-none
        "
      >
        {#if RankIcon}
          <RankIcon class="h-3.5 w-3.5 text-primary" />
        {/if}
        <span>
          <span class="sr-only">Score: </span>
          {project.ranking.score.toFixed(2)}
        </span>
      </div>
    {/if}
  </div>
</Card>
