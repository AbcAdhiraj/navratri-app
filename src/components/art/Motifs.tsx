/** Small decorative festival motifs — used as details, never as giant illustrations. */

export function DandiyaPair({ className, color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true" fill="none">
      <g stroke={color} strokeWidth="6" strokeLinecap="round">
        <path d="M22 98 88 22" />
        <path d="M98 98 32 22" />
      </g>
      <g stroke={color} strokeWidth="2" strokeOpacity=".75">
        {[0.25, 0.4, 0.55, 0.7].map((t) => (
          <g key={t}>
            <path d={`M${22 + 66 * t - 5} ${98 - 76 * t - 4} l10 8`} />
            <path d={`M${98 - 66 * t - 5} ${98 - 76 * t + 4} l10 -8`} />
          </g>
        ))}
      </g>
      <circle cx="60" cy="58" r="4.5" fill={color} />
    </svg>
  );
}

export function Diya({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M24 5c3.2 4.2 4.3 7.3 4.3 9.9a4.3 4.3 0 0 1-8.6 0C19.7 12.3 20.8 9.2 24 5Z" fill="#f3b61f" style={{ transformOrigin: "24px 20px", animation: "flicker 2.4s ease-in-out infinite" }} />
      <path d="M24 10.5c1.3 1.8 1.8 3.1 1.8 4.2a1.8 1.8 0 0 1-3.6 0c0-1.1.5-2.4 1.8-4.2Z" fill="#e46f1a" />
      <path d="M5 25h38c-1.6 8.6-9.6 14-19 14S6.6 33.6 5 25Z" fill="#bd1f1a" />
      <path d="M9 25h30" stroke="#f3b61f" strokeWidth="2" />
      <g fill="#f3b61f">
        <circle cx="16" cy="31" r="1.3" />
        <circle cx="24" cy="33" r="1.3" />
        <circle cx="32" cy="31" r="1.3" />
      </g>
    </svg>
  );
}

export function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12 0c.6 5.6 2.4 8.9 7 10.3L24 12l-5 1.7c-4.6 1.4-6.4 4.7-7 10.3-.6-5.6-2.4-8.9-7-10.3L0 12l5-1.7C9.6 8.9 11.4 5.6 12 0Z" />
    </svg>
  );
}

/** A ring of dots — an abstract garba circle. */
export function GarbaRing({ className, count = 24, color = "currentColor" }: { className?: string; count?: number; color?: string }) {
  return (
    <svg viewBox="-50 -50 100 100" className={className} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const a = (Math.PI * 2 * i) / count;
        const big = i % 3 === 0;
        return (
          <circle
            key={i}
            cx={Math.round(Math.cos(a) * 44 * 100) / 100}
            cy={Math.round(Math.sin(a) * 44 * 100) / 100}
            r={big ? 2.6 : 1.4}
            fill={color}
            opacity={big ? 1 : 0.65}
          />
        );
      })}
      <circle r="36" fill="none" stroke={color} strokeOpacity=".3" strokeDasharray="1 3" />
    </svg>
  );
}

/** Printed rule with a central lozenge — a dandiya-stick divider. Inherits currentColor. */
export function StickDivider({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`} aria-hidden="true">
      <span className="h-[1.5px] flex-1 bg-current opacity-25" />
      <svg width="46" height="12" viewBox="0 0 46 12" fill="currentColor">
        <rect x="0" y="5.25" width="15" height="1.5" rx=".75" />
        <path d="M23 0 29 6 23 12 17 6Z" />
        <rect x="31" y="5.25" width="15" height="1.5" rx=".75" />
      </svg>
      <span className="h-[1.5px] flex-1 bg-current opacity-25" />
    </div>
  );
}

/** Scalloped torana edge used where two colour blocks meet. */
export function ToranaEdge({ className, fill = "var(--color-paper)" }: { className?: string; fill?: string }) {
  const n = 48;
  const w = 1200 / n;
  let d = `M0 22 `;
  for (let i = 0; i < n; i++) d += `Q${i * w + w / 2} 0 ${(i + 1) * w} 22 `;
  d += "V40 H0Z";
  return (
    <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path d={d} fill={fill} />
    </svg>
  );
}

/** Hanging torana of alternating leaves & marigolds, used under colour-block headers. */
export function Torana({ className, count = 24 }: { className?: string; count?: number }) {
  return (
    <svg viewBox={`0 0 ${count * 40} 34`} className={className} aria-hidden="true" preserveAspectRatio="xMidYMin slice">
      <path d={`M0 3 H${count * 40}`} stroke="currentColor" strokeWidth="2" />
      {Array.from({ length: count }, (_, i) => {
        const x = i * 40 + 20;
        return i % 2 === 0 ? (
          <path key={i} d={`M${x} 3 q7 12 0 26 q-7 -14 0 -26Z`} fill="var(--leaf, #3c6a32)" />
        ) : (
          <g key={i}>
            <path d={`M${x} 3 V14`} stroke="currentColor" strokeWidth="1.2" />
            <circle cx={x} cy="19" r="6" fill="var(--bloom, #f3b61f)" />
            <circle cx={x} cy="19" r="2.4" fill="var(--bloom-core, #e46f1a)" />
          </g>
        );
      })}
    </svg>
  );
}
