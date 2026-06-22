"use client";

import { useEffect } from "react";

/** Registers /sw.js once the page has loaded. Renders nothing. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Silently ignore — PWA install just won't be available offline.
      });
    });
  }, []);

  return null;
}
