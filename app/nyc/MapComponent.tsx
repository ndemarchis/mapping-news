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
import { ArticlesDefinition } from "./types";
import { HelpCircle } from "lucide-react";
import Tooltip from "@/components/shared/tooltip";
import About from "../about/page";
import { FeatureLike } from "ol/Feature";
import { useViewportSize } from "@/components/shared/viewport-size";
import Fill from "ol/style/Fill";

export default function MapComponent() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedArticles, setSelectedArticles] =
    useState<ArticlesDefinition>(null);
  const selectedArticlesLocationNames =
    selectedArticles?.articles
      ?.map((a) => a.location_name)
      .filter((a) => a !== null) || [];

  const [map, setMap] = useState();
  const mapElement = useRef<HTMLDivElement>();
  const mapRef = useRef();
  mapRef.current = map;

  const handleFeatureClick = async (feature: Feature<Geometry>) => {
    const properties = feature?.getProperties();
    if (!properties) return;
    setShowModal(true);
    setLoading(true);
    await fetch(`/nyc/live/articles/${properties.place_id}`, {
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

  const viewportSize = useViewportSize();
  const sizeDependentDotStyles = {
    radius: viewportSize.width < 768 ? 10 : 5,
    strokeWidth: viewportSize.width < 768 ? 3 : 2,
  };

  const dotStyle = useCallback(
    (feature: FeatureLike) =>
      new Style({
        image: new Circle({
          stroke: new Stroke({
            width: sizeDependentDotStyles.strokeWidth,
            color: "rgba(255, 255, 255, 0.5)",
          }),
          fill: new Fill({
            color: "rgba(0, 0, 255, 0.5)",
          }),
          radius: sizeDependentDotStyles.radius,
        }),
      }),
    [sizeDependentDotStyles.radius, sizeDependentDotStyles.strokeWidth],
  );

  useEffect(() => {
    return initializeMap(mapElement);
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
      <About />
    </>
  );

  function initializeMap(mapElement: React.MutableRefObject<HTMLDivElement | undefined>) {
    const osmLayer = new TileLayer({
      preload: Infinity,
      source: new OSM(),
    });

    const vectorSource = new VectorSource({
      url: "/nyc/live/locations",
      format: new GeoJSON(),
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature, _) => {
        return dotStyle(feature);
      },
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
  }
}
