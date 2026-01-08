<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";
  import type { Size, Variant } from "./user/avatar.svelte";
  import { render } from "svelte/server";

  export const sizes = {
    sm: "h-5 min-w-5 text-xs top-3 right-3",
    md: "h-6 min-w-6 text-xs top-3 right-3",
    lg: "h-8 min-w-8 text-sm top-3 right-3",
    xl: "h-10 min-w-10 text-lg top-3 right-3",
    get default() {
      return this.md;
    },
  } as const;

  export const variants = {
    primary: "bg-primary/80 text-primary-foreground",
    secondary: "bg-primary/10 text-primary",
    muted: "bg-muted/50 ring-1 ring-muted text-muted-foreground/35",
    outline: "bg-muted/5 ring-1 ring-muted text-muted-foreground/75",
    get default() {
      return this.primary;
    },
  } as const;

  type Size = string & keyof typeof sizes;
  type Variant = string & keyof typeof variants;

  interface Props {
    class?: ClassValue;
    size?: Size;
    variant?: Variant;
    rank?: number | string;
    prefix?: string;

    [rest: string]: unknown;
  }

  let {
    class: className = "",
    size = "default",
    variant = "default",
    rank = $bindable(),
    prefix = $bindable("#"),
    ...rest
  }: Props = $props();
</script>

<div
  class={[
    "absolute flex items-center justify-center px-1",
    "rounded-full font-sans font-bold",
    sizes[size],
    variants[variant],
    className,
  ]}
  aria-label="Rank {prefix}{rank}"
  {...rest}
>
  {prefix}{rank}
</div>
