import Tutorial from "./[...slug]/Tutorial";
import About from "@/app/nyc/About";
import { fetchLocations } from "./fetchLocations";
import MapComponent from "./MapComponent";

export const revalidate = 600;

const PlaceLayout = async ({ children }: { children: React.ReactNode }) => {
  const geoJson = await fetchLocations();

  return (
    <>
      <div className="grid h-full w-full grid-cols-1 pt-16 mo:grid-cols-[3fr_2fr] mo:pb-8 ">
        <MapComponent geoJson={geoJson} />
        <div className="z-10 hidden h-[80vh] w-full max-w-xl overflow-scroll bg-white mo:flex md:h-[calc(100vh-12rem)]">
          {children}
        </div>
      </div>
      <div className="items-left flex w-full p-4 mo:hidden mo:max-w-xl">
        <div className="z-10 w-full rounded-xl border border-gray-200 bg-white p-4 shadow-md *:*:z-10">
          <Tutorial />
        </div>
      </div>
      <About />
    </>
  );
};

export default PlaceLayout;
