"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

const STORAGE_KEY = "mn-deprecation-seen";
const READ_MORE_URL = "https://nickdemarchis.com/posts/mapping-news-pause";

export default function DeprecationDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setOpen(true);
      localStorage.setItem(STORAGE_KEY, "1");
    }
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-8 shadow-[var(--shadow-elevated)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <Dialog.Title className="font-display text-xl font-semibold text-[var(--color-text)]">
            this site is indefinitely unmaintained.
          </Dialog.Title>
          <Dialog.Description className="mt-3 text-sm leading-relaxed text-[var(--color-text-subtle)]">
            mapping.news was a realtime news-mapping project that ran from 2024–2025.
            data feeds may run sporadically or not at all.
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg px-4 py-2 text-sm text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors"
            >
              dismiss
            </button>
            <a
              href={READ_MORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-accent-strong)] transition-colors"
            >
              read more
              <ExternalLink size={13} />
            </a>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
