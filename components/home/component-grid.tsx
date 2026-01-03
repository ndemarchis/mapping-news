"use client";

import { useState } from "react";
import { useDemoModal } from "@/components/home/demo-modal";
import Popover from "@/components/shared/popover";
import Tooltip from "@/components/shared/tooltip";
import { ChevronDown } from "lucide-react";

export default function ComponentGrid() {
  const { DemoModal, setShowDemoModal } = useDemoModal();
  const [openPopover, setOpenPopover] = useState(false);
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      <DemoModal />
      <button
        onClick={() => setShowDemoModal(true)}
        className="border-subtle text-primary hover:border-strong active:bg-surface-muted flex w-36 items-center justify-center rounded-md border px-3 py-2 transition-all duration-75 focus:outline-none"
      >
        <p className="text-primary">Modal</p>
      </button>
      <Popover
        content={
          <div className="bg-surface-strong w-full rounded-md p-2 sm:w-40">
            <button className="hover:bg-surface-muted active:bg-surface-muted flex w-full items-center justify-start space-x-2 rounded-md p-2 text-left text-sm transition-all duration-75">
              Item 1
            </button>
            <button className="hover:bg-surface-muted active:bg-surface-muted flex w-full items-center justify-start space-x-2 rounded-md p-2 text-left text-sm transition-all duration-75">
              Item 2
            </button>
            <button className="hover:bg-surface-muted active:bg-surface-muted flex w-full items-center justify-start space-x-2 rounded-md p-2 text-left text-sm transition-all duration-75">
              Item 3
            </button>
          </div>
        }
        openPopover={openPopover}
        setOpenPopover={setOpenPopover}
      >
        <button
          onClick={() => setOpenPopover(!openPopover)}
          className="border-subtle text-primary hover:border-strong active:bg-surface-muted flex w-36 items-center justify-between rounded-md border px-4 py-2 transition-all duration-75 focus:outline-none"
        >
          <p className="text-primary">Popover</p>
          <ChevronDown
            className={`text-primary h-4 w-4 transition-all ${
              openPopover ? "rotate-180" : ""
            }`}
          />
        </button>
      </Popover>
      <Tooltip content="Precedent is an opinionated collection of components, hooks, and utilities for your Next.js project.">
        <div className="border-subtle text-primary hover:border-strong active:bg-surface-muted flex w-36 cursor-default items-center justify-center rounded-md border px-3 py-2 transition-all duration-75 focus:outline-none">
          <p className="text-primary">Tooltip</p>
        </div>
      </Tooltip>
    </div>
  );
}
