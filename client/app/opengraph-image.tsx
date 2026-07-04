import { ImageResponse } from "next/og";

export const alt = "PropertyConnect — Nigeria's Free Real Estate Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background:
          "linear-gradient(155deg, #071811 0%, #0b2d1e 42%, #0e3c28 72%, #071610 100%)",
        padding: "64px 80px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative",
      }}
    >
      {/* Header row: Logo + Country badge */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Logo lockup */}
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: 60,
              height: 60,
              background: "#0b3d2e",
              borderRadius: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1.5px solid rgba(240,199,94,0.28)",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 30 30" fill="none">
              <path
                d="M7 18L15 9l8 9"
                stroke="#f0c75e"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10.5 18v4h9v-4"
                stroke="#f0c75e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span
            style={{
              fontSize: 34,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            PropertyConnect
          </span>
        </div>

        {/* Country badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(240,199,94,0.10)",
            border: "1px solid rgba(240,199,94,0.24)",
            borderRadius: 999,
            padding: "10px 24px",
          }}
        >
          <span style={{ fontSize: 22 }}>🇳🇬</span>
          <span
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "#f0c75e",
              letterSpacing: "0.10em",
            }}
          >
            NIGERIA
          </span>
        </div>
      </div>

      {/* Main tagline — stacked */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0px",
          margin: "0 0 8px",
        }}
      >
        {["List free.", "Find fast."].map((line) => (
          <span
            key={line}
            style={{
              fontSize: 96,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.06,
              letterSpacing: "-0.04em",
              display: "block",
            }}
          >
            {line}
          </span>
        ))}
        <span
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: "#f0c75e",
            lineHeight: 1.06,
            letterSpacing: "-0.04em",
            display: "block",
          }}
        >
          Deal smart.
        </span>
      </div>

      {/* Stats bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
          background: "rgba(255,255,255,0.055)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 14,
          padding: "18px 28px",
          width: "fit-content",
        }}
      >
        <span
          style={{ fontSize: 19, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}
        >
          4,210 verified listings
        </span>
        <span style={{ fontSize: 19, color: "rgba(255,255,255,0.22)" }}>·</span>
        <span
          style={{ fontSize: 19, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}
        >
          980 ID-checked agents
        </span>
        <span style={{ fontSize: 19, color: "rgba(255,255,255,0.22)" }}>·</span>
        <span style={{ fontSize: 19, color: "#f0c75e", fontWeight: 700 }}>
          ₦0 to list, forever
        </span>
      </div>
    </div>,
    { ...size }
  );
}
