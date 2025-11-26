<script lang="ts">
  import "../app.css";
  import Header from "$lib/components/header.svelte";
  import Footer from "$lib/components/footer.svelte";
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<svelte:head>
  <meta
    name="description"
    content="Discover and explore the best Rust projects. Auto-aggregated 
             rankings from GitHub and crates.io."
  />
  <meta property="og:title" content="impl.rs - Rust Project Showcase" />
  <meta
    property="og:description"
    content="Discover and explore the best Rust projects."
  />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<div class="flex min-h-screen flex-col">
  <Header />
  <main class="flex-1">
    {@render children()}
  </main>
  <Footer />
</div>
