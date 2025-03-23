import Tutorial from "@/app/nyc/Tutorial";
import { fetchArticlesForPlace } from "./fetchArticlesForPlace";
import About from "@/app/nyc/About";
import PlacePage from "./PlacePage";

const PlaceLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { placeId: string | string[] };
}) => {
  const { placeId } = await params;
  const articles = await fetchArticlesForPlace(
    Array.isArray(placeId) ? placeId[0] : placeId,
  );

  return (
    <>
      <div className="grid h-full w-full grid-cols-1 pt-16 mo:grid-cols-[3fr_2fr] md:pb-8">
        <PlacePage articles={articles} />
      </div>
      <div className="items-left flex w-full p-4 mo:hidden md:max-w-xl">
        <div className="z-10 w-full rounded-xl border border-gray-200 bg-white p-4 shadow-md *:*:z-10">
          <Tutorial />
        </div>
      </div>
      <About />
    </>
  );
};

export default PlaceLayout;
