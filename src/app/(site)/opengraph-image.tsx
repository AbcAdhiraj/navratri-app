import { OG_SIZE, siteOgImage } from "@/lib/og";

export const alt = "Navratri NCR — NCR, let’s garba.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return siteOgImage();
}
