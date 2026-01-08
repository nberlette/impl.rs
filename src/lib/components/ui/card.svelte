<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";

  interface Props {
    class?: ClassValue;
    children: Snippet;

    [rest: string]: unknown;
  }

  let { class: className = "", children, ...rest }: Props = $props();
</script>

<div
  class={[
    "rounded-lg border bg-card text-card-foreground shadow-sm",
    className,
  ]}
  {...rest}
>
  {@render children?.()}
</div>
