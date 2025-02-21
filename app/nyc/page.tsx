import { Metadata } from "next";
import MapComponent from "./MapComponent";
import Tutorial from "./Tutorial";
import About from "./About";

export default function Page() {
  return (
    <>
      <div className="grid h-full w-full grid-cols-1 pt-16 mo:grid-cols-[3fr_2fr] md:pb-8">
        <MapComponent />
      </div>
      <div className="items-left flex w-full p-4 mo:hidden md:max-w-xl">
        <div className="z-10 w-full rounded-xl border border-gray-200 bg-white p-4 shadow-md *:*:z-10">
          <Tutorial />
        </div>
      </div>
      <About />
    </>
  );
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
