"use client";

import Modal from "@/components/shared/modal";
import useMediaQuery from "@/lib/hooks/use-media-query";
import { Suspense, useState } from "react";
import type { fetchArticlesForPlace } from "./fetchArticlesForPlace";

import ArticleEntry from "./ArticleEntry";
import { LoadingDots } from "@/components/shared/icons";
import Link from "@/components/shared/link";
import { Map, Share, X } from "lucide-react";
import { getPlaceIdRelativeHref } from "../getPlaceIdRelativeHref";
import ResponsivePanelWrapper from "../ResponsivePanelWrapper";
import { DialogContent, DialogTitle } from "@radix-ui/react-dialog";

type Props = {
  children?: React.ReactNode;
  articles: Awaited<ReturnType<typeof fetchArticlesForPlace>>;
  placeId: string;
};

const ArticlesWrapper = ({ articles, placeId }: Props) => {
  const { isMobile } = useMediaQuery();
  const [showModal, setShowModal] = useState(true);
  const locationName = articles
    ?.map((a) => a.location_name)
    .filter(Boolean)?.[0];

  if (isMobile) {
    return (
      <Modal showModal={showModal} setShowModal={setShowModal} className="p-4">
        {articles && (
          <DialogTitle>
            <ArticlesWrapperNavbar
              locationName={locationName}
              placeId={placeId}
            />
          </DialogTitle>
        )}
        <DialogContent className="flex max-h-[80vh] flex-col gap-1">
          {articles?.map((article, i) => (
            // @ts-expect-error
            <ArticleEntry key={i} article={article} />
          ))}
        </DialogContent>
      </Modal>
    );
  }

  return (
    <Suspense fallback={<LoadingDots />}>
      {articles && (
        <ArticlesWrapperNavbar locationName={locationName} placeId={placeId} />
      )}
      <div className="flex flex-col gap-1">
        {articles?.map((article, i) => (
          // @ts-expect-error
          <ArticleEntry key={i} article={article} />
        ))}
      </div>
    </Suspense>
  );
};

export default ArticlesWrapper;

const ArticlesWrapperNavbar = ({
  locationName,
  placeId,
}: {
  locationName?: string | undefined;
  placeId?: string;
}) => {
  return (
    <span className="flex flex-row items-start gap-4 p-4 mo:pt-8">
      <span className="w-full text-balance font-display text-2xl font-bold">
        {locationName}
      </span>
      <span className="flex flex-row items-center gap-2">
        <Link
          className="text-gray-500 transition-all duration-75 hover:cursor-pointer hover:text-gray-800 active:bg-gray-100"
          title="View on Google Maps"
          href={`https://www.google.com/maps/search/?api=1&query=${locationName}&query_place_id=${placeId}`}
        >
          <Map />
        </Link>
        <button
          title="Share"
          onClick={() =>
            navigator.share({
              url: window.location.href,
              text: `local news articles that mention ${locationName}`,
            })
          }
        >
          <Share className="text-gray-500 transition-all duration-75 hover:cursor-pointer hover:text-gray-800 active:bg-gray-100" />
        </button>
        <Link
          aria-label="Close"
          className="text-gray-500 transition-all duration-75 hover:cursor-pointer hover:text-gray-800 active:bg-gray-100"
          href={getPlaceIdRelativeHref()}
          sameWindow
        >
          <X />
        </Link>
      </span>
    </span>
  );
};
