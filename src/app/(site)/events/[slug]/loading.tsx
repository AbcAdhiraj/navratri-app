export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading event" className="bg-paper pb-24 pt-[calc(var(--nav-h)+1rem)]">
      <div className="mx-auto max-w-[90rem] px-4 md:px-8 lg:px-12">
        <div className="skeleton h-3 w-56" />
        <div className="skeleton mt-5 h-[52svh] !rounded-[2rem] md:h-[62svh]" />
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_23rem]">
          <div className="relative -mt-24 rounded-[var(--radius-panel)] border-[1.5px] border-ink/15 bg-card p-8">
            <div className="skeleton h-12 w-3/4" />
            <div className="skeleton mt-4 h-5 w-1/2" />
            <div className="mt-8 grid grid-cols-3 gap-6">
              <div className="skeleton h-12" />
              <div className="skeleton h-12" />
              <div className="skeleton h-12" />
            </div>
          </div>
          <div className="skeleton -mt-24 hidden h-80 !rounded-[var(--radius-panel)] lg:block" />
        </div>
      </div>
    </div>
  );
}
