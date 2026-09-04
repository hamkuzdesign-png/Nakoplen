"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { getParticipantId, getScenario, logEvent, setScenario, startShowcaseJourney, type Scenario, type ShowcasePrototype } from "@/lib/analytics";
import { useSearchParams } from "next/navigation";

const RAGE_CLICK_WINDOW_MS = 600;
const RAGE_CLICK_RADIUS_PX = 24;

/** The 4 entry points on the "/" scenario picker. Landing on one of these
 *  tags every event from here on as belonging to that scenario, until the
 *  participant either lands on another entry point or goes back to "/". */
const SCENARIO_ENTRY_ROUTES: Record<string, Scenario> = {
  "/home-anon": "anon",
  "/home-uprid": "uprid",
  "/home-identified": "identified",
  "/home": "has_products",
  "/showcase-test": "showcase_test",
};

function resolveScenario(pathname: string, prevScenario: Scenario): Scenario {
  if (pathname === "/") return null; // back at the picker — no active scenario
  if (pathname in SCENARIO_ENTRY_ROUTES) return SCENARIO_ENTRY_ROUTES[pathname];
  return prevScenario; // shared screens (catalog, transfer, ...) keep whatever scenario led here
}

/** No button/link/role/cursor:pointer anywhere up the tree — the user
 *  tapped something that visibly gave no affordance to be tappable. */
function isInteractive(target: EventTarget | null): boolean {
  let node = target as Element | null;
  let depth = 0;
  while (node && depth < 6) {
    const tag = node.tagName?.toLowerCase();
    if (tag && ["button", "a", "input", "select", "textarea", "label"].includes(tag)) return true;
    const role = node.getAttribute?.("role");
    if (role && ["button", "link", "checkbox", "radio", "tab", "switch"].includes(role)) return true;
    if (node instanceof HTMLElement && window.getComputedStyle(node).cursor === "pointer") return true;
    node = node.parentElement;
    depth++;
  }
  return false;
}

/**
 * Mounted once in the root layout. Tracks, per participant (pid) and
 * scenario, how long a screen stayed on-screen, where clicks land
 * (normalized for the heatmap in /stats), rapid same-spot re-clicks
 * ("rage clicks"), clicks with no interactive affordance ("dead clicks"),
 * and max scroll depth. All best-effort client telemetry — lib/analytics.ts.
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // One route can render different product variants depending on the task.
  // Preserve the relevant query parameters so analytics does not merge a
  // regular dark product screen with its showcase-promo counterpart.
  const query = searchParams.toString();
  const analyticsPath = `${pathname}${query ? `?${query}` : ""}`;
  const pidRef = useRef<string>("");
  const scenarioRef = useRef<Scenario>(null);
  const enteredAtRef = useRef(Date.now());
  const prevPathRef = useRef(analyticsPath);
  const maxScrollRef = useRef(0);
  const lastClickRef = useRef<{ x: number; y: number; t: number } | null>(null);
  // Time the tab spent hidden (backgrounded/screen locked) while on the
  // current path — subtracted from the raw elapsed time so a phone left
  // locked for hours doesn't get logged as hours of screen time.
  const hiddenMsRef = useRef(0);
  const hiddenSinceRef = useRef<number | null>(null);
  const flushedPathRef = useRef<string | null>(null);

  function currentHiddenMs() {
    return hiddenMsRef.current + (hiddenSinceRef.current !== null ? Date.now() - hiddenSinceRef.current : 0);
  }

  // One-time setup: resolve pid + whatever scenario was already active this session.
  useEffect(() => {
    pidRef.current = getParticipantId();
    scenarioRef.current = resolveScenario(pathname, getScenario());
    setScenario(scenarioRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The four supplied task links all enter here. Starting the timer at this
  // point means it includes every detour until the participant reaches success.
  useEffect(() => {
    if (pathname !== "/showcase-test") return;
    const prototype = searchParams.get("prototype");
    if (["cashbox", "deposit", "metals", "mts"].includes(prototype ?? "")) {
      startShowcaseJourney(prototype as ShowcasePrototype);
    }
  }, [pathname, searchParams]);

  function flushScreenTime(path: string, enteredAt: number) {
    // pagehide and beforeunload can both fire for one navigation. Do not
    // append the same final screen twice, otherwise active time and heatmaps
    // are inflated for every prototype.
    if (flushedPathRef.current === path) return;
    flushedPathRef.current = path;
    const base = { pid: pidRef.current, scenario: scenarioRef.current, timestamp: Date.now() };
    const durationMs = Math.max(0, Date.now() - enteredAt - currentHiddenMs());
    logEvent({ type: "screen_time", path, durationMs, ...base });
    if (maxScrollRef.current > 0) {
      logEvent({ type: "scroll_depth", path, maxDepthPercent: maxScrollRef.current, ...base });
    }
  }

  // Screen time — flush the PREVIOUS path's duration whenever the route changes,
  // and re-resolve the active scenario for the new path.
  useEffect(() => {
    if (prevPathRef.current !== analyticsPath) {
      flushScreenTime(prevPathRef.current, enteredAtRef.current);
      scenarioRef.current = resolveScenario(pathname, scenarioRef.current);
      setScenario(scenarioRef.current);
      enteredAtRef.current = Date.now();
      prevPathRef.current = analyticsPath;
      flushedPathRef.current = null;
      maxScrollRef.current = 0;
      lastClickRef.current = null;
      hiddenMsRef.current = 0;
      hiddenSinceRef.current = document.hidden ? Date.now() : null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyticsPath, pathname]);

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

  // Backgrounded tab / locked screen doesn't stop JS execution from firing
  // route changes later, so track hidden spans directly and subtract them.
  useEffect(() => {
    function onVisibility() {
      if (document.hidden) {
        hiddenSinceRef.current = Date.now();
      } else if (hiddenSinceRef.current !== null) {
        hiddenMsRef.current += Date.now() - hiddenSinceRef.current;
        hiddenSinceRef.current = null;
      }
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
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
        deadClick: !isInteractive(e.target),
        pid: pidRef.current,
        scenario: scenarioRef.current,
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
