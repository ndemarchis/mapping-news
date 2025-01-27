import useMediaQuery from "@/lib/hooks/use-media-query";
import { ArticlesDefinition } from "./types";
import React, { Suspense, useEffect, useMemo } from "react";
import { DialogTitle } from "@radix-ui/react-dialog";
import Modal from "@/components/shared/modal";
import ArticleLineItem from "./ArticleLineItem";
import { LoadingDots } from "@/components/shared/icons";
import Link from "@/components/shared/link";

const ResponsiveSidebar = ({
  showModal,
  setShowModal,
  selectedArticles,
  loading,
}: {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedArticles: ArticlesDefinition;
  loading: boolean;
}) => {
  const { isMobile } = useMediaQuery();
  const selectedArticlesLocationNames =
    selectedArticles?.articles
      ?.map((a) => a.location_name)
      .filter((a) => a !== null) || [];

  useEffect(() => {
    console.log("selectedArticles", selectedArticles);
    console.log("loading", loading);
  }, [selectedArticles, loading]);

  const SidebarOrModal = ({ children }: React.PropsWithChildren<{}>) => {
    if (isMobile) {
      return (
        <Modal
          className="flex max-h-[80vh] min-h-[40vh] flex-col gap-4 p-4"
          showModal={showModal}
          setShowModal={setShowModal}
        >
          {children}
        </Modal>
      );
    } else {
      const showModalClassName = "w-full p-8";
      // const showModalClassName = showModal ? "w-full p-8" : "w-0 p-0";
      return (
        <div
          className={`z-10 h-[calc(100vh-12rem)] overflow-y-scroll transition-all ${showModalClassName}`}
        >
          {children}
        </div>
      );
    }
  };
  const Title = isMobile ? DialogTitle : "div";

  return (
    <SidebarOrModal>
      <Suspense fallback={<LoadingDots aria-label="Loading" />}>
        <Title className="flex flex-col gap-1 px-4">
          {selectedArticlesLocationNames.length > 0 && !loading && (
            <>
              <span className="flex flex-row items-center gap-2 font-display text-2xl font-bold md:pt-4">
                {selectedArticlesLocationNames[0]}
              </span>
              <Link
                className="text-xs text-gray-500 hover:underline"
                href={`https://www.google.com/maps/search/?api=1&query=${selectedArticles?.address}&query_place_id=${selectedArticles?.place_id}`}
              >
                View on Google Maps
              </Link>
            </>
          )}
        </Title>
        {!(selectedArticlesLocationNames.length > 0) && (
          <div className="flex h-full w-full items-center justify-center">
            {loading ? (
              <LoadingDots aria-label="Loading" />
            ) : (
              <span className="flex flex-row items-center gap-2 font-display text-2xl font-bold">
                select a location on the map...
              </span>
            )}
          </div>
        )}
        {selectedArticles?.articles?.length && !loading && (
          <div className="flex flex-col gap-1 overflow-y-scroll">
            {selectedArticles?.articles?.map((article, index) => (
              <ArticleLineItem
                key={`${article.uuid3}${index}`}
                article={article}
                showLocationInfo={selectedArticlesLocationNames.length > 1}
              />
            ))}
          </div>
        )}
      </Suspense>
    </SidebarOrModal>
  );
};

export default ResponsiveSidebar;
