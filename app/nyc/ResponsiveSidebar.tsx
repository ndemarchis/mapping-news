import useMediaQuery from "@/lib/hooks/use-media-query";
import { ArticlesDefinition } from "./types";
import React, { useMemo } from "react";
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
      const showModalClassName = showModal ? "w-full p-8" : "w-0 p-0";
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
      <Title className="flex flex-col gap-1 px-4 md:pt-4">
        {selectedArticlesLocationNames.length ? (
          <>
            <span className="flex flex-row items-center gap-2 font-display text-2xl font-bold">
              {selectedArticlesLocationNames[0]}
            </span>
            <Link
              className="text-xs text-gray-500 hover:underline"
              href={`https://www.google.com/maps/search/?api=1&query=${selectedArticles?.address}&query_place_id=${selectedArticles?.place_id}`}
            >
              View on Google Maps
            </Link>
          </>
        ) : (
          <span className="flex flex-row items-center gap-2 font-display text-2xl font-bold">
            Mapping News
          </span>
        )}
      </Title>
      {loading ? (
        <div className="flex h-full w-full items-center justify-center">
          <LoadingDots aria-label="Loading" />
        </div>
      ) : (
        selectedArticles?.articles?.length && (
          <div className="flex flex-col gap-1 overflow-y-scroll">
            {selectedArticles?.articles?.map((article, index) => (
              <ArticleLineItem
                key={`${article.uuid3}${index}`}
                article={article}
                showLocationInfo={selectedArticlesLocationNames.length > 1}
              />
            ))}
          </div>
        )
      )}
    </SidebarOrModal>
  );
};

export default ResponsiveSidebar;
