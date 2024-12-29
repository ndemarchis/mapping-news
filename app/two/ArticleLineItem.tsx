import Link from "@/components/shared/link";
import { Database } from "./live/database.types";

type ArticleDefinition = Database["public"]["Tables"]["articles"]["Row"];

type EntryModifiers = Partial<{
  [K in keyof ArticleDefinition]: (value: ArticleDefinition[K]) => JSX.Element;
}>;

const entryModifiers: EntryModifiers = {
  pub_date: (value) => (
    <span className="text-xs text-gray-500">
      {new Date(value || "").toDateString()}
    </span>
  ),
};

const ArticleLineItem = ({ article }: { article: ArticleDefinition }) => {
  return (
    <Link
      className="flex flex-col rounded-md hover:bg-slate-200"
      href={article.link as string}
    >
      <span className="text-md">
        <span className="font-bold">{article.headline}</span> ·{" "}
        {article.feed_name}
      </span>
      <span className="text-xs text-gray-500">{}</span>
    </Link>
  );
};

export default ArticleLineItem;
