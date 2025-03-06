import useMediaQuery from "@/lib/hooks/use-media-query";
import { ArticlesDefinition } from "./types";
import React, { Suspense, useEffect, useMemo } from "react";
import { DialogTitle } from "@radix-ui/react-dialog";
import Modal from "@/components/shared/modal";
import ArticleLineItem from "./ArticleLineItem";
import { LoadingDots } from "@/components/shared/icons";
import Link from "@/components/shared/link";
import Tutorial from "./Tutorial";
import { Map, Share, X } from "lucide-react";

const ResponsiveSidebar = ({
  showModal,
  setShowModal,
  selectedArticles,
  setSelectedPlace,
  loading,
}: {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedArticles: ArticlesDefinition;
  setSelectedPlace: (place_id: string, title?: string) => void;
  loading: boolean;
}) => {
  const { isMobile } = useMediaQuery();
  const selectedArticlesLocationNames =
    selectedArticles?.articles
      ?.map((a) => a.location_name)
      .filter((a) => a !== null) || [];

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
      return (
        <div
          className={`z-10 h-[calc(100vh-12rem)] overflow-y-scroll bg-white p-8 shadow-lg transition-all duration-75`}
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
              <span className="flex flex-row items-start gap-4 mo:pt-4">
                <span className="w-full text-balance font-display text-2xl font-bold">
                  {selectedArticlesLocationNames[0]}
                </span>
                <span className="flex flex-row items-center gap-2">
                  <Link
                    className="text-gray-500 transition-all duration-75 hover:cursor-pointer hover:text-gray-800 active:bg-gray-100"
                    title="View on Google Maps"
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedArticles?.address}&query_place_id=${selectedArticles?.place_id}`}
                  >
                    <Map />
                  </Link>
                  <button
                    title="Share"
                    onClick={() => {
                      try {
                        navigator.share({
                          url: window.location.href,
                          text: `local news articles that mention ${selectedArticlesLocationNames[0]}`,
                        });
                      } catch (_) {}
                    }}
                  >
                    <Share className="text-gray-500 transition-all duration-75 hover:cursor-pointer hover:text-gray-800 active:bg-gray-100" />
                  </button>
                  <button title="Close" onClick={() => setShowModal(false)}>
                    <X className="text-gray-500 transition-all duration-75 hover:cursor-pointer hover:text-gray-800 active:bg-gray-100" />
                  </button>
                </span>
              </span>
            </>
          )}
        </Title>
        {!(selectedArticlesLocationNames.length > 0) && (
          <div className="flex w-full items-center justify-center">
            {loading ? (
              <LoadingDots aria-label="Loading" />
            ) : (
              <div className="hidden mo:inline">
                <Tutorial />
              </div>
            )}
          </div>
        )}
        {selectedArticles?.articles?.length && !loading && (
          <>
            <hr className="mx-auto mb-2 mt-4 w-full border-gray-300 md:w-1/2" />
            <div className="flex flex-col gap-1 overflow-y-scroll">
              {selectedArticles?.articles?.map((article, index) => (
                <ArticleLineItem
                  key={`${article.uuid3}${index}`}
                  article={article}
                  showLocationInfo={selectedArticlesLocationNames.length > 1}
                  setSelectedPlace={setSelectedPlace}
                />
              ))}
            </div>
          </>
        )}
      </Suspense>
    </SidebarOrModal>
  );
};

export default ResponsiveSidebar;
