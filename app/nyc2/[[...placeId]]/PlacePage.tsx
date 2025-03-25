"use client";

import Modal from "@/components/shared/modal";
import useMediaQuery from "@/lib/hooks/use-media-query";
import { use, useState } from "react";
import type { fetchArticlesForPlace } from "./fetchArticlesForPlace";
import { fetchLocations } from "./fetchLocations";

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
        <div className="flex flex-col gap-4 p-4">map</div>
        <Modal showModal={showModal} setShowModal={setShowModal}>
          {articles?.map((a, i) => (
            <p key={i}>{JSON.stringify(a)}</p>
          ))}
        </Modal>
      </>
    );
  }

  return (
    <div className="grid h-full w-full grid-cols-1 pt-16 mo:grid-cols-[3fr_2fr] md:pb-8">
      <div className="flex flex-col gap-4 p-4">map</div>
      <div className="z-10 flex w-full max-w-xl flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-md">
        {articles?.map((a, i) => (
          <p key={i}>{JSON.stringify(a)}</p>
        ))}
      </div>
    </div>
  );
};

export default PlacePage;
