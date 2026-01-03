import { ReactNode } from "react";
import ReactMarkdown from "react-markdown";

export default function Card({
  title,
  description,
  demo,
  large,
}: {
  title: string;
  description: string;
  demo: ReactNode;
  large?: boolean;
}) {
  return (
    <div
      className={`border-subtle bg-surface-strong shadow-elevated relative col-span-1 h-96 overflow-hidden rounded-xl border ${
        large ? "md:col-span-2" : ""
      }`}
    >
      <div className="flex h-60 items-center justify-center">{demo}</div>
      <div className="mx-auto max-w-lg text-center">
        <h2 className="bg-gradient-to-br from-black to-stone-500 bg-clip-text font-display text-xl font-bold text-transparent [text-wrap:balance] md:text-3xl md:font-normal">
          {title}
        </h2>
        <div className="text-subtle prose-sm mt-3 leading-normal [text-wrap:balance] md:prose">
          <ReactMarkdown
            components={{
              a: ({ node, ...props }) => (
                <a
                  target="_blank"
                  {...props}
                  className="text-primary font-medium underline transition-colors"
                />
              ),
              code: ({ node, ...props }) => (
                <code
                  {...props}
                  // @ts-ignore (to fix "Received `true` for a non-boolean attribute `inline`." warning)
                  inline="true"
                  className="bg-surface-muted text-primary rounded-sm px-1 py-0.5 font-mono font-medium"
                />
              ),
            }}
          >
            {description}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
