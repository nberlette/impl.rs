<script lang="ts">
  import { onMount } from "svelte";
  import { cn } from "$lib/utils";
  import { Star } from "lucide-svelte";
  import type { ClassValue } from "svelte/elements";

  const labelClasses = {
    "sr-only": "sr-only",
    "lg-only": "not-lg:sr-only",
    "none": "hidden",
    "never": "hidden",
  };

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

  type Label = string & keyof typeof labelClasses;
  type Size = string & keyof typeof sizeClasses;

  interface Props {
    projectId: number;
    isStarred?: boolean;
    isAuthenticated: boolean;
    size?: Size;
    label?: Label;
    showCount?: boolean;
    count?: number;
    class?: ClassValue;

    [rest: string]: unknown;
  }

  let {
    projectId,
    isStarred = $bindable(false),
    isAuthenticated,
    size = "md",
    label = "lg-only",
    showCount = false,
    count: displayCount = $bindable(0),
    class: className = "",
    ...rest
  }: Props = $props();

  let isLoading = $state(false);
  let hasFetchedStatus = $state(false);

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

  async function loadStarStatus() {
    if (!isAuthenticated || hasFetchedStatus) return;
    hasFetchedStatus = true;
    try {
      const response = await fetch(`/api/star?projectId=${projectId}`);
      if (!response.ok) return;
      const data = await response.json();
      if (typeof data.starred === "boolean") {
        isStarred = data.starred;
      }
    } catch (err) {
      console.error("Star status error:", err);
    }
  }

  onMount(() => {
    void loadStarStatus();
  });
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
  {...rest}
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
    <span class={labelClasses[label]}>{isStarred ? "Starred" : "Star"}</span>
  {/if}
</button>
