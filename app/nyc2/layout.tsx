import Tutorial from "./[placeId]/Tutorial";
import About from "@/app/nyc/About";
import { fetchLocations } from "./fetchLocations";
import MapComponent from "./MapComponent";
import { Suspense } from "react";
import MapLoadingSkeleton from "./MapLoadingSkeleton";

const PlaceLayout = async ({ children }: { children: React.ReactNode }) => {
  const geoJson = await fetchLocations();

  return (
    <>
      <div className="grid h-full w-full grid-cols-1 pt-16 mo:grid-cols-[3fr_2fr] md:pb-8 ">
        <Suspense fallback={<MapLoadingSkeleton />}>
          <MapComponent geoJson={geoJson} />
        </Suspense>
        {children}
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
