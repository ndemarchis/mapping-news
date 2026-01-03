"use client";

import { ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Drawer } from "vaul";
import useMediaQuery from "@/lib/hooks/use-media-query";

export default function Tooltip({
  children,
  content,
  fullWidth,
}: {
  children: ReactNode;
  content: ReactNode | string;
  fullWidth?: boolean;
}) {
  const { isMobile } = useMediaQuery();

  if (isMobile) {
    return (
      <Drawer.Root>
        <Drawer.Trigger
          className={`${fullWidth ? "w-full" : "inline-flex"} md:hidden`}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {children}
        </Drawer.Trigger>
        <Drawer.Overlay className="bg-surface-veil fixed inset-0 z-40 backdrop-blur" />
        <Drawer.Portal>
          <Drawer.Content className="border-subtle bg-surface-strong fixed bottom-0 left-0 right-0 z-50 mt-24 rounded-t-[10px] border-t">
            <div className="sticky top-0 z-20 flex w-full items-center justify-center rounded-t-[10px] bg-inherit">
              <div className="bg-surface-muted my-3 h-1 w-12 rounded-full" />
            </div>
            <div className="bg-surface-strong shadow-elevated flex min-h-[150px] w-full items-center justify-center overflow-hidden align-middle">
              {typeof content === "string" ? (
                <span className="text-primary block text-center text-sm">
                  {content}
                </span>
              ) : (
                content
              )}
            </div>
          </Drawer.Content>
          <Drawer.Overlay />
        </Drawer.Portal>
      </Drawer.Root>
    );
  }
  return (
    <TooltipPrimitive.Provider delayDuration={100}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger className="hidden md:inline-flex" asChild>
          {children}
        </TooltipPrimitive.Trigger>
        {/* 
            We don't use TooltipPrimitive.Portal here because for some reason it 
            prevents you from selecting the contents of a tooltip when used inside a modal 
        */}
        <TooltipPrimitive.Content
          sideOffset={8}
          side="top"
          className="border-subtle bg-surface-strong shadow-elevated z-[99] hidden animate-slide-up-fade items-center overflow-hidden rounded-md border md:block"
        >
          {typeof content === "string" ? (
            <div className="text-primary block max-w-xs px-4 py-2 text-center text-sm">
              {content}
            </div>
          ) : (
            content
          )}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
