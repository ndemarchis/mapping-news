import { fetchRecentLocations } from "./fetchRecentLocations";
import { ArticleLocationEntry } from "@/app/nyc/ArticleLocationEntry";

export const revalidate = 600;

const Tutorial = async () => {
  const locations = await fetchRecentLocations();
  return (
    <div className="box-border flex w-full flex-col items-start gap-2 p-4 font-display mo:p-8">
      <p className="text-2xl font-bold">
        select a location on the map to get started...
      </p>
      <p>
        each dot represents a location that was mentioned in a New York City
        local news article.
      </p>
      <ul className="flex flex-col gap-2 pl-8 align-baseline">
        <li className="-indent-8">
          <span className="rounded-md bg-gray-200 px-2 py-1 font-bold text-[#9100ff]">
            ●  purple dots
          </span>{" "}
          have more recent articles
        </li>
        <li className="-indent-8">
          <a
            className=" rounded-md bg-black px-2 py-1 font-bold text-[#85e0ff] transition-[filter] duration-300 hover:cursor-pointer hover:[&>span]:blur-sm"
            href="https://en.wikipedia.org/wiki/Pale_Blue_Dot"
            target="_blank"
            rel="noreferrer"
          >
            <span className="transition-[filter]">●  pale blue dots</span>
          </a>{" "}
          haven&apos;t been covered in a while
        </li>
        <li className="-indent-8">
          <span className="rounded-md bg-gray-200 px-2 py-1 font-bold">
            ⬤  larger dots
          </span>{" "}
          have had a lot of articles written in the last week
        </li>
        <li className="-indent-8">
          <span className="rounded-md bg-gray-200 px-2 py-1 font-bold">
            ·  smaller dots
          </span>{" "}
          represent one article or so
        </li>
      </ul>{" "}
      <p className="pt-8 text-2xl font-bold">
        or, click a recently popular location below
      </p>
      <ul className="list-disc pl-4">
        {locations.map((location, index) => (
          <ArticleLocationEntry
            key={`${location.place_id}${index}`}
            locationName={
              location.manual_name ?? location.article_location_name
            }
            placeId={location.place_id}
          />
        ))}
      </ul>
    </div>
  );
};

export default Tutorial;
