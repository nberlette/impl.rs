<script lang="ts">
  import { Github, Heart, Twitter } from "lucide-svelte";
  import { RANKING_FILTER_LINKS } from "$lib/rankings";

  const currentYear = new Date().getFullYear();
</script>

<footer class="border-t bg-card">
  <div class="mx-auto max-w-7xl px-4 py-12">
    <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      <div class="space-y-4">
        <a
          href="/"
          class="
            flex items-center gap-2 rounded-sm text-lg font-bold
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-ring focus-visible:ring-offset-2
            focus-visible:ring-offset-background
          "
        >
          <span
            class="
              flex size-7 items-center justify-center rounded-md
              bg-primary text-primary-foreground
            "
          >
            <span class="font-mono text-xs font-bold">rs</span>
          </span>
          impl.rs
        </a>
        <p class="text-sm text-foreground/80 text-pretty">
          Discover and explore the best Rust projects. Auto-aggregated from
          GitHub and crates.io.
        </p>
      </div>

      <div>
        <h3 class="mb-3 text-sm font-semibold">Explore</h3>
        <ul class="space-y-2 text-sm text-foreground/90">
          {#each RANKING_FILTER_LINKS as link}
            <li>
              <a
                href={`/?filter=${link.value}`}
                class="
                  rounded-sm duration-300 ease-in-out hover:text-rust
                  hover:underline focus-visible:underline
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-ring focus-visible:ring-offset-2
                  focus-visible:ring-offset-background
                "
              >{link.label}</a>
            </li>
          {/each}
        </ul>
      </div>

      <div>
        <h3 class="mb-3 text-sm font-semibold">Resources</h3>
        <ul class="space-y-2 text-sm text-foreground/90">
          <li>
            <a
              href="/submit"
              class="
                rounded-sm duration-300 ease-in-out hover:text-rust
                hover:underline focus-visible:underline
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-ring focus-visible:ring-offset-2
                focus-visible:ring-offset-background
              "
            >Submit a Project</a>
          </li>
          <li>
            <a
              href="/about"
              class="
                rounded-sm duration-300 ease-in-out hover:text-rust
                hover:underline focus-visible:underline
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-ring focus-visible:ring-offset-2
                focus-visible:ring-offset-background
              "
            >About</a>
          </li>
          <li>
            <a
              href="/api"
              class="
                rounded-sm duration-300 ease-in-out hover:text-rust
                hover:underline focus-visible:underline
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-ring focus-visible:ring-offset-2
                focus-visible:ring-offset-background
              "
            >API</a>
          </li>
        </ul>
      </div>

      <div>
        <h3 class="mb-3 text-sm font-semibold">Community</h3>
        <div class="flex gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            class="
              rounded-sm text-foreground/70 transition-colors
              duration-300 ease-in-out hover:text-rust
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-ring focus-visible:ring-offset-2
              focus-visible:ring-offset-background
            "
            aria-label="GitHub"
          >
            <Github class="size-5" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            class="
              rounded-sm text-foreground/70 transition-colors
              duration-300 ease-in-out hover:text-rust
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-ring focus-visible:ring-offset-2
              focus-visible:ring-offset-background
            "
            aria-label="Twitter"
          >
            <Twitter class="size-5" />
          </a>
        </div>
      </div>
    </div>

    <div
      class="
        mt-8 flex flex-col items-center justify-between gap-4 border-t
        pt-8 text-sm text-foreground/80 sm:flex-row
      "
    >
      <p>© {currentYear} impl.rs. All rights reserved.</p>
      <p class="flex items-center gap-1">
        Made with <Heart class="size-4 text-primary" /> for the Rust community
      </p>
    </div>
  </div>
</footer>
