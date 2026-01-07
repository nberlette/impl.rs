<script lang="ts">
  import type { PageData } from "./$types";
  import ProjectCard from "$lib/components/project-card.svelte";
  import Button from "$lib/components/ui/button.svelte";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  function buildPageUrl(nextPage: number) {
    const params = new URLSearchParams();
    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }
    return `/featured?${params.toString()}`;
  }
</script>

<svelte:head>
  <title>Featured Projects - impl.rs</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:py-12">
  <div
    class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <div>
      <h1 class="text-3xl font-bold">Featured Projects</h1>
      <p class="mt-2 text-foreground/70">
        Curated highlights from the Rust ecosystem.
      </p>
    </div>
    <Button variant="outline" href="/">
      Back to Discover
    </Button>
  </div>

  {#if data.projects.length > 0}
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each data.projects as project}
        <ProjectCard {project} />
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
          of {data.pagination.total} featured projects
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
        No featured projects yet. Check back soon!
      </p>
    </div>
  {/if}
</div>
