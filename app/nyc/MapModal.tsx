import React from "react";
import Modal from "@/components/shared/modal";
import { DialogTitle } from "@radix-ui/react-dialog";
import Link from "@/components/shared/link";
import { LoadingDots } from "@/components/shared/icons";
import ArticleLineItem from "./ArticleLineItem";
import { ArticlesDefinition } from "./types";

const MapModal = ({
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
  const selectedArticlesLocationNames =
    selectedArticles?.articles
      ?.map((a) => a.location_name)
      .filter((a) => a !== null) || [];
  return (
    <Modal
      className="flex max-h-[80vh] min-h-[40vh] flex-col gap-4 p-4"
      showModal={showModal}
      setShowModal={setShowModal}
    >
      <DialogTitle className="flex flex-col gap-1 px-4 md:pt-4">
        {selectedArticlesLocationNames.length ? (
          <>
            <span className="flex flex-row items-center gap-2 font-display text-2xl font-bold">
              {selectedArticlesLocationNames[0]}
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
    </Modal>
  );
};

export default MapModal;
