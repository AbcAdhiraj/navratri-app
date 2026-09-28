import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Serif, Manrope } from "next/font/google";
import { InteractionLayer } from "@/components/ui/InteractionLayer";
import { ToastProvider } from "@/components/ui/Toast";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/constants";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  axes: ["opsz", "wdth"],
  display: "swap",
});
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});
const sans = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${SITE_NAME} — Garba, Dandiya & Navratri nights across NCR`, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    title: `${SITE_NAME} — What are we doing for Navratri tonight?`,
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#f4ecdd",
  colorScheme: "light",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh">
        <ToastProvider>{children}</ToastProvider>
        <InteractionLayer />
      </body>
    </html>
  );
}
