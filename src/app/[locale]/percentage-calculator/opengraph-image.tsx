import { ImageResponse } from "next/og";
import { LOCALES } from "@/lib/i18n";

/**
 * Social preview card — same construction as the GST calculator's own
 * `opengraph-image.tsx`: typographic, light-theme, Latin-only (the
 * bundled font has no Devanagari glyphs), so both locales share it.
 */
export const alt = "Percentage Calculator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#fbfaf8",
          padding: "88px 96px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 96,
            height: 8,
            borderRadius: 999,
            background: "#0f9d74",
            marginBottom: 44,
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "#1b1d1e",
            lineHeight: 1.05,
          }}
        >
          Percentage Calculator
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 42,
            color: "#4a5157",
            letterSpacing: "-0.01em",
          }}
        >
          Percentages, increases and decreases in seconds
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 56,
            gap: 20,
            fontSize: 30,
            color: "#0b7a5a",
            fontWeight: 600,
          }}
        >
          {["% of", "% change"].map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                padding: "12px 28px",
                borderRadius: 999,
                background: "#e6f5ef",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
