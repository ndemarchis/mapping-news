import Link from "@/components/shared/link";
import Image from "next/image";
import { CursorAnimation } from "./CursorAnimation";

export default function Home() {
  return (
    <div className="z-10 flex h-full min-h-[calc(100vh-8rem)] w-full flex-col items-center justify-center gap-8 pt-16 *:z-10">
      <CursorAnimation />
      <Link
        className="group h-[calc(100vh-8rem)] w-full overflow-hidden"
        href="/nyc"
        prefetch={true}
        sameWindow
      >
        <div className="absolute left-1/2 top-1/2 flex h-[100vh] w-[100vw] -translate-x-1/2 -translate-y-1/2 items-center overflow-hidden">
          <Image
            className="z-10 h-full w-full text-sky-800 opacity-5 transition-all group-hover:opacity-10"
            src="/NYCSkeleton.svg"
            fill
            objectFit="cover"
            alt=""
          />
        </div>
        <div className="absolute left-1/2 top-1/2 flex w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-8 px-8 text-center mo:max-w-xl">
          <h1 className="z-50 rounded-lg p-8 transition-all hover:bg-white hover:bg-opacity-50">
            a project to map locations mentioned in local news articles in
            real-time.
          </h1>
          <span className="z-50 w-fit rounded-lg border border-gray-300 px-3 py-2 transition-all hover:bg-white hover:bg-opacity-50 focus:outline-none active:bg-gray-100 group-hover:opacity-100 mo:opacity-0">
            click anywhere to enter the site
          </span>
        </div>
      </Link>
    </div>
  );
}
