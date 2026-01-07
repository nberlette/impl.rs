<script lang="ts">
  import Card from "$lib/components/ui/card.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import {
    RANKING_FILTER_LABELS,
    RANKING_TYPE_DETAILS,
    RANKING_TYPES,
  } from "$lib/rankings";
  import {
    Code,
    Database,
    Github,
    RefreshCw,
    Rocket,
    TrendingUp,
    Users,
    Zap,
  } from "lucide-svelte";

  const features = [
    {
      icon: Database,
      title: "Auto-Aggregation",
      description:
        "We automatically discover and index Rust projects from GitHub and " +
        "crates.io, keeping our database fresh and comprehensive.",
    },
    {
      icon: TrendingUp,
      title: "Smart Rankings",
      description:
        "Our multi-factor ranking algorithm considers star velocity, " +
        "community engagement, code quality, and ecosystem impact.",
    },
    {
      icon: RefreshCw,
      title: "Daily Updates",
      description:
        "Rankings are recomputed every 6 hours to ensure you're always " +
        "seeing the most current trending projects.",
    },
    {
      icon: Users,
      title: "Community Driven",
      description:
        "Submit projects you love to help others discover hidden gems in " +
        "the Rust ecosystem.",
    },
  ];

  const rankingTypes = RANKING_TYPES.map((type) => ({
    type,
    name: RANKING_FILTER_LABELS[type],
    description: RANKING_TYPE_DETAILS[type],
  }));
</script>

<svelte:head>
  <title>About - impl.rs</title>
  <meta
    name="description"
    content="Learn how impl.rs discovers and ranks the best Rust projects"
  />
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-12">
  <header class="mb-12 text-center">
    <div
      class="
        mx-auto mb-4 flex size-14 items-center justify-center
        rounded-xl bg-primary/10
      "
    >
      <Code class="size-7 text-primary" />
    </div>
    <h1 class="text-3xl font-bold sm:text-4xl text-balance">
      About impl.rs
    </h1>
    <p class="mt-4 text-lg text-muted-foreground text-pretty">
      A self-sustaining platform that automatically discovers, ranks, and
      showcases the best Rust projects from across the ecosystem.
    </p>
  </header>

  <section class="mb-12">
    <h2 class="mb-6 text-2xl font-bold">How It Works</h2>
    <div class="grid gap-6 sm:grid-cols-2">
      {#each features as feature}
        <Card class="p-6">
          <div
            class="
              mb-4 flex size-10 items-center justify-center
              rounded-lg bg-primary/10 text-primary
            "
          >
            <feature.icon class="size-5" />
          </div>
          <h3 class="mb-2 font-semibold">{feature.title}</h3>
          <p class="text-sm text-muted-foreground">{feature.description}</p>
        </Card>
      {/each}
    </div>
  </section>

  <section class="mb-12">
    <h2 class="mb-6 text-2xl font-bold">Ranking Algorithm</h2>
    <p class="mb-6 text-muted-foreground">
      Our ranking system uses a sophisticated multi-factor algorithm to surface
      the most relevant projects for each category.
    </p>
    <div class="space-y-4">
      {#each rankingTypes as ranking}
        <Card class="p-5">
          <h3 class="font-semibold text-primary">{ranking.name}</h3>
          <p class="mt-1 text-sm text-muted-foreground">
            {ranking.description}
          </p>
        </Card>
      {/each}
    </div>
  </section>

  <section class="mb-12">
    <h2 class="mb-6 text-2xl font-bold">Data Sources</h2>
    <Card class="p-6">
      <div class="grid gap-6 sm:grid-cols-2">
        <div class="flex items-start gap-4">
          <div
            class="
              flex size-10 shrink-0 items-center justify-center
              rounded-lg bg-secondary
            "
          >
            <Github class="size-5" />
          </div>
          <div>
            <h3 class="font-semibold">GitHub</h3>
            <p class="text-sm text-muted-foreground">
              Stars, forks, issues, commits, contributors, releases, and
              repository metadata.
            </p>
          </div>
        </div>
        <div class="flex items-start gap-4">
          <div
            class="
              flex size-10 shrink-0 items-center justify-center
              rounded-lg bg-secondary
            "
          >
            <Zap class="size-5" />
          </div>
          <div>
            <h3 class="font-semibold">crates.io</h3>
            <p class="text-sm text-muted-foreground">
              Download counts, version history, dependencies, and reverse
              dependencies.
            </p>
          </div>
        </div>
      </div>
    </Card>
  </section>

  <section
    class="rounded-xl bg-primary/5 p-8 text-center"
  >
    <Rocket class="mx-auto mb-4 size-8 text-primary" />
    <h2 class="mb-2 text-2xl font-bold text-balance">
      Ready to Explore?
    </h2>
    <p class="mb-6 text-muted-foreground">
      Discover amazing Rust projects and help the community grow.
    </p>
    <div class="flex flex-wrap justify-center gap-3">
      <Button href="/">Browse Projects</Button>
      <Button variant="outline" href="/submit">Submit a Project</Button>
    </div>
  </section>
</div>
