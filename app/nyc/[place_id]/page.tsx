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
export default async function PlacePage() {
  return null;
}
