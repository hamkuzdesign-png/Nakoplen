"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { logEvent } from "@/lib/analytics";

const RAGE_CLICK_WINDOW_MS = 600;
const RAGE_CLICK_RADIUS_PX = 24;

/**
 * Mounted once in the root layout. Tracks, per route, how long a screen
 * stayed on-screen, where clicks land (normalized for the heatmap in
 * /stats), rapid same-spot re-clicks ("rage clicks" — a proxy for a user
 * expecting something to happen and it not happening), and max scroll
 * depth. All of it is best-effort client telemetry, see lib/analytics.ts.
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const enteredAtRef = useRef(Date.now());
  const prevPathRef = useRef(pathname);
  const maxScrollRef = useRef(0);
  const lastClickRef = useRef<{ x: number; y: number; t: number } | null>(null);

  function flushScreenTime(path: string, enteredAt: number) {
    logEvent({ type: "screen_time", path, durationMs: Date.now() - enteredAt, timestamp: Date.now() });
    if (maxScrollRef.current > 0) {
      logEvent({ type: "scroll_depth", path, maxDepthPercent: maxScrollRef.current, timestamp: Date.now() });
    }
  }

  // Screen time — flush the PREVIOUS path's duration whenever the route changes.
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      flushScreenTime(prevPathRef.current, enteredAtRef.current);
      enteredAtRef.current = Date.now();
      prevPathRef.current = pathname;
      maxScrollRef.current = 0;
      lastClickRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Flush on tab close too, or the last screen of a session never gets logged.
  useEffect(() => {
    function onHide() {
      flushScreenTime(prevPathRef.current, enteredAtRef.current);
    }
    window.addEventListener("pagehide", onHide);
    window.addEventListener("beforeunload", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("beforeunload", onHide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clicks — captured in the capture phase so it fires even if a handler
  // deeper in the tree calls stopPropagation.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const vw = window.innerWidth;
      const now = Date.now();
      const last = lastClickRef.current;
      const rageClick = !!(
        last &&
        now - last.t < RAGE_CLICK_WINDOW_MS &&
        Math.hypot(e.clientX - last.x, e.clientY - last.y) < RAGE_CLICK_RADIUS_PX
      );
      lastClickRef.current = { x: e.clientX, y: e.clientY, t: now };
      logEvent({
        type: "click",
        path: prevPathRef.current,
        xNorm: e.clientX / vw,
        yPage: e.clientY + window.scrollY,
        rageClick,
        timestamp: now,
      });
    }
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, []);

  // Scroll depth — tracks the deepest point reached on the current screen.
  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      if (scrollable <= 0) return;
      const pct = Math.min(100, Math.round((window.scrollY / scrollable) * 100));
      if (pct > maxScrollRef.current) maxScrollRef.current = pct;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
