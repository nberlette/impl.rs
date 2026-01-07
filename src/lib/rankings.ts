export const RANKING_TYPES = ["hot", "trending", "new", "top"] as const;
export const RANKING_FILTERS = [
  "hot",
  "trending",
  "new",
  "recent",
  "top",
] as const;

export type RankingType = (typeof RANKING_TYPES)[number];
export type RankingFilter = (typeof RANKING_FILTERS)[number];

export const RANKING_FILTER_LABELS: Record<RankingFilter, string> = {
  hot: "Hot",
  trending: "Trending",
  new: "New",
  recent: "Recent",
  top: "Top",
};

export const RANKING_FILTER_DESCRIPTIONS: Record<RankingFilter, string> = {
  hot: "Most active projects with high recent momentum",
  trending: "Fastest growing projects over the past month",
  new: "Fresh arrivals gaining early traction",
  recent: "Latest updates from active Rust projects",
  top: "All-time best Rust projects by stars and impact",
};

export const RANKING_TYPE_DETAILS: Record<RankingType, string> = {
  hot: "Projects with high recent momentum. Factors in star velocity " +
    "(50%), activity score (30%), and community engagement (20%).",
  trending: "Fastest growing projects over 30 days. Considers growth rate " +
    "(40%), acceleration (30%), and release activity (30%).",
  new: "Promising newcomers under 90 days old. Weighted by initial " +
    "traction (50%) and quality signals (50%).",
  top: "All-time best by overall impact. Based on stars (60%), " +
    "maturity (20%), and ecosystem impact (20%).",
};

export const RANKING_FILTER_TABS = [
  { value: "hot", label: "Hot" },
  { value: "trending", label: "Trending" },
  { value: "new", label: "New" },
  { value: "recent", label: "Recent" },
  { value: "top", label: "Top" },
] as const;

export const RANKING_FILTER_LINKS = [
  { value: "hot", label: "Hot Projects" },
  { value: "trending", label: "Trending" },
  { value: "recent", label: "Recent Updates" },
  { value: "top", label: "All-Time Top" },
] as const;
