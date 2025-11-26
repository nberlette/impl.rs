<script lang="ts">
  import type { PageData } from "./$types";
  import ProjectCard from "$lib/components/project-card.svelte";
  import FilterTabs from "$lib/components/filter-tabs.svelte";
  import StatsBanner from "$lib/components/stats-banner.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import { goto } from "$app/navigation";
  import type { RankingFilter } from "$lib/types";
  import { Rocket, ArrowRight } from "lucide-svelte";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  let filter = $state(data.filter as RankingFilter);

  function handleFilterChange(newFilter: RankingFilter) {
    filter = newFilter;
    goto(`/?filter=${newFilter}`, { replaceState: true, noScroll: true });
  }

  const filterDescriptions: Record<RankingFilter, string> = {
    hot: "Most active projects with high recent momentum",
    trending: "Fastest growing projects over the past month",
    new: "Promising newcomers making their mark",
    top: "All-time best Rust projects by stars and impact"
  };
</script>

<svelte:head>
  <title>impl.rs - Discover the Best Rust Projects</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:py-12">
  <section class="mb-12 text-center">
    <div
      class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl
             bg-primary/10"
    >
      <Rocket class="h-8 w-8 text-primary" />
    </div>
    <h1 class="mb-4 text-4xl font-bold tracking-tight text-foreground 
               sm:text-5xl text-balance">
      Discover the Best<br />
      <span class="text-primary">Rust Projects</span>
    </h1>
    <p
      class="mx-auto max-w-2xl text-lg text-muted-foreground text-pretty"
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
        <Button variant="ghost" size="sm" href="/?filter=top">
          View all
          <ArrowRight class="ml-1 h-4 w-4" />
        </Button>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each data.featured.slice(0, 3) as project}
          <ProjectCard {project} />
        {/each}
      </div>
    </section>
  {/if}

  <section>
    <div
      class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center 
             sm:justify-between"
    >
      <div>
        <h2 class="text-xl font-semibold capitalize">{filter} Projects</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          {filterDescriptions[filter]}
        </p>
      </div>
      <FilterTabs value={filter} onchange={handleFilterChange} />
    </div>

    {#if data.projects.length > 0}
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each data.projects as project, i}
          <ProjectCard {project} rank={i + 1} showRankBadge={true} />
        {/each}
      </div>
    {:else}
      <div class="rounded-lg border bg-card p-12 text-center">
        <p class="text-muted-foreground">
          No projects found. Check back soon!
        </p>
      </div>
    {/if}
  </section>

  <section class="mt-16 rounded-xl bg-primary/5 p-8 text-center">
    <h2 class="mb-2 text-2xl font-bold text-balance">
      Know a Great Rust Project?
    </h2>
    <p class="mb-6 text-muted-foreground text-pretty">
      Help the community discover amazing Rust libraries and tools by submitting
      your favorites.
    </p>
    <Button href="/submit">
      Submit a Project
      <ArrowRight class="ml-2 h-4 w-4" />
    </Button>
  </section>
</div>
