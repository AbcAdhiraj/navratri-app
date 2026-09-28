"use client";

import { activeFilterCount, applyFilters, EMPTY_FILTERS, type Filters } from "@/lib/discovery";
import type { EventRecord } from "@/lib/types";
import { Icon } from "../ui/Icon";
import { Sheet } from "../ui/Sheet";
import { FilterPanel } from "./FilterPanel";

/** Bottom sheet on mobile, right-hand drawer on desktop. Changes apply live. */
export function FilterSheet({
  open,
  onClose,
  events,
  filters,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  events: EventRecord[];
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  const n = applyFilters(events, filters).length;
  const active = activeFilterCount(filters);
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={active ? `Filters · ${active}` : "Filters"}
      variant="side"
      footer={
        <div className="flex items-center gap-3">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => onChange({ ...EMPTY_FILTERS, q: filters.q })} disabled={!active}>
            Clear all
          </button>
          <button type="button" className="btn btn-red flex-1" onClick={onClose}>
            {n === 0 ? "No matches — adjust filters" : `Show ${n} event${n === 1 ? "" : "s"}`}
            {n > 0 && <Icon name="arrowRight" className="btn-arrow" />}
          </button>
        </div>
      }
    >
      <FilterPanel events={events} filters={filters} onChange={onChange} />
    </Sheet>
  );
}
