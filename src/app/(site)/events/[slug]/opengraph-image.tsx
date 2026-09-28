import { getEventBySlug } from "@/lib/data";
import { eventOgImage, OG_SIZE } from "@/lib/og";

export const alt = "Navratri NCR event";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return eventOgImage(await getEventBySlug(slug));
}
