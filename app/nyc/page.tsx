import { Metadata } from "next";
import MapComponent from "./MapComponent";

export default function Page() {
  return <MapComponent />;
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
