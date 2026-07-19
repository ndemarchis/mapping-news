import "./globals.css";
import cx from "classnames";
import type { Metadata } from "next";
import { sfPro, inter } from "./fonts";
import Footer from "@/components/layout/footer";
import { Suspense } from "react";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import Navbar from "@/components/layout/navbar";
import { Providers } from "./providers";
import DeprecationDialog from "@/components/shared/deprecation-dialog";

export const metadata: Metadata = {
  title: "mapping.news",
  description: "a realtime news-mapping project",
  metadataBase: new URL("https://mapping.news"),
  openGraph: {
    title: "mapping.news",
    description: "a realtime news-mapping project",
    url: "https://mapping.news",
    siteName: "mapping.news",
    locale: "en-US",
    type: "website",
    images: [
      {
        url: "https://mapping.news/og-image.png",
        width: 1200,
        height: 630,
        alt: "mapping.news logo against a map backdrop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "mapping.news",
    description: "a news-mapping project",
    images: ["https://mapping.news/og-image.png"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cx(sfPro.variable, inter.variable)}>
        <Providers>
          <div
            aria-hidden
            className="bg-app-gradient pointer-events-none fixed h-full w-full"
          />
          <Navbar />
          <main>{children}</main>
          <Footer />
          <VercelAnalytics />
          <DeprecationDialog />
        </Providers>
      </body>
    </html>
  );
}
