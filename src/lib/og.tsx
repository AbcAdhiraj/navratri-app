import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { paletteFor } from "@/components/art/seed";
import { rangoliSvg } from "@/components/art/Rangoli";
import { AREA_META } from "./constants";
import { formatDateRange, priceLabel } from "./format";
import type { EventRecord } from "./types";

export const OG_SIZE = { width: 1200, height: 630 };

let fonts: Promise<{ name: string; data: Buffer; weight: 800 | 600; style: "normal" }[]> | null = null;
function loadFonts() {
  fonts ??= Promise.all([
    readFile(join(process.cwd(), "src/assets/fonts/Bricolage-ExtraBold.ttf")).then((data) => ({ name: "Bricolage", data, weight: 800 as const, style: "normal" as const })),
    readFile(join(process.cwd(), "src/assets/fonts/Manrope-SemiBold.ttf")).then((data) => ({ name: "Manrope", data, weight: 600 as const, style: "normal" as const })),
  ]);
  return fonts;
}

const svgUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

function dots(color: string) {
  return svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><circle cx="9" cy="9" r="2.6" fill="${color}"/><circle cx="27" cy="27" r="2.6" fill="${color}"/></svg>`,
  );
}

export async function eventOgImage(e: EventRecord | null) {
  const f = await loadFonts();
  if (!e) return siteOgImage();
  const p = paletteFor(e.slug, e.types[0]);
  const text = p.light ? "#1e1713" : "#f4ecdd";
  const title = e.isDemo ? e.title.replace(/^DEMO\s*[—–-]\s*/, "") : e.title;
  const art = svgUri(rangoliSvg({ seed: 11 + e.slug.length * 7, size: 400, rings: 6, colors: [p.motif, p.accent, p.motif, p.accent], strokeWidth: 1.6 }));

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#f4ecdd", padding: 28, fontFamily: "Manrope" }}>
        <div style={{ display: "flex", position: "relative", flex: 1, borderRadius: 32, border: "3px solid #1e1713", overflow: "hidden", background: p.bg }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${dots(p.light ? "rgba(30,23,19,0.14)" : "rgba(244,236,221,0.16)")})`, backgroundRepeat: "repeat" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={art} width={640} height={640} style={{ position: "absolute", right: -150, top: -70 }} alt="" />
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 52, width: 760, position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ display: "flex", background: "#1e1713", color: "#f3b61f", padding: "8px 16px", borderRadius: 999, fontSize: 22 }}>Navratri · NCR</div>
              {e.isDemo && <div style={{ display: "flex", background: "#f3b61f", color: "#1e1713", padding: "8px 14px", borderRadius: 8, border: "2px dashed #1e1713", fontSize: 20, letterSpacing: 3 }}>DEMO</div>}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontFamily: "Bricolage", fontSize: title.length > 28 ? 64 : 80, lineHeight: 0.98, letterSpacing: -2, color: text }}>{title}</div>
              <div style={{ display: "flex", marginTop: 22, fontSize: 28, color: text, opacity: 0.9 }}>
                {formatDateRange(e.occurrences)} · {e.venue.locality}, {AREA_META[e.venue.area].label}
              </div>
              <div style={{ display: "flex", marginTop: 26 }}>
                <div style={{ display: "flex", background: "#f4ecdd", color: "#1e1713", border: "3px solid #1e1713", borderRadius: 999, padding: "10px 24px", fontFamily: "Bricolage", fontSize: 34 }}>
                  {priceLabel(e.price)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: f },
  );
}

export async function siteOgImage() {
  const f = await loadFonts();
  const art = svgUri(rangoliSvg({ seed: 11, size: 400, rings: 7, colors: ["#f3b61f", "#93160f", "#f4ecdd", "#93160f"], strokeWidth: 1.4 }));
  return new ImageResponse(
    (
      <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", background: "#bd1f1a", overflow: "hidden", fontFamily: "Manrope" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${dots("rgba(147,22,15,0.8)")})`, backgroundRepeat: "repeat" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={art} width={760} height={760} style={{ position: "absolute", right: -190, top: -65 }} alt="" />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: 72, position: "relative" }}>
          <div style={{ display: "flex", fontSize: 26, color: "#f4ecdd", letterSpacing: 5 }}>SHARAD NAVRATRI · 11–19 OCT 2026</div>
          <div style={{ display: "flex", fontFamily: "Bricolage", fontSize: 150, lineHeight: 0.86, color: "#f4ecdd", marginTop: 26, letterSpacing: -5 }}>NCR,</div>
          <div style={{ display: "flex", fontFamily: "Bricolage", fontSize: 150, lineHeight: 0.9, color: "#f3b61f", letterSpacing: -5, textShadow: "7px 7px 0 #1e1713" }}>LET’S GARBA.</div>
          <div style={{ display: "flex", fontSize: 30, color: "#f4ecdd", marginTop: 30, maxWidth: 640 }}>Garba, dandiya & Navratri nights across Delhi NCR — checked at the source.</div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: f },
  );
}
