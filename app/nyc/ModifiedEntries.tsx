import { ArticleDefinition } from "./types";

export const entryModifiers: Partial<{
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
export const ModifiedEntriesWithDots = ({
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
