"use client";

import { XIcon } from "@phosphor-icons/react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

type ProductDetailDialogProps = {
  titleId: string;
  productPath: string;
  children: React.ReactNode;
};

export function ProductDetailDialog({
  titleId,
  productPath,
  children,
}: ProductDetailDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isClosingRef = useRef(false);
  const previousOverflowRef = useRef<string | null>(null);

  const lockBackground = useCallback(() => {
    if (previousOverflowRef.current !== null) {
      return;
    }

    previousOverflowRef.current = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
  }, []);

  const unlockBackground = useCallback(() => {
    if (previousOverflowRef.current === null) {
      return;
    }

    document.documentElement.style.overflow = previousOverflowRef.current;
    previousOverflowRef.current = null;
  }, []);

  const closeDialog = useCallback(() => {
    if (isClosingRef.current) {
      return;
    }

    isClosingRef.current = true;
    dialogRef.current?.close();
    unlockBackground();
    router.back();
  }, [router, unlockBackground]);

  const syncDialogToPath = useCallback((nextPathname: string) => {
    const dialog = dialogRef.current;

    if (nextPathname === productPath) {
      isClosingRef.current = false;
      lockBackground();
      if (dialog && !dialog.open) {
        dialog.showModal();
      }
      return;
    }

    if (dialog?.open) {
      dialog.close();
    }
    unlockBackground();
  }, [lockBackground, productPath, unlockBackground]);

  useEffect(() => {
    syncDialogToPath(pathname);
  }, [pathname, syncDialogToPath]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const syncDialogToHistory = () => {
      syncDialogToPath(window.location.pathname);
    };

    window.addEventListener("popstate", syncDialogToHistory);

    return () => {
      window.removeEventListener("popstate", syncDialogToHistory);
      unlockBackground();
      if (dialog?.open) {
        dialog.close();
      }
    };
  }, [syncDialogToPath, unlockBackground]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        closeDialog();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          closeDialog();
        }
      }}
      className="m-auto max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-6xl overflow-visible border-0 bg-transparent p-0 text-ink backdrop:bg-ink/55 backdrop:backdrop-blur-[2px] sm:max-h-[calc(100dvh-3rem)] sm:w-[calc(100%-3rem)]"
    >
      <div className="relative max-h-[calc(100dvh-1rem)] overflow-hidden rounded-[1.25rem] bg-paper shadow-[0_28px_90px_rgba(37,35,33,0.35)] sm:max-h-[calc(100dvh-3rem)]">
        <button
          type="button"
          aria-label="Close product details"
          onClick={closeDialog}
          className="absolute top-3 right-3 z-20 inline-flex size-11 items-center justify-center rounded-full border border-line bg-white/95 text-ink shadow-sm transition hover:bg-white sm:top-4 sm:right-4"
        >
          <XIcon size={20} aria-hidden="true" />
        </button>
        {children}
      </div>
    </dialog>
  );
}
