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
        <div className="bg-surface-strong text-primary shadow-elevated z-10 flex h-[calc(100vh-12rem)] flex-col overflow-y-scroll transition-all duration-75">
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
              className="border-subtle text-primary hover:border-strong active:bg-surface-muted flex items-center justify-center rounded-md border px-3 py-2 transition-all duration-75 focus:outline-none"
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
    <span className="flex flex-row items-start gap-4 px-6 pb-4 pt-4 mo:px-8 mo:pt-8">
      <span className="w-full text-balance font-display text-2xl font-bold">
        {locationName}
      </span>
      <span className="flex flex-row items-center gap-2">
        <Link
          className="text-subtle hover:text-primary active:bg-surface-muted transition-all duration-75 hover:cursor-pointer"
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
          <Share className="text-subtle hover:text-primary active:bg-surface-muted transition-all duration-75 hover:cursor-pointer" />
        </button>
        <Link
          aria-label="Close"
          className="text-subtle hover:text-primary active:bg-surface-muted transition-all duration-75 hover:cursor-pointer"
          href={getPlaceIdRelativeHref()}
          sameWindow
        >
          <X />
        </Link>
      </span>
    </span>
  );
};
