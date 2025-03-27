"use client";

import Modal from "@/components/shared/modal";
import useMediaQuery from "@/lib/hooks/use-media-query";
import { use, useState } from "react";
import type { fetchArticlesForPlace } from "./fetchArticlesForPlace";
import { fetchLocations } from "./fetchLocations";
import MapComponent from "./MapComponent";

import "maplibre-gl/dist/maplibre-gl.css";
import ArticleEntry from "./ArticleEntry";

type Props = {
  articles: Awaited<ReturnType<typeof fetchArticlesForPlace>>;
  geoJson: Awaited<ReturnType<typeof fetchLocations>>;
};

const PlacePage = ({ articles, geoJson }: Props) => {
  const { isMobile } = useMediaQuery();
  const [showModal, setShowModal] = useState(false);

  if (isMobile) {
    return (
      <>
        <div className="z-10 flex flex-col gap-4 p-4">
          <MapComponent geoJson={geoJson} />
        </div>
        <Modal showModal={showModal} setShowModal={setShowModal}>
          {articles?.map((a, i) => (
            <p key={i}>{JSON.stringify(a)}</p>
          ))}
        </Modal>
      </>
    );
  }

  return (
    <>
      <MapComponent geoJson={geoJson} />
      <div className="z-10 flex h-[calc(100vh-12rem)] w-full max-w-xl flex-col overflow-x-scroll rounded-xl border border-gray-200 bg-white p-4 shadow-md">
        {articles?.map((article, i) => (
          // @ts-expect-error
          <ArticleEntry key={i} article={article} />
        ))}
      </div>
    </>
  );
};

export default PlacePage;
