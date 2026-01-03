"use client";

import { Dispatch, ReactNode, SetStateAction } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Drawer } from "vaul";
import useMediaQuery from "@/lib/hooks/use-media-query";

export default function Popover({
  children,
  content,
  align = "center",
  openPopover,
  setOpenPopover,
}: {
  children: ReactNode;
  content: ReactNode | string;
  align?: "center" | "start" | "end";
  openPopover: boolean;
  setOpenPopover: Dispatch<SetStateAction<boolean>>;
  mobileOnly?: boolean;
}) {
  const { isMobile } = useMediaQuery();

  if (isMobile) {
    return (
      <Drawer.Root open={openPopover} onOpenChange={setOpenPopover}>
        <div className="sm:hidden">{children}</div>
        <Drawer.Overlay className="bg-surface-veil fixed inset-0 z-40 backdrop-blur" />
        <Drawer.Portal>
          <Drawer.Content className="border-subtle bg-surface-strong fixed bottom-0 left-0 right-0 z-50 mt-24 rounded-t-[10px] border-t">
            <div className="sticky top-0 z-20 flex w-full items-center justify-center rounded-t-[10px] bg-inherit">
              <div className="bg-surface-muted my-3 h-1 w-12 rounded-full" />
            </div>
            <div className="bg-surface-strong shadow-elevated flex min-h-[150px] w-full items-center justify-center overflow-hidden pb-8 align-middle">
              {content}
            </div>
          </Drawer.Content>
          <Drawer.Overlay />
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <PopoverPrimitive.Root open={openPopover} onOpenChange={setOpenPopover}>
      <PopoverPrimitive.Trigger className="hidden sm:inline-flex" asChild>
        {children}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          sideOffset={8}
          align={align}
          className="border-subtle bg-surface-strong shadow-elevated z-50 hidden animate-slide-up-fade items-center rounded-md border sm:block"
        >
          {content}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
