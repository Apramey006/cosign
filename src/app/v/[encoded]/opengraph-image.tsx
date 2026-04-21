import { ImageResponse } from "next/og";
import { decodeShare } from "@/lib/share";

export const runtime = "nodejs";
export const alt = "Cosign verdict";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const STAMP_BG: Record<string, { bg: string; fg: string; border: string; label: string }> = {
  COSIGNED: {
    bg: "#BEF264",
    fg: "#000",
    border: "#000",
    label: "COSIGNED",
  },
  NOT_COSIGNED: {
    bg: "#EF4444",
    fg: "#FFF",
    border: "#FFF",
    label: "NOT COSIGNED",
  },
  SLEEP_ON_IT: {
    bg: "#FCD34D",
    fg: "#000",
    border: "#000",
    label: "SLEEP ON IT",
  },
};

function formatPriceCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export default async function Image({ params }: { params: Promise<{ encoded: string }> }) {
  const { encoded } = await params;
  const payload = decodeShare(encoded);

  if (!payload) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            background: "#000",
            color: "#fff",
            fontSize: 64,
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "monospace",
          }}
        >
          cosign · verdict not found
        </div>
      ),
      { ...size },
    );
  }

  const { p: product, v: verdict } = payload;
  const stamp = STAMP_BG[verdict.verdict];
  const priceLine = `${product.source ? `${product.source} · ` : ""}${formatPriceCents(product.priceCents)}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#000",
          color: "#FAFAFA",
          padding: 60,
          fontFamily: '"Inter", "Segoe UI", sans-serif',
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 32,
              fontFamily: "monospace",
              fontWeight: 700,
            }}
          >
            <span>cosign</span>
            <span style={{ color: "#BEF264" }}>.</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 18,
              fontFamily: "monospace",
              color: "#A1A1AA",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
            }}
          >
            a verdict
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            marginTop: 40,
            gap: 40,
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 240,
              height: 240,
              background: "#18181B",
              border: "2px solid #27272A",
              alignItems: "center",
              justifyContent: "center",
              color: "#52525B",
              fontFamily: "monospace",
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            IMG
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minWidth: 0,
              paddingTop: 60,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 22,
                fontFamily: "monospace",
                color: "#A1A1AA",
              }}
            >
              {priceLine}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 44,
                fontWeight: 700,
                marginTop: 8,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              {product.name.length > 48
                ? product.name.slice(0, 48) + "..."
                : product.name}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 36,
                marginTop: 24,
                color: "#F4F4F5",
                lineHeight: 1.2,
              }}
            >
              {verdict.headline.length > 120
                ? verdict.headline.slice(0, 120) + "..."
                : verdict.headline}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              position: "absolute",
              top: -10,
              right: -20,
              transform: "rotate(-4deg)",
              background: stamp.bg,
              color: stamp.fg,
              border: `4px solid ${stamp.border}`,
              padding: "18px 28px",
              fontFamily: "monospace",
              fontWeight: 900,
              fontSize: 48,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {stamp.label}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #27272A",
            paddingTop: 20,
            marginTop: 20,
          }}
        >
          <div style={{ display: "flex", fontSize: 20, fontFamily: "monospace", color: "#A1A1AA" }}>
            cosign.app
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              fontFamily: "monospace",
              color: "#BEF264",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
            }}
          >
            get your own →
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
