<script lang="ts">
  import type { PageData } from "./$types";
  import ProjectCard from "$lib/components/project-card.svelte";
  import FilterTabs from "$lib/components/filter-tabs.svelte";
  import StatsBanner from "$lib/components/stats-banner.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import {
    RANKING_FILTER_DESCRIPTIONS,
    RANKING_FILTER_TABS,
  } from "$lib/rankings";
  import { goto } from "$app/navigation";
  import type { RankingFilter, strings } from "$lib/types";
  import { ArrowRight, Rocket } from "lucide-svelte";
  import Tabs from "$lib/components/ui/tabs.svelte";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  let filter = $derived(data.filter as RankingFilter);

  $effect(() => {
    filter = data.filter as RankingFilter;
  });

  function handleFilterChange(newFilter: strings | RankingFilter) {
    filter = newFilter as RankingFilter;
    const params = new URLSearchParams();
    params.set("filter", newFilter);
    goto(`/?${params.toString()}`, { replaceState: true, noScroll: true });
  }

  function buildPageUrl(nextPage: number) {
    const params = new URLSearchParams();
    params.set("filter", filter);
    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }
    return `/?${params.toString()}`;
  }
</script>

<svelte:head>
  <title>impl.rs - Discover the Best Rust Projects</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:py-12">
  <section class="mb-12 text-center">
    <div
      class="
        mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl
        bg-primary/10
      "
    >
      <Rocket class="size-8 text-primary" />
    </div>
    <h1
      class="
        mb-4 text-4xl font-bold tracking-tight text-foreground
        sm:text-5xl text-balance
      "
    >
      Discover the Best<br />
      <span class="text-primary">Rust Projects</span>
    </h1>
    <p
      class="mx-auto max-w-2xl text-lg text-foreground/80 text-pretty"
    >
      Auto-aggregated rankings from GitHub and crates.io. Find trending
      libraries, tools, and applications built with Rust.
    </p>
  </section>

  <section class="mb-10">
    <StatsBanner
      totalProjects={data.stats.totalProjects}
      totalStars={data.stats.totalStars}
      totalDownloads={data.stats.totalDownloads}
      recentlyUpdated={data.stats.recentlyUpdated}
    />
  </section>

  {#if data.featured.length > 0}
    <section class="mb-12">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-semibold">Featured Projects</h2>
        <Button variant="ghost" size="sm" href="/featured">
          View all
          <ArrowRight class="ml-1 size-4" />
        </Button>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each data.featured as project}
          <ProjectCard {project} />
        {/each}
      </div>
    </section>
  {/if}

  <section>
    <div
      class="
        mb-6 flex flex-col gap-4 sm:flex-row sm:items-center
        sm:justify-between
      "
    >
      <div>
        <h2 class="text-xl font-semibold capitalize">{filter} Projects</h2>
        <p class="mt-1 text-sm text-foreground/70">
          {RANKING_FILTER_DESCRIPTIONS[filter]}
        </p>
      </div>
      <Tabs
        bind:value={filter}
        tabs={[...RANKING_FILTER_TABS]}
        onchange={handleFilterChange}
      />
    </div>

    {#if data.projects.length > 0}
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each data.projects as project, i}
          <ProjectCard
            {project}
            rank={(data.pagination.page - 1) * data.pagination.limit + i + 1}
            showRankBadge={true}
          />
        {/each}
      </div>
      {#if data.pagination.totalPages > 1}
        <div
          class="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p class="text-sm text-foreground/70">
            Showing {(data.pagination.page - 1) * data.pagination.limit + 1}
            -
            {
              Math.min(
                data.pagination.page * data.pagination.limit,
                data.pagination.total,
              )
            }
            of {data.pagination.total} projects
          </p>
          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              href={buildPageUrl(data.pagination.page - 1)}
              disabled={data.pagination.page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              href={buildPageUrl(data.pagination.page + 1)}
              disabled={data.pagination.page >= data.pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      {/if}
    {:else}
      <div class="rounded-lg border bg-card p-12 text-center">
        <p class="text-foreground/70">
          No projects found. Check back soon!
        </p>
      </div>
    {/if}
  </section>

  <section class="mt-16 rounded-xl bg-primary/5 p-8 text-center">
    <h2 class="mb-2 text-2xl font-bold text-balance">
      Know a Great Rust Project?
    </h2>
    <p class="mb-6 text-foreground/80 text-pretty">
      Help the community discover amazing Rust libraries and tools by submitting
      your favorites.
    </p>
    <Button href="/submit">
      Submit a Project
      <ArrowRight class="ml-2 size-4" />
    </Button>
  </section>
</div>
