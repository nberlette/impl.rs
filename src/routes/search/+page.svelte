<script lang="ts">
  import type { PageData } from "./$types";
  import { goto } from "$app/navigation";
  import ProjectCard from "$lib/components/project-card.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import { Search, X } from "lucide-svelte";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  let queryInput = $state(data.query);
  let hasQuery = $derived(data.query.trim().length > 0);

  $effect(() => {
    queryInput = data.query;
  });

  function handleSearch() {
    const trimmedQuery = queryInput.trim();
    if (!trimmedQuery) {
      goto("/search", { replaceState: true });
      return;
    }

    const params = new URLSearchParams();
    params.set("q", trimmedQuery);
    goto(`/search?${params.toString()}`);
  }

  function clearSearch() {
    queryInput = "";
    goto("/search", { replaceState: true });
  }

  function buildPageUrl(nextPage: number) {
    const params = new URLSearchParams();
    if (data.query.trim()) {
      params.set("q", data.query.trim());
    }
    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }
    return `/search?${params.toString()}`;
  }
</script>

<svelte:head>
  <title>{data.query ? `Search: ${data.query}` : "Search"} - impl.rs</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-12">
  <div class="mb-8 text-center">
    <h1 class="text-3xl font-bold">Search Projects</h1>
    <p class="mt-2 text-muted-foreground">
      Find Rust libraries, tools, and applications
    </p>
  </div>

  <form
    onsubmit={(e) => {
      e.preventDefault();
      handleSearch();
    }}
    class="mb-8"
  >
    <div class="relative">
      <Search
        class="
          absolute left-4 top-1/2 size-5 -translate-y-1/2
          text-muted-foreground
        "
      />
      <Input
        type="search"
        placeholder="Search by name or description..."
        bind:value={queryInput}
        class="h-12 pl-12 pr-24 text-base"
      />
      {#if queryInput}
        <button
          type="button"
          onclick={clearSearch}
          class="
            absolute right-20 top-1/2 -translate-y-1/2 p-1
            text-muted-foreground hover:text-foreground
          "
          aria-label="Clear search"
        >
          <X class="size-4" />
        </button>
      {/if}
      <Button
        type="submit"
        size="sm"
        class="absolute right-2 top-1/2 -translate-y-1/2"
        disabled={!queryInput.trim()}
      >
        Search
      </Button>
    </div>
  </form>

  {#if data.projects.length > 0}
    <div>
      <p class="mb-4 text-sm text-muted-foreground">
        Found {data.pagination.total} result{
          data.pagination.total === 1 ? "" : "s"
        } for "{data.query}"
      </p>
      <div class="grid gap-4 sm:grid-cols-2">
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
            of {data.pagination.total} results
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
    </div>
  {:else if hasQuery}
    <div class="rounded-lg border bg-card p-12 text-center">
      <p class="text-muted-foreground">
        No projects found for "{data.query}". Try a different search term.
      </p>
    </div>
  {:else}
    <div class="rounded-lg border bg-card p-12 text-center">
      <Search class="mx-auto mb-4 size-8 text-muted-foreground" />
      <p class="text-muted-foreground">
        Enter a search term to find Rust projects
      </p>
    </div>
  {/if}
</div>
