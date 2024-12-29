import Link from "@/components/shared/link";
import { Database } from "./live/database.types";

type ArticleDefinition = Database["public"]["Tables"]["articles"]["Row"];

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
      .map((entry, index) =>
        entryModifiers[entry] ? (
          entryModifiers[entry](article[entry] || "", index)
        ) : (
          <span>{article[entry]}</span>
        ),
      )
      .filter(Boolean)}
  </div>
);

const ArticleLineItem = ({ article }: { article: ArticleDefinition }) => {
  return (
    <Link
      className="flex flex-col gap-1 rounded-md px-4 py-2 hover:bg-slate-200"
      href={article.link as string}
    >
      <ModifiedEntriesWithDots
        article={article}
        entries={["headline", "feed_name"]}
        className="text-md"
      />
      <ModifiedEntriesWithDots
        article={article}
        entries={["pub_date", "author"]}
        className="text-xs text-gray-500"
      />
    </Link>
  );
};

export default ArticleLineItem;
