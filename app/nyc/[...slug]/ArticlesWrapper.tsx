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
import { DialogTitle } from "@radix-ui/react-dialog";

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

  const SidebarOrModal = ({ children }: React.PropsWithChildren<{}>) => {
    if (isMobile) {
      return (
        <Modal
          className="flex max-h-[80vh] min-h-[40vh] flex-col"
          showModal={showModal}
          setShowModal={setShowModal}
        >
          {children}
        </Modal>
      );
    } else {
      return (
        <div className="z-10 flex h-[calc(100vh-12rem)] flex-col overflow-y-scroll bg-white shadow-lg transition-all duration-75">
          {children}
        </div>
      );
    }
  };
  const Title = isMobile ? DialogTitle : "div";

  return (
    <SidebarOrModal>
      <Suspense fallback={<LoadingDots />}>
        {articles && (
          <Title>
            <ArticlesWrapperNavbar
              locationName={locationName}
              placeId={placeId}
            />
          </Title>
        )}
        <div className="flex flex-col gap-1 overflow-y-scroll p-2 mo:px-4">
          {articles?.map((article, i) => (
            // @ts-expect-error
            <ArticleEntry key={i} article={article} />
          ))}
          {articles?.length === 20 && (
            <Link
              href={`/nyc/${placeId}/full`}
              sameWindow
              className="flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 transition-all duration-75 hover:border-gray-800 focus:outline-none active:bg-gray-100"
            >
              load more articles
            </Link>
          )}
        </div>
      </Suspense>
    </SidebarOrModal>
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
    <span className="flex flex-row items-start gap-4 px-6 py-4 mo:px-8">
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
