import { ImageResponse } from "next/og";
import { decodeShare } from "@/lib/share";

export const runtime = "nodejs";
export const alt = "Cosign verdict";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#F4F1EA";
const PAPER_TINT = "#EBE6D7";
const INK = "#1C1917";
const INK_MUTED = "#57534E";
const INK_FADE = "#A8A29E";

const STAMP: Record<string, { bg: string; fg: string; label: string }> = {
  COSIGNED: { bg: "#2F7A3C", fg: PAPER, label: "COSIGNED" },
  NOT_COSIGNED: { bg: "#B91C1C", fg: PAPER, label: "NOT COSIGNED" },
  SLEEP_ON_IT: { bg: "#B45309", fg: PAPER, label: "SLEEP ON IT" },
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
            background: PAPER,
            color: INK,
            fontSize: 64,
            alignItems: "center",
            justifyContent: "center",
            fontFamily: '"Courier New", monospace',
          }}
        >
          cosign · verdict not found
        </div>
      ),
      { ...size },
    );
  }

  const { p: product, v: verdict } = payload;
  const stamp = STAMP[verdict.verdict];
  const priceLine = `${product.source ? `${product.source} · ` : ""}${formatPriceCents(product.priceCents)}`;
  const productName = product.name.length > 48 ? product.name.slice(0, 48) + "..." : product.name;
  const headline = verdict.headline.length > 120 ? verdict.headline.slice(0, 120) + "..." : verdict.headline;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: PAPER,
          color: INK,
          padding: 60,
          fontFamily: '"Georgia", "Times New Roman", serif',
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              fontSize: 40,
              fontStyle: "italic",
              fontFamily: '"Georgia", serif',
            }}
          >
            <span>cosign</span>
            <span style={{ color: "#B91C1C", fontStyle: "normal" }}>.</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 16,
              fontFamily: '"Courier New", monospace',
              color: INK_MUTED,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
            }}
          >
            a verdict from armaan
          </div>
        </div>

        <div
          style={{
            display: "flex",
            background: PAPER_TINT,
            border: `2px solid ${INK}20`,
            marginTop: 30,
            padding: 40,
            flex: 1,
            gap: 36,
            position: "relative",
            boxShadow: "3px 6px 0 rgba(28,25,23,0.12)",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 200,
              height: 200,
              background: PAPER,
              border: `2px solid ${INK}25`,
              alignItems: "center",
              justifyContent: "center",
              color: INK_FADE,
              fontFamily: '"Courier New", monospace',
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
              paddingTop: 40,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 20,
                fontFamily: '"Courier New", monospace',
                color: INK_MUTED,
              }}
            >
              {priceLine}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 52,
                fontFamily: '"Georgia", serif',
                marginTop: 6,
                letterSpacing: "-0.015em",
                lineHeight: 1,
              }}
            >
              {productName}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 34,
                fontStyle: "italic",
                fontFamily: '"Georgia", serif',
                marginTop: 22,
                color: INK,
                lineHeight: 1.1,
              }}
            >
              {headline}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              position: "absolute",
              top: -18,
              right: -16,
              transform: "rotate(-4deg)",
              background: stamp.bg,
              color: stamp.fg,
              border: `4px solid ${INK}`,
              padding: "18px 28px",
              fontFamily: '"Courier New", monospace',
              fontWeight: 900,
              fontSize: 44,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              boxShadow: "3px 4px 0 rgba(28,25,23,0.3)",
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
            marginTop: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 14,
              fontFamily: '"Courier New", monospace',
              color: INK_FADE,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
            }}
          >
            thank u for shopping honestly
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 14,
              fontFamily: '"Courier New", monospace',
              color: "#B91C1C",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
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
