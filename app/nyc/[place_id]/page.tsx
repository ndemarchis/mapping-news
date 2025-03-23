import { Metadata } from "next";
import { fetchArticlesForPlace } from "./ArticlesProvider";
import PlaceDataProvider from "./PlaceDataProvider";

// Define types for the props
interface PageProps {
  params: {
    place_id: string;
  };
}

// Define the page component with server-side data fetching
export default async function PlacePage({ params }: PageProps) {
  const { place_id } = params;

  // Prefetch articles data on the server
  const articles = await fetchArticlesForPlace(place_id);

  // Instead of duplicating the UI, we just pass data to a client component that will update the context
  return <PlaceDataProvider place_id={place_id} articles={articles} />;
}

// Generate metadata for the page
export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { place_id } = params;

  return {
    title: `mapping.news in nyc - Location ${place_id}`,
    description: "locations mentioned in New York City local journalism. live.",
    openGraph: {
      title: `mapping.news in nyc - Location ${place_id}`,
      description:
        "locations mentioned in New York City local journalism. live.",
      url: `https://mapping.news/nyc/${place_id}`,
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
};
