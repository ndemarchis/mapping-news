import Link from "@/components/shared/link";

export default function Home() {
  return (
    <div className="z-10 flex h-full min-h-[calc(100vh-6rem)] w-full flex-col items-center justify-center gap-8 pt-16 *:z-10">
      <h1 className="text-center md:max-w-xl">
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
      <p>
        our flagship project, Live, is now... live.{" "}
        <Link href="/nyc" sameWindow>
          click me to explore.
        </Link>
      </p>
    </div>
  );
}
