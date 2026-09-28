import type { MetadataRoute } from "next";
import { AREAS } from "@/lib/types";
import { siteUrl } from "@/lib/constants";
import { getPublishedEvents } from "@/lib/data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { events } = await getPublishedEvents();
  const now = new Date();
  const statics = ["", "/events", "/submit", "/methodology", "/privacy", "/terms"].map((p) => ({
    url: siteUrl(p),
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: p === "" ? 1 : 0.6,
  }));
  const areas = AREAS.map((a) => ({ url: siteUrl(`/events?area=${a}`), lastModified: now, changeFrequency: "daily" as const, priority: 0.7 }));
  // Demo fixtures are never listed.
  const eventUrls = events
    .filter((e) => !e.isDemo)
    .map((e) => ({ url: siteUrl(`/events/${e.slug}`), lastModified: new Date(e.updatedAt), changeFrequency: "daily" as const, priority: 0.8 }));
  return [...statics, ...areas, ...eventUrls];
}
