"use client";

import { useState, useEffect } from "react";
import { ArticleLocationEntry } from "./ArticleLocationEntry";
import { Database } from "./live/database.types";
const Tutorial = ({
  setSelectedPlace,
}: {
  setSelectedPlace?: (place_id: string, location_name?: string) => void;
}) => {
  const [locations, setLocations] = useState<
    Database["public"]["Functions"]["get_location_stats_recent"]["Returns"]
  >([]);

  useEffect(() => {
    fetch("/nyc/live/locations/recent")
      .then((res) => res.json())
      .then(setLocations);
  }, []);

  return (
    <div className="box-border flex w-full flex-col items-start gap-2 font-display">
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
            relation={{
              id: location.place_id,
              place_id: location.place_id,
              location_name: location.formatted_address,
              article_uuid: null,
              created_at: "",
            }}
            index={index}
            setSelectedPlace={setSelectedPlace}
          />
        ))}
      </ul>
    </div>
  );
};

export default Tutorial;
