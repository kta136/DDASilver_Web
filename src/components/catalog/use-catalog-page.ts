"use client";

import { useEffect, useState } from "react";
import type { CatalogPage } from "@/types/catalog";

/** Keep the last page visible while changing filters; abort obsolete requests. */
export function useCatalogPage(
  initialPage: CatalogPage | undefined,
  requestKey: string,
) {
  const [state, setState] = useState({
    key: requestKey,
    result: initialPage,
    error: false,
  });
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!initialPage || (state.key === requestKey && !state.error)) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/catalog?${requestKey}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Catalog request failed");
        const result: CatalogPage = await response.json();
        if (!controller.signal.aborted)
          setState({ key: requestKey, result, error: false });
      } catch {
        if (!controller.signal.aborted)
          setState((previous) => ({
            ...previous,
            key: requestKey,
            error: true,
          }));
      }
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
    // State changes complete this request. Only a new URL or explicit retry
    // should start another one, including after a failed response.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPage, requestKey, retry]);

  return {
    result: state.result,
    loading: Boolean(initialPage && state.key !== requestKey),
    error: state.key === requestKey && state.error,
    retry: () => setRetry((value) => value + 1),
  };
}
