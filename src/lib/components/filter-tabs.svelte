<script lang="ts">
  import Tabs from "$lib/components/ui/tabs.svelte";
  import { RANKING_FILTER_TABS } from "$lib/rankings";
  import type { RankingFilter } from "$lib/types";

  interface Props {
    value?: RankingFilter;
    onchange?: (value: RankingFilter) => void;
  }

  let { value = $bindable("hot"), onchange }: Props = $props();

  const tabs = [...RANKING_FILTER_TABS];

  function handleChange(newValue: string) {
    value = newValue as RankingFilter;
    onchange?.(value);
  }
</script>

<Tabs {tabs} bind:value onchange={handleChange} class="w-full sm:w-auto" />
