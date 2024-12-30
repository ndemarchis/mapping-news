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
import { Database } from "./live/database.types";
import ArticleLineItem from "./ArticleLineItem";

type Articles = {
  address: string;
  place_id: string;
  articles: Database["public"]["Tables"]["articles"]["Row"][];
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

  const [map, setMap] = useState();
  const mapElement = useRef<HTMLDivElement>();
  const mapRef = useRef();
  mapRef.current = map;

  const handleFeatureClick = async (feature: Feature<Geometry>) => {
    setShowModal(true);
    const properties = feature.getProperties();
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
      console.log(e);
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
        <DialogTitle className="p-4 font-display text-2xl font-bold">
          <Link
            className="hover:underline"
            href={`https://www.google.com/maps/place/?q=place_id:${selectedArticles?.place_id}`}
          >
            {selectedArticles?.address}
          </Link>
        </DialogTitle>
        {loading ? (
          <div className="flex h-full w-full items-center justify-center">
            <LoadingDots aria-label="Loading" />
          </div>
        ) : (
          selectedArticles?.articles?.length && (
            <div className="flex flex-col gap-1">
              {selectedArticles?.articles?.map((article) => (
                <ArticleLineItem key={article.uuid3} article={article} />
              ))}
            </div>
          )
        )}
      </Modal>
      <div className="flex h-full min-h-[calc(100vh-6rem)] w-full flex-col items-center justify-center py-8">
        <div
          ref={mapElement as React.RefObject<HTMLDivElement>}
          className="map-container h-[600px] w-full"
        />
      </div>
    </>
  );
}
