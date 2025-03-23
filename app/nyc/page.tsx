import { Metadata } from "next";

export default function Page() {
  // Empty component as the layout now contains the MapComponent
  return null;
}

export const metadata: Metadata = {
  title: "mapping.news in nyc",
  description: "locations mentioned in New York City local journalism. live.",
  openGraph: {
    title: "mapping.news in nyc",
    description: "locations mentioned in New York City local journalism. live.",
    url: "https://mapping.news/nyc",
    images: [
      {
        url: "https://mapping.news/nyc/og-image.png",
        width: 1200,
        height: 630,
        alt: "mapping.news logo against a map backdrop",
      },
    ],
  },
};
