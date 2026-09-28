import Link from "next/link";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="-20 -20 40 40" className={className} aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d="M0,-4.2 Q4.4,-11 0,-18.5 Q-4.4,-11 0,-4.2Z" fill={i % 2 ? "#f3b61f" : "#bd1f1a"} stroke="#1e1713" strokeWidth="1" transform={`rotate(${i * 45})`} />
      ))}
      <circle r="3.2" fill="#1e1713" />
      <circle r="1.3" fill="#f3b61f" />
    </svg>
  );
}

export function Logo({ className, tone = "ink" }: { className?: string; tone?: "ink" | "cream" }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2.5 ${className ?? ""}`} aria-label="Navratri NCR — home">
      <LogoMark className="size-8 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:rotate-[45deg]" />
      <span className={`font-display text-[1.1rem] font-extrabold leading-none tracking-tight ${tone === "cream" ? "text-cream" : "text-ink"}`}>
        Navratri<span className="text-sindoor">·</span>NCR
      </span>
    </Link>
  );
}
