import { CardSkeleton, HeroSkeleton } from "@/components/ui/States";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <HeroSkeleton />
      <div className="mx-auto grid max-w-[90rem] gap-5 px-4 py-16 sm:grid-cols-2 md:px-8 lg:grid-cols-4 lg:px-12">
        {Array.from({ length: 4 }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
