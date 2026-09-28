import Image from "next/image";
import type { EventRecord } from "@/lib/types";
import { PosterArt } from "./PosterArt";

/** Authorised photo when one exists; otherwise original block-print artwork. */
export function EventMedia({
  event,
  sizes = "(min-width: 1024px) 33vw, 90vw",
  priority = false,
  word = true,
}: {
  event: Pick<EventRecord, "slug" | "media" | "types">;
  sizes?: string;
  priority?: boolean;
  word?: boolean;
}) {
  const img = event.media[0];
  if (img) {
    return <Image src={img.url} alt={img.alt} fill sizes={sizes} priority={priority} className="card-media object-cover" />;
  }
  return <PosterArt seed={event.slug} type={event.types[0]} word={word} />;
}
