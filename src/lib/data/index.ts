import "server-only";
import { cache } from "react";
import { isSupabaseConfigured } from "../supabase/env";
import { createEmptyRepo, createMemoryRepo } from "./memory";
import type { Repository } from "./repo";
import { createSupabaseRepo } from "./supabase";

/**
 * Picks the data source.
 *  - Supabase when configured (and not forced to fixtures).
 *  - Fixtures (clearly-fake DEMO events) for local development and previews.
 *  - Never fixtures on a Vercel *production* deployment: that serves an empty, unconfigured repo instead,
 *    so fictional events can't be published by accident.
 */
function pick(): Repository {
  const forced = process.env.DATA_SOURCE;
  const isProdDeploy = process.env.VERCEL_ENV === "production";
  if (forced !== "fixtures" && isSupabaseConfigured) return createSupabaseRepo();
  if (isProdDeploy) {
    console.error("[navratri] No Supabase configured on a production deployment — refusing to serve DEMO fixtures.");
    return createEmptyRepo();
  }
  return createMemoryRepo();
}

let repo: Repository | undefined;
export function getRepo(): Repository {
  repo ??= pick();
  return repo;
}

/** Request-deduplicated public reads. */
export const getPublishedEvents = cache(async () => {
  try {
    return { events: await getRepo().listPublished(), error: null as string | null };
  } catch (err) {
    console.error("[navratri] listPublished failed", err);
    return { events: [], error: "load_failed" };
  }
});

export const getEventBySlug = cache(async (slug: string) => getRepo().getPublishedBySlug(slug));

export const dataMode = () => getRepo().mode;
