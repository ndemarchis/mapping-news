"use client";

import { Metadata } from "next";
import "ol/ol.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export const metadata: Metadata = {
  title: "live news articles in nyc",
};
