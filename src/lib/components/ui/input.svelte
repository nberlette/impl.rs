<script lang="ts">
  import { cn } from "$lib/utils";
  import type { ClassValue } from "svelte/elements";

  interface Props {
    type?: string;
    value?: string;
    placeholder?: string;
    class?: ClassValue;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    id?: string;
    oninput?: (e: Event) => void;
    [rest: string]: unknown;
  }

  let {
    type = "text",
    value = $bindable(""),
    placeholder = $bindable(""),
    class: className = "",
    disabled = $bindable(false),
    required = $bindable(false),
    name,
    id,
    oninput,
    ...rest
  }: Props = $props();
</script>

<input
  {type}
  {name}
  {id}
  {placeholder}
  {disabled}
  {required}
  bind:value
  {oninput}
  class={[
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2",
    "text-sm ring-offset-background placeholder:text-muted-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    className,
  ]}
  {...rest}
/>
