"use client";

import Modal from "@/components/shared/modal";
import useMediaQuery from "@/lib/hooks/use-media-query";
import { useState } from "react";
import type { fetchArticlesForPlace } from "./fetchArticlesForPlace";

import ArticleEntry from "./ArticleEntry";

type Props = {
  children?: React.ReactNode;
  articles: Awaited<ReturnType<typeof fetchArticlesForPlace>>;
};

const ArticlesWrapper = ({ articles }: Props) => {
  const { isMobile } = useMediaQuery();
  const [showModal, setShowModal] = useState(false);

  if (isMobile) {
    return (
      <Modal showModal={showModal} setShowModal={setShowModal}>
        {articles?.map((a, i) => (
          <p key={i}>{JSON.stringify(a)}</p>
        ))}
      </Modal>
    );
  }

  return (
    <div className="z-10 flex h-[calc(100vh-12rem)] w-full max-w-xl flex-col overflow-x-scroll rounded-xl border border-gray-200 bg-white p-4 shadow-md">
      {articles?.map((article, i) => (
        // @ts-expect-error
        <ArticleEntry key={i} article={article} />
      ))}
    </div>
  );
};

export default ArticlesWrapper;
