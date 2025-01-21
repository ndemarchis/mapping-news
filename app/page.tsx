import Link from "@/components/shared/link";

export default function Home() {
  return (
    <div className="z-10 flex h-full min-h-[calc(100vh-6rem)] w-full flex-col items-center justify-center gap-8 pt-16 *:z-10">
      <h1 className="px-8 text-center md:max-w-xl md:px-0">
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
      <p className="px-8 text-center md:px-0">
        our flagship project to map news in NYC, is now... live.{" "}
        <Link href="/nyc" sameWindow>
          click me to explore.
        </Link>
      </p>
    </div>
  );
}
