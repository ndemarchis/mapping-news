import useMediaQuery from "@/lib/hooks/use-media-query";
import { ArticlesDefinition } from "./types";
import React, { Suspense, useEffect } from "react";
import { DialogTitle } from "@radix-ui/react-dialog";
import Modal from "@/components/shared/modal";
import ArticleLineItem from "./ArticleLineItem";
import { LoadingDots } from "@/components/shared/icons";
import Link from "@/components/shared/link";
import Tutorial from "./Tutorial";

const ResponsiveSidebar = ({
  showModal,
  setShowModal,
  selectedArticles,
  loading,
  loadMoreArticles,
  hasMore,
}: {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedArticles: ArticlesDefinition;
  loading: boolean;
  loadMoreArticles: () => void;
  hasMore: boolean;
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
      return (
        <div
          className={`z-10 h-[calc(100vh-12rem)] overflow-y-scroll p-8 transition-all`}
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
              <span className="flex flex-row items-center gap-2 font-display text-2xl font-bold mo:pt-4">
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
              <div className="hidden mo:inline">
                <Tutorial />
              </div>
            )}
          </div>
        )}
        {selectedArticles?.articles?.length && (
          <div className="flex flex-col gap-1 overflow-y-scroll">
            {selectedArticles?.articles?.map((article, index) => (
              <ArticleLineItem
                key={`${article.uuid3}${index}`}
                article={article}
                showLocationInfo={selectedArticlesLocationNames.length > 1}
              />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="mb-2 mt-4 flex justify-center">
                <button
                  onClick={loadMoreArticles}
                  disabled={loading}
                  className="rounded-md bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? <LoadingDots /> : "Load More"}
                </button>
              </div>
            )}
          </div>
        )}
      </Suspense>
    </SidebarOrModal>
  );
};

export default ResponsiveSidebar;
