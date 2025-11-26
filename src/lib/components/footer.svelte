<script lang="ts">
  import { Github, Twitter, Heart } from "lucide-svelte";

  const currentYear = new Date().getFullYear();
</script>

<footer class="border-t bg-card">
  <div class="mx-auto max-w-7xl px-4 py-12">
    <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      <div class="space-y-4">
        <a href="/" class="flex items-center gap-2 text-lg font-bold">
          <span
            class="flex h-7 w-7 items-center justify-center rounded-md 
                   bg-primary text-primary-foreground"
          >
            <span class="font-mono text-xs font-bold">rs</span>
          </span>
          impl.rs
        </a>
        <p class="text-sm text-muted-foreground text-pretty">
          Discover and explore the best Rust projects. Auto-aggregated from
          GitHub and crates.io.
        </p>
      </div>

      <div>
        <h3 class="mb-3 text-sm font-semibold">Explore</h3>
        <ul class="space-y-2 text-sm text-muted-foreground">
          <li>
            <a href="/?filter=hot" class="hover:text-foreground">Hot Projects</a
            >
          </li>
          <li>
            <a href="/?filter=trending" class="hover:text-foreground"
              >Trending</a
            >
          </li>
          <li>
            <a href="/?filter=new" class="hover:text-foreground">New Arrivals</a
            >
          </li>
          <li>
            <a href="/?filter=top" class="hover:text-foreground">All-Time Top</a
            >
          </li>
        </ul>
      </div>

      <div>
        <h3 class="mb-3 text-sm font-semibold">Resources</h3>
        <ul class="space-y-2 text-sm text-muted-foreground">
          <li>
            <a href="/submit" class="hover:text-foreground">Submit a Project</a>
          </li>
          <li>
            <a href="/about" class="hover:text-foreground">About</a>
          </li>
          <li>
            <a href="/api" class="hover:text-foreground">API</a>
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
            class="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="GitHub"
          >
            <Github class="h-5 w-5" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            class="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Twitter"
          >
            <Twitter class="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>

    <div
      class="mt-8 flex flex-col items-center justify-between gap-4 border-t 
             pt-8 text-sm text-muted-foreground sm:flex-row"
    >
      <p>© {currentYear} impl.rs. All rights reserved.</p>
      <p class="flex items-center gap-1">
        Made with <Heart class="h-4 w-4 text-primary" /> for the Rust community
      </p>
    </div>
  </div>
</footer>
