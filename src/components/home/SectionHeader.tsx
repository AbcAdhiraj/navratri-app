import Link from "next/link";
import { cx } from "@/lib/format";
import { Icon } from "../ui/Icon";

export function SectionHeader({
  kicker,
  title,
  accent,
  blurb,
  href,
  hrefLabel = "See all",
  id,
  className,
  accentClass = "text-sindoor",
}: {
  kicker: string;
  title: string;
  /** Trailing words set in the italic serif. */
  accent?: string;
  blurb?: string;
  href?: string;
  hrefLabel?: string;
  id?: string;
  className?: string;
  accentClass?: string;
}) {
  return (
    <div className={cx("mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between", className)} data-reveal>
      <div className="max-w-3xl">
        <p className="kicker">{kicker}</p>
        <h2 id={id} className="t-h2 mt-4 text-balance">
          {title}
          {accent && <span className={cx("t-serif", accentClass)}> {accent}</span>}
        </h2>
        {blurb && <p className="t-body mt-3 max-w-xl opacity-75">{blurb}</p>}
      </div>
      {href && (
        <Link href={href} className="group inline-flex shrink-0 items-center gap-2 self-start text-xs font-extrabold uppercase tracking-[0.12em] md:mr-28 md:self-auto">
          <span className="border-b-[1.5px] border-current pb-0.5">{hrefLabel}</span>
          <Icon name="arrowUpRight" size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
