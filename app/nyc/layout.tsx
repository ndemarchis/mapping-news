"use client";

import React from "react";
import MapComponent from "./MapComponent";
import Tutorial from "./Tutorial";
import About from "./About";
import "maplibre-gl/dist/maplibre-gl.css";

export default function NYCLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="grid h-full w-full grid-cols-1 pt-16 mo:grid-cols-[3fr_2fr] md:pb-8">
        <MapComponent />
      </div>
      <div className="items-left flex w-full p-4 mo:hidden md:max-w-xl">
        <div className="z-10 w-full rounded-xl border border-gray-200 bg-white p-4 shadow-md *:*:z-10">
          <Tutorial />
        </div>
      </div>
      <About />
      {children}
    </>
  );
}
