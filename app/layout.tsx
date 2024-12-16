import "./globals.css";
import cx from "classnames";
import { sfPro, inter } from "./fonts";
import Footer from "@/components/layout/footer";
import { Suspense } from "react";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import Navbar from "@/components/layout/navbar";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata = {
  title: "mapping-news",
  description: "a news-mapping project.",
  metadataBase: new URL("https://mapping.news"),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={cx(sfPro.variable, inter.variable)}>
          <div className="fixed h-full w-full bg-gradient-to-br from-indigo-50 via-white to-cyan-100" />
          <Suspense fallback="...">
            <Navbar />
          </Suspense>
          <main className="flex min-h-[calc(100vh-6rem)] w-full flex-col items-center justify-center py-32">
            {children}
          </main>
          <Footer />
          <VercelAnalytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
