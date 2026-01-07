<script lang="ts">
  import { cn } from "$lib/utils";
  import { Star } from "lucide-svelte";

  interface Props {
    projectId: number;
    isStarred: boolean;
    isAuthenticated: boolean;
    size?: "sm" | "md" | "lg";
    showCount?: boolean;
    count?: number;
    class?: string;
  }

  let {
    projectId,
    isStarred = $bindable(false),
    isAuthenticated,
    size = "md",
    showCount = false,
    count: displayCount = $bindable(0),
    class: className = "",
  }: Props = $props();

  let isLoading = $state(false);

  const sizeClasses = {
    sm: "h-7 px-2 text-xs gap-1",
    md: "h-9 px-3 text-sm gap-1.5",
    lg: "h-11 px-4 text-base gap-2",
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "size-4",
    lg: "size-5",
  };

  async function handleStar(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Redirect to sign in
      window.location.href = "/auth/github";
      return;
    }

    if (isLoading) return;

    isLoading = true;
    const action = isStarred ? "unstar" : "star";

    try {
      const response = await fetch("/api/star", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, action }),
      });

      const data = await response.json();

      if (data.success) {
        isStarred = action === "star";
        displayCount = isStarred ? displayCount + 1 : displayCount - 1;
      }
    } catch (err) {
      console.error("Star error:", err);
    } finally {
      isLoading = false;
    }
  }
</script>

<button
  class={cn(
    "inline-flex items-center justify-center rounded-md border font-medium",
    "transition-all duration-200",
    isStarred
      ? "border-primary/50 bg-primary/10 text-rust hover:bg-primary/20"
      : "border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground",
    isLoading && "opacity-50 cursor-wait",
    sizeClasses[size],
    className,
  )}
  onclick={handleStar}
  disabled={isLoading}
  title={isAuthenticated
    ? isStarred ? "Unstar on GitHub" : "Star on GitHub"
    : "Sign in to star"}
  aria-label={isStarred ? "Unstar this project" : "Star this project"}
>
  <Star
    class={cn(
      iconSizes[size],
      isStarred && "fill-current",
      isLoading && "animate-pulse",
    )}
  />
  {#if showCount}
    <span>{displayCount.toLocaleString()}</span>
  {:else}
    <span>{isStarred ? "Starred" : "Star"}</span>
  {/if}
</button>
