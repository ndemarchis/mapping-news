"use client";

import { useEffect } from "react";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { ThemeProvider } from "@/components/shared/theme-provider";

function PostHogClientProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      person_profiles: "always",
      defaults: "2025-11-30",
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <PostHogClientProvider>{children}</PostHogClientProvider>
    </ThemeProvider>
  );
}
