"use client";

import Link from "@/components/shared/link";
import { getPlaceIdRelativeHref } from "./getPlaceIdRelativeHref";

export default function Error() {
  return (
    <div className="z-10 flex align-middle">
      something went wrong here...{" "}
      <Link href={getPlaceIdRelativeHref()}>go to the homepage</Link> or click a
      different location to try again
    </div>
  );
}
