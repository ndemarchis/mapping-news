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
import { Properties } from "./live/locations/route";
import Link from "@/components/shared/link";

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
  const [feature, setFeature] = useState<Feature<Geometry>>();
  const featureProperties = feature?.getProperties() as Record<string, any> &
    Properties;
  const [map, setMap] = useState();
  const mapElement = useRef<HTMLDivElement>();
  const mapRef = useRef();
  mapRef.current = map;

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
      url: "/two/live",
      format: new GeoJSON(),
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    const map = new Map({
      target: mapElement.current,
      layers: [osmLayer, vectorLayer],
      view: new View({
        center: [-73.96, 40.69],
        zoom: 10.12,
        projection: "EPSG:4326",
      }),
    });

    const selectClick = new Select({
      condition: click,
      // style: selectStyle,
    });

    map.addInteraction(selectClick);
    selectClick.on("select", (e) => {
      const features = e.selected;
      const feature = features?.[0];
      setFeature(feature);
      setShowModal(true);
    });

    return () => map.setTarget(undefined);
  }, []);

  return (
    <>
      <Modal
        className="flex max-h-[80vh] flex-col gap-4 overflow-scroll p-8"
        showModal={showModal}
        setShowModal={setShowModal}
      >
        <DialogTitle>
          <span className="font-display text-2xl font-bold">
            {featureProperties?.articleTitle}
          </span>
        </DialogTitle>
        <p>
          This is <span>{featureProperties?.title}</span>
        </p>
        <p className=" text-gray-500">
          {[
            [featureProperties?.feedName],
            [
              featureProperties?.articlePubDate
                ? new Date(
                    featureProperties?.articlePubDate,
                  ).toLocaleDateString()
                : null,
            ],
            [featureProperties?.articleAuthor],
          ]
            .filter(Boolean)
            .map((item) => item)
            .join(" · ")}
        </p>
        {featureProperties?.articleLink && (
          <p>
            Read the article at its original location{" "}
            <Link href={featureProperties?.articleLink}>here</Link>.
          </p>
        )}
        <p className=" text-gray-500 ">
          <span className="font-bold text-gray-800">
            All places mentioned in this article:{" "}
          </span>
          {featureProperties?.locations}
        </p>
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
