import type { MetadataRoute } from "next";

// Ikona na ploše telefonu a v instalované aplikaci (obrázky v public/brand).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Učíme se hrou",
    short_name: "Učíme se hrou",
    description: "Online příprava na základku, střední, přijímačky i maturitu",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f4ee",
    theme_color: "#3248f0",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Ikona má kolem sebe dost místa, aby ji Android mohl oříznout do kruhu.
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
