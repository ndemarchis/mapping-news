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
              <span className="flex flex-col items-start gap-2 font-display">
                <p className="text-2xl font-bold">
                  select a location on the map to get started...
                </p>
                <p>
                  each dot represents a location that was mentioned in a New
                  York City local news article.
                </p>
                <ul className="flex flex-col gap-2 align-baseline">
                  <li>
                    <span className="rounded-md bg-gray-200 px-2 py-1 font-bold text-[#9100ff]">
                      ●  purple dots
                    </span>{" "}
                    have more recent articles
                  </li>
                  <li>
                    <a
                      className=" rounded-md bg-black px-2 py-1 font-bold text-[#85e0ff] transition-[filter] duration-300 hover:cursor-pointer hover:[&>span]:blur-sm"
                      href="https://en.wikipedia.org/wiki/Pale_Blue_Dot"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span className="transition-[filter]">
                        ●  pale blue dots
                      </span>
                    </a>{" "}
                    haven&apos;t been covered in a while
                  </li>
                  <li>
                    <span className="rounded-md bg-gray-200 px-2 py-1 font-bold">
                      ⬤  larger dots
                    </span>{" "}
                    have had a lot of articles written in the last week
                  </li>
                  <li>
                    <span className="rounded-md bg-gray-200 px-2 py-1 font-bold">
                      ·  smaller dots
                    </span>{" "}
                    represent one article or so
                  </li>
                </ul>
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
