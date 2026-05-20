import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VocabVault — Master English Vocabulary",
    short_name: "VocabVault",
    description: "A structured, science-backed word acquisition system that takes you through ten cognitive stages per word.",
    start_url: "/",
    display: "standalone",
    background_color: "#0e0d13",
    theme_color: "#6b21a8",
    icons: [
      {
        src: "/VocabVault.png",
        sizes: "192x192 512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/VocabVault.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/VocabVault.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
