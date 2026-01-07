<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";

  interface Props {
    class?: ClassValue;
    children?: Snippet;

    [rest: string]: unknown;
  }

  let { children, class: className = "", ...rest }: Props = $props();
</script>

<div class={["animate-pulse rounded-md bg-muted", className]} {...rest}>
  {@render children?.()}
</div>
