import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "linear-gradient(135deg, #006675 0%, #00959C 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FF9D2D",
          borderRadius: 8,
          fontWeight: 800,
          border: "2px solid #4DC2C2",
        }}
      >
        ₹
      </div>
    ),
    {
      ...size,
    }
  );
}
