import Link from "@/components/shared/link";

export default function About() {
  return (
    <div className="z-10 flex w-full max-w-xl flex-col gap-2 px-5 xl:px-0">
      <h1>about</h1>
      <p>
        This project is maintained by{" "}
        <Link href="https://nickdemarchis.com">Nick DeMarchis</Link> to document
        changes in the local journalism landscape.
      </p>
      <h2 className="pt-4">projects</h2>
      <ul className="list-none pl-4 -indent-4">
        <li>
          <Link href="/nyc" sameWindow>
            <code>/nyc</code>
          </Link>
            —  Mapping locations mentioned in NYC local news articles in
          realtime. Read more <Link href="/nyc">on that page</Link>.
        </li>
      </ul>
      <h2 className="pt-4">tools</h2>
      <p>
        This site is built with Next.js and the{" "}
        <Link href="https://precedent.dev">Precedent</Link> component set.
      </p>
      <h2 className="pt-4">contact</h2>
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
