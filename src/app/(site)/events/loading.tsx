import { CardSkeleton, FilterSkeleton } from "@/components/ui/States";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading events">
      <div className="bg-paper-2 px-4 pb-10 pt-32 md:px-12 md:pt-40">
        <div className="mx-auto max-w-[90rem]">
          <div className="skeleton h-3 w-32" />
          <div className="skeleton mt-6 h-14 w-2/3 md:h-20" />
          <div className="skeleton mt-4 h-4 w-40" />
        </div>
      </div>
      <div className="border-b-[1.5px] border-ink/10 bg-paper px-4 py-3 md:px-12">
        <div className="mx-auto max-w-[90rem]">
          <FilterSkeleton />
        </div>
      </div>
      <div className="bg-paper px-4 pb-24 pt-10 md:px-12">
        <div className="mx-auto grid max-w-[90rem] gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
