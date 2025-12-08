import "./globals.css";
import cx from "classnames";
import type { Metadata } from "next";
import { sfPro, inter } from "./fonts";
import Footer from "@/components/layout/footer";
import { Suspense } from "react";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import Navbar from "@/components/layout/navbar";
import { PostHogProvider } from "./providers";

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
        <PostHogProvider>
          <div className="fixed h-full w-full bg-gradient-to-br from-indigo-50 via-white to-cyan-100" />
          <Navbar />
          <main>{children}</main>
          <Footer />
          <VercelAnalytics />
        </PostHogProvider>
      </body>
    </html>
  );
}
