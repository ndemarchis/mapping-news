import Link from "@/components/shared/link";
import Image from "next/image";
import { CursorAnimation } from "./CursorAnimation";

export default function Home() {
  return (
    <div className="z-10 flex h-full min-h-[calc(100vh-8rem)] w-full flex-col items-center justify-center gap-8 pt-16 *:z-10">
      <Link
        className="group h-[calc(100vh-8rem)] w-full overflow-hidden"
        href="/nyc"
        sameWindow
      >
        <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-8 text-center mo:max-w-xl">
          a project to map locations mentioned in local news articles in
          real-time.
        </h1>
        <div className="absolute left-1/2 top-1/2 flex h-[100vh] w-[100vw] -translate-x-1/2 -translate-y-1/2 items-center overflow-hidden">
          <Image
            className="h-full w-full text-sky-800 opacity-5 transition-all group-hover:opacity-10"
            src="/NYCSkeleton.svg"
            fill
            objectFit="cover"
            alt=""
          />
        </div>
        <CursorAnimation />
      </Link>
    </div>
  );
}
