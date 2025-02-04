import Link from "@/components/shared/link";

export default function Home() {
  return (
    <div className="z-10 flex h-full min-h-[calc(100vh-6rem)] w-full flex-col items-center justify-center gap-8 pt-16 *:z-10">
      <h1 className="px-8 text-center md:max-w-xl">
        a project to map locations mentioned in local news articles in
        real-time.
      </h1>
      <Link href="/nyc" sameWindow>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/og-image.png"
          alt="mapping.news logo"
          className="md:max-w-3xl"
        />
      </Link>
      <p className="px-8">
        our flagship project to map news in NYC, is now... live.{" "}
      </p>
      <Link
        href="/nyc"
        sameWindow
        className="flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 transition-all duration-75 hover:border-gray-800 focus:outline-none active:bg-gray-100"
      >
        click me to explore.
      </Link>
    </div>
  );
}
