<script lang="ts" module>
  export const sizes = {
    sm: "size-8 rounded",
    md: "size-10 rounded-md",
    lg: "size-12 rounded-lg",
    get default() {
      return this.md;
    },
  } as const satisfies Record<string, ClassValue>;

  export const variants = {
    circle: "bg-muted rounded-full!",
    muted: "bg-muted",
    get default() {
      return this.circle;
    },
  } as const satisfies Record<string, ClassValue>;

  export type Size = string & keyof typeof sizes;
  export type Variant = string & keyof typeof variants;
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue, HTMLImgAttributes } from "svelte/elements";
  import { User } from "lucide-svelte";
  import Avatar from "./avatar.svelte";
  import { cn } from "$lib/utils";

  interface Props extends Omit<HTMLImgAttributes, "src"> {
    size?: Size;
    variant?: Variant;
    class?: ClassValue;
    href?: string | URL | null;
    src?: string | URL | null;
    children?: Snippet;

    [rest: string]: unknown;
  }
  let {
    href = $bindable(null),
    src = $bindable(null),
    ...restProps
  }: Props = $props();

  let {
    size = "default",
    variant = "default",
    class: className = "",
    ...rest
  } = restProps;

  if (href) href = href.toString();
  if (src) src = src.toString();
</script>

{#if href}
  <a {href}><Avatar {src} {...restProps} /></a>
{:else if src}
  <img
    {src}
    class={[
      "rounded-full object-cover overflow-clip",
      sizes[size],
      variants[variant],
      className,
    ]}
    loading={rest.loading ?? "lazy"}
    {...rest}
  />
{:else}
  <User class={cn(sizes[size], variants[variant], className)} />
{/if}
