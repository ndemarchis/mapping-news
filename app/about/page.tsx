import Link from "@/components/shared/link";

export default function About() {
  return (
    <div className="z-10 w-full max-w-xl px-5 xl:px-0">
      <h1 className="text-3xl font-bold">about</h1>
      <p>
        this project is maintained by{" "}
        <Link href="https://nickdemarchis.com">nick deMarchis</Link> to document
        changes in the local journalism landscape.
      </p>
      <h1 className="mt-8 text-3xl font-bold">tools</h1>
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
      <h1 className="mt-8 text-3xl font-bold">contact</h1>
      <p>
        email{" "}
        <span className="font-semibold text-gray-600 underline-offset-2">
          hi [at] mapping.news
        </span>
        .
      </p>
    </div>
  );
}
