import Link from "@/components/shared/link";
import { ArticleDefinition } from "./types";

const entryModifiers: Partial<{
  [K in keyof ArticleDefinition]: (
    value: ArticleDefinition[K],
    index?: number,
  ) => JSX.Element | null;
}> = {
  pub_date: (value, index) => {
    if (!value) return null;
    return <span key={index}>{new Date(value).toDateString()}</span>;
  },
  headline: (value, index) => {
    if (!value) return null;
    return (
      <span className="font-bold" key={index}>
        {value}
      </span>
    );
  },
  location_name: (value, index) => {
    if (!value) return null;
    return (
      <span key={index}>
        this location was approximately called {value} in this article
      </span>
    );
  },
};

const ModifiedEntriesWithDots = ({
  article,
  entries,
  className,
}: {
  article: ArticleDefinition;
  entries: (keyof ArticleDefinition)[];
  className?: string;
}) => (
  <div
    className={`*:after:px-[0.375rem] [&>*:not(:last-child)]:after:content-['·'] ${className}`}
  >
    {entries
      .map((entry, index) => {
        const modifier = entryModifiers[entry];
        // @ts-ignore TODO: fix
        if (modifier) return modifier?.(article[entry], index);
        return <span key={index}>{article[entry]}</span>;
      })
      .filter(Boolean)}
  </div>
);

const ArticleLineItem = ({
  article,
  showLocationInfo,
}: {
  article: ArticleDefinition;
  showLocationInfo?: boolean;
}) => {
  return (
    <Link
      className="flex flex-col gap-1 rounded-md px-4 py-2 hover:bg-slate-200"
      href={article.link as string}
    >
      <ModifiedEntriesWithDots
        article={article}
        entries={["headline", "feed_name"]}
        className="text-md leading-[1.375rem]"
      />
      <ModifiedEntriesWithDots
        article={article}
        entries={[
          "pub_date",
          "author",
          ...(["location_name"].filter(() => Boolean(showLocationInfo)) as
            | ["location_name"]
            | []),
        ]}
        className="text-xs text-gray-500"
      />
    </Link>
  );
};

export default ArticleLineItem;
