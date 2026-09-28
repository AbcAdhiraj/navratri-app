import Link from "next/link";
import { DandiyaPair } from "../art/Motifs";
import { Rangoli } from "../art/Rangoli";
import { Icon } from "../ui/Icon";

export function SubmitCTA() {
  return (
    <section aria-labelledby="submit-title" className="bg-paper px-4 py-24 md:px-8 lg:px-12">
      <div
        data-reveal="scale"
        className="on-color relative mx-auto max-w-[90rem] overflow-hidden rounded-[2rem] border-[1.5px] border-ink bg-sindoor px-6 py-14 shadow-[var(--shadow-print-lg)] md:px-16 md:py-20"
      >
        <div aria-hidden="true" className="bandhani absolute inset-0" style={{ "--dot": "rgb(147 22 15 / 0.8)", "--gap": "18px" } as React.CSSProperties} />
        <div aria-hidden="true" className="absolute -right-28 -top-28 w-[34rem]">
          <div className="motion-safe:animate-spin-slow">
            <Rangoli seed={77} size={400} rings={6} colors={["#f3b61f", "#93160f", "#f4ecdd", "#93160f"]} strokeWidth={1} opacity={0.9} />
          </div>
        </div>
        <DandiyaPair className="absolute bottom-6 right-8 hidden size-36 text-haldi md:block" />
        <div className="relative z-10 max-w-2xl">
          <p className="kicker">Community</p>
          <h2 id="submit-title" className="t-h1 mt-5 text-balance">
            Know a garba we’re <span className="t-serif text-haldi">missing?</span>
          </h2>
          <p className="mt-4 max-w-lg text-lg font-medium text-cream">
            Send us a poster, a ticket link or an RWA notice. Every submission is reviewed before it goes live — nothing is published automatically.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/submit" className="btn btn-haldi">
              Suggest an event <Icon name="arrowRight" className="btn-arrow" />
            </Link>
            <Link href="/submit?kind=correction" className="btn btn-outline">
              Correct a listing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
