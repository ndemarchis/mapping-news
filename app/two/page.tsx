"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Feature, Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Circle from "ol/style/Circle";
import Select from "ol/interaction/Select";
import { click } from "ol/events/condition";
import { Geometry } from "ol/geom";
import Modal from "@/components/shared/modal";
import { DialogTitle } from "@radix-ui/react-dialog";
import Link from "@/components/shared/link";
import { LoadingDots } from "@/components/shared/icons";
import ArticleLineItem from "./ArticleLineItem";
import { ArticleDefinition } from "./types";
import { HelpCircle } from "lucide-react";
import Tooltip from "@/components/shared/tooltip";

type Articles = {
  address: string | null;
  place_id: string | null;
  articles: ArticleDefinition[];
} | null;

const DateEntry = (isoDate?: string) => {
  if (!isoDate) return undefined;
  const date = new Date(isoDate);
  return date.toLocaleDateString();
};

const PublicationEntry = (
  publication?: string,
  articleLink?: string | null,
) => {
  if (!publication) return undefined;
  if (articleLink) {
    return <Link href={articleLink}>{publication}</Link>;
  } else {
    return publication;
  }
};

export default function Openlayers() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState<Articles>(null);
  const selectedArticlesLocationNames =
    selectedArticles?.articles
      ?.map((a) => a.location_name)
      .filter((a) => a !== null) || [];

  useEffect(() => {
    console.log(selectedArticlesLocationNames);
  }, [selectedArticles]);

  const [map, setMap] = useState();
  const mapElement = useRef<HTMLDivElement>();
  const mapRef = useRef();
  mapRef.current = map;

  const handleFeatureClick = async (feature: Feature<Geometry>) => {
    const properties = feature?.getProperties();
    if (!properties) return;
    setShowModal(true);
    setLoading(true);
    await fetch(`/two/live/articles/${properties.place_id}`, {
      cache: "force-cache",
      next: { revalidate: 1800 },
    })
      .then((response) => response.json())
      .then((data) => {
        setSelectedArticles({
          address: properties.title,
          place_id: properties.place_id,
          articles: data,
        });
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!showModal) {
      setSelectedArticles(null);
    }
  }, [showModal]);

  const dotStyle = useCallback(
    (color: string) =>
      new Style({
        image: new Circle({
          stroke: new Stroke({
            color: color,
            width: 1.5,
          }),
          radius: 3,
        }),
      }),
    [],
  );

  useEffect(() => {
    const osmLayer = new TileLayer({
      preload: Infinity,
      source: new OSM(),
    });

    const vectorSource = new VectorSource({
      url: "/two/live/locations",
      format: new GeoJSON(),
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    const map = new Map({
      target: mapElement.current,
      layers: [osmLayer, vectorLayer],
      view: new View({
        center: [-8233189, 4966723],
        zoom: 11,
        projection: "EPSG:3857",
      }),
    });

    const selectClick = new Select({
      condition: click,
      // style: selectStyle,
    });

    map.addInteraction(selectClick);
    selectClick.on("select", async (e) => {
      const features = e.selected;
      const feature = features?.[0];
      await handleFeatureClick(feature);
    });

    return () => map.setTarget(undefined);
  }, []);

  return (
    <>
      <Modal
        className="flex max-h-[80vh] flex-col gap-4 overflow-scroll p-4"
        showModal={showModal}
        setShowModal={setShowModal}
      >
        <DialogTitle className="flex flex-col gap-1 p-4">
          {selectedArticlesLocationNames.length ? (
            <>
              <span className="flex flex-row items-center gap-2 font-display text-2xl font-bold">
                {selectedArticlesLocationNames[0]}{" "}
                <Tooltip
                  content={
                    selectedArticlesLocationNames.length > 1
                      ? `This is roughly how one of the articles referred to this place.`
                      : `This is roughly how the article referred this place.`
                  }
                >
                  <HelpCircle className="text-gray-400 transition-all hover:text-gray-500" />
                </Tooltip>
              </span>
              <Link
                className="text-xs text-gray-500 hover:underline"
                href={`https://www.google.com/maps/place/?q=place_id:${selectedArticles?.place_id}`}
              >
                {selectedArticles?.address}
              </Link>
            </>
          ) : (
            <Link
              className="font-display text-2xl font-bold hover:underline"
              href={`https://www.google.com/maps/place/?q=place_id:${selectedArticles?.place_id}`}
            >
              {selectedArticles?.address}
            </Link>
          )}
        </DialogTitle>
        {loading ? (
          <div className="flex h-full w-full items-center justify-center">
            <LoadingDots aria-label="Loading" />
          </div>
        ) : (
          selectedArticles?.articles?.length && (
            <div className="flex flex-col gap-1">
              {selectedArticles?.articles?.map((article) => (
                <ArticleLineItem
                  key={article.uuid3}
                  article={article}
                  showLocationInfo={selectedArticlesLocationNames.length > 1}
                />
              ))}
            </div>
          )
        )}
      </Modal>
      <div className="flex h-full min-h-[calc(100vh-6rem)] w-full flex-col items-center justify-center py-12">
        <div
          ref={mapElement as React.RefObject<HTMLDivElement>}
          className="map-container h-[600px] w-full"
        />
      </div>
      <div className="items-left z-10 m-auto flex min-h-screen w-full flex-col justify-start gap-4 p-4 *:z-10 md:max-w-xl">
        <h2 className="mx-auto">about this map</h2>
        <p>
          this map was developed by{" "}
          <Link href="https://nickdemarchis.com">nick deMarchis</Link> over the
          course of a few weeks as a proof-of-concept to map places mentioned in
          local news articles in realtime in New York City.
        </p>
        <p>
          it seems like it&apos;s worked, at least to some degree. there&apos;s
          some dust and clear areas for improvement that i have documented,
          obviously. check the{" "}
          <Link href="https://github.com/ndemarchis/mapping-news/issues">
            issue tracker
          </Link>{" "}
          to see what&apos;s up. or, you can contact me with the information
          mentioned at the bottom of{" "}
          <Link href="/about" sameWindow>
            the about page
          </Link>
          .
        </p>
        <h3>process</h3>
        <p>
          there are three main parts of this project: a recurring Python script,
          a database, and the frontend.
        </p>
        <p>
          the Python script is supposed to run on a schedule. it checks against
          a predetermined set of RSS feeds, and determines whether any new
          articles have been added since it last checked. if so, it will pull
          relevant information from those articles, and temporarily store them.
        </p>
        <p>
          it then uses OpenAI&apos;s{" "}
          <Link href="https://openrouter.ai/openai/gpt-4o-mini-2024-07-18">
            <span className="font-mono">gpt-4o-mini-2024-07-18</span>
          </Link>{" "}
          model to extract physical locations that are mentioned in the text of
          each article.
        </p>
        <p>
          after we have relevant locations extracted, we use the Google Maps
          Geocoding API to determine their location, as well as to provide
          metadata on whether the place is too generic to be mapped at this
          proof-of-concept stage (for instance, counties, states). we can then
          use the <span className="font-mono">place_id</span> that they provide
          to associate articles with each other.
        </p>
        <p>
          we then send information on our locations, our articles and each
          relation between an article and location to our database.
        </p>
        <p>
          on the frontend, whenever someone loads the page, we use a{" "}
          <Link href="https://nextjs.org/docs/app/building-your-application/routing/route-handlers">
            Next.js Route Handler
          </Link>{" "}
          to reformat our database information as GeoJSON as requested. we then
          serve that GeoJSON to an OpenLayers map.
        </p>
        <p>
          when a user clicks a location, we then use another route to handle
          database requests, and pull the information of the articles that match
          the selected location.
        </p>
        <h3>blind spots</h3>
        <p>
          there are quite a few blind spots and limitations associated here. to
          name a few:
        </p>
        <ul className="list-disc pl-4">
          <li>
            the OpenAI model isn't amazing at pulling out non-obvious locations,
            and sometimes is either too verbose or too general
          </li>
          <li>
            at this moment, i can only really use publications that have working
            RSS feeds. this is mostly fine, as most still do, but not all.
          </li>
          <li>
            i did my best to filter feeds by their metro/local reporting, if
            relevant. that obviously could leave a lot of state- or
            federal-level news with local impact off the map.
          </li>
        </ul>
        <h3>next steps</h3>
        <p>
          like i said,{" "}
          <Link href="https://github.com/ndemarchis/mapping-news/issues">
            issue tracker
          </Link>
          . there's a <span className="italic">lot</span> of work to do —{" "}
          <span className="italic">especially</span> to expand this work to more
          communities and understand better how neighborhoods receive news
          coverage.
        </p>
      </div>
    </>
  );
}
