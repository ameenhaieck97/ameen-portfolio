import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ameen Haieck — Graphic Designer",
    short_name: "Ameen Haieck",
    description:
      "Ameen Haieck designs visual identities that hold up — branding, editorial design and digital work since 2015.",
    start_url: "/",
    display: "standalone",
    background_color: "#343131",
    theme_color: "#343131",
    icons: [
      { src: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { src: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { src: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
