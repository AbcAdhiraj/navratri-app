import type { IconName } from "@/components/ui/Icon";

/** Discovery "vibes" mapped onto real, filterable facts (never inferred). Colours are textile dyes. */
export const VIBE_OPTIONS: { id: string; label: string; line: string; query: string; icon: IconName; hue: string; ink?: boolean }[] = [
  { id: "traditional", label: "Traditional Garba", line: "Gujarati-style circles, dhol, aarti", query: "music=traditional_garba", icon: "sparkle", hue: "#bd1f1a" },
  { id: "dandiya", label: "Dandiya", line: "Sticks up, all night", query: "type=dandiya", icon: "music", hue: "#1f2f6d" },
  { id: "bollywood", label: "Bollywood Mix", line: "Garba meets filmi bangers", query: "music=bollywood", icon: "flame", hue: "#c81e68" },
  { id: "dj", label: "DJ & EDM", line: "When the drop hits the dandiya", query: "type=dj_edm", icon: "moon", hue: "#1e1713" },
  { id: "live", label: "Live Music", line: "Singers, dhol & bands on stage", query: "music=live_band", icon: "music", hue: "#e46f1a", ink: true },
  { id: "family", label: "Family Friendly", line: "Kids & elders explicitly welcome", query: "entry=families", icon: "heart", hue: "#3c6a32" },
  { id: "community", label: "Community & RWA", line: "Society lawns, neighbourhood circles", query: "type=community,society_rwa", icon: "users", hue: "#f3b61f", ink: true },
];
