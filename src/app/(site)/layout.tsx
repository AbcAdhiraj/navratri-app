import { RangoliSprite } from "@/components/art/RangoliSprite";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { Navbar } from "@/components/layout/Navbar";
import { SearchProvider } from "@/components/search/SearchProvider";
import { dataMode, getPublishedEvents } from "@/lib/data";
import { focusDate, type SearchItem } from "@/lib/discovery";
import { priceLabel } from "@/lib/format";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { events } = await getPublishedEvents();
  const index: SearchItem[] = events.map((e) => ({
    slug: e.slug,
    title: e.title,
    venue: e.venue.name,
    locality: e.venue.locality,
    area: e.venue.area,
    organizer: e.organizer?.name ?? null,
    dates: e.occurrences.map((o) => o.date),
    price: priceLabel(e.price),
    isDemo: e.isDemo,
    seed: e.slug,
    type: e.types[0] ?? null,
  }));

  const demo = dataMode() === "fixtures";

  return (
    <SearchProvider items={index} focusDate={focusDate().date}>
      <div className={demo ? "has-demo" : undefined}>
        <RangoliSprite />
        <Navbar demo={demo} />
        <main id="main">{children}</main>
        <Footer />
        <MobileNav />
      </div>
    </SearchProvider>
  );
}
