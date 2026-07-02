/**
 * Lightweight client-only analytics for the prototype — no backend, so
 * events are appended to localStorage and read back by /stats. Capped at
 * MAX_EVENTS so a long demo session can't grow it unbounded.
 */

export type ScreenTimeEvent = {
  type: "screen_time";
  path: string;
  durationMs: number;
  timestamp: number;
};

export type ClickEvent = {
  type: "click";
  path: string;
  /** 0–1, relative to viewport width */
  xNorm: number;
  /** Absolute pixel position within the full scrollable page (scrollY + clientY) */
  yPage: number;
  rageClick: boolean;
  timestamp: number;
};

export type ScrollDepthEvent = {
  type: "scroll_depth";
  path: string;
  maxDepthPercent: number;
  timestamp: number;
};

export type AnalyticsEvent = ScreenTimeEvent | ClickEvent | ScrollDepthEvent;

const STORAGE_KEY = "nakoplen_analytics_v1";
const MAX_EVENTS = 4000;

function readEvents(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

function writeEvents(events: AnalyticsEvent[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {
    // storage full/unavailable — drop silently, this is best-effort telemetry
  }
}

export function logEvent(event: AnalyticsEvent) {
  const events = readEvents();
  events.push(event);
  writeEvents(events);
}

export function getEvents(): AnalyticsEvent[] {
  return readEvents();
}

export function clearEvents() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
