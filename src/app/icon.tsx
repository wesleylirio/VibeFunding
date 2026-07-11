import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** App icon — red/coral brand (replaces legacy mint favicon.ico). */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#070708",
          borderRadius: 8,
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background:
              "linear-gradient(135deg, #FF3B47 0%, #FF5A3D 45%, #E83CFF 100%)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
