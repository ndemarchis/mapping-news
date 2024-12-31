import Link from "@/components/shared/link";

export default function About() {
  return (
    <div className="z-10 flex w-full max-w-xl flex-col gap-2 px-5 xl:px-0">
      <h1>about</h1>
      <p>
        this project is maintained by{" "}
        <Link href="https://nickdemarchis.com">nick deMarchis</Link> to document
        changes in the local journalism landscape.
      </p>
      <p>
        its main project is{" "}
        <Link href="/two" sameWindow>
          here
        </Link>
        , a map of locations mentioned in local news articles. read more{" "}
        <Link href="/two">on that page</Link>.
      </p>
      <h2>tools</h2>
      <ul className="list-disc pl-4">
        <li>
          <Link href="https://precedent.dev">Precedent</Link> framework, which
          includes:
          <ul className="list-disc pl-4">
            <li>
              <Link href="https://tailwindcss.com/">Tailwind CSS</Link>{" "}
              –&nbsp;Utility-first CSS framework for rapid UI development
            </li>
            <li>
              <Link href="https://www.radix-ui.com/">Radix</Link>{" "}
              –&nbsp;Primitives like modal, popover, etc. to build a stellar
              user experience
            </li>
            <li>
              <Link href="https://framer.com/motion">Framer Motion</Link>{" "}
              –&nbsp;Motion library for React to animate components with ease
            </li>
            <li>
              <Link href="https://lucide.dev/">Lucide</Link> –&nbsp;Beautifully
              simple, pixel-perfect icons
            </li>
            <li>
              <Link href="https://nextjs.org/docs/basic-features/font-optimization">
                <code>next/font</code>
              </Link>{" "}
              –&nbsp;Optimize custom fonts and remove external network requests
              for improved performance
            </li>
            <li>
              <Link href="https://nextjs.org/docs/app/api-reference/functions/image-response">
                <code>ImageResponse</code>
              </Link>{" "}
              – Generate dynamic Open Graph images at the edge
            </li>
          </ul>
        </li>
      </ul>
      <h2>contact</h2>
      <p>
        email{" "}
        <span className="font-semibold text-gray-600 underline-offset-2">
          hi [at] mapping [dot] news
        </span>
        .
      </p>
    </div>
  );
}
