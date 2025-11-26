<script lang="ts">
  import Tabs from "$lib/components/ui/tabs.svelte";
  import { Flame, TrendingUp, Sparkles, Trophy } from "lucide-svelte";
  import type { Snippet } from "svelte";
  import type { RankingFilter } from "$lib/types";

  interface Props {
    value?: RankingFilter;
    onchange?: (value: RankingFilter) => void;
  }

  let { value = $bindable("hot"), onchange }: Props = $props();

  const tabs = [
    { value: "hot", label: "Hot" },
    { value: "trending", label: "Trending" },
    { value: "new", label: "New" },
    { value: "top", label: "Top" }
  ];

  function handleChange(newValue: string) {
    value = newValue as RankingFilter;
    onchange?.(value);
  }
</script>

<Tabs {tabs} {value} onchange={handleChange} class="w-full sm:w-auto" />
