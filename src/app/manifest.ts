import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LUNVO — Open Source LinkedIn OS",
    short_name: "LUNVO",
    description:
      "Zero-Ban, BYOK, Local-First AI content engine. 3-Agent pipeline that writes like YOU.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#FBFAF9",
    theme_color: "#004AC6",
    orientation: "portrait-primary",
    categories: ["productivity", "business", "social"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
