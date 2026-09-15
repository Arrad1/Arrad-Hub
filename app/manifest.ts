import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Arrad Hub",
    short_name: "Arrad Hub",
    description: "Arrad Foot Balconies business control centre",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#4d4f4c",
    theme_color: "#4d4f4c",
    categories: ["business", "productivity"],
    icons: [
      { src: "/arrad-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/arrad-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/arrad-icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
