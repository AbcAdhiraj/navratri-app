export function DemoRibbon() {
  return (
    <div className="relative z-[60] flex h-7 items-center justify-center overflow-hidden whitespace-nowrap border-b-[1.5px] border-ink bg-[repeating-linear-gradient(135deg,#f3b61f_0_12px,#fbe4a4_12px_24px)] px-4 text-center text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-ink">
      <span className="truncate md:hidden">Preview · all events are fictional DEMO data</span>
      <span className="hidden truncate md:inline">Preview mode · every event shown is a fictional DEMO fixture, not a real listing</span>
    </div>
  );
}
