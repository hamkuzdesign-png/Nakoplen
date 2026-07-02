/**
 * Lightweight client-only analytics for the prototype — no backend, so
 * events are appended to localStorage and read back by /stats. Capped at
 * MAX_EVENTS so a long test session can't grow it unbounded.
 */

export type Scenario = "anon" | "uprid" | "identified" | "has_products" | null;

type BaseEvent = {
  /** Participant/session ID — see getParticipantId(). Lets 12-user test data be told apart. */
  pid: string;
  /** Which of the 4 scenario entry points ("/", "/home-anon", ...) this event happened under. */
  scenario: Scenario;
  timestamp: number;
};

export type ScreenTimeEvent = BaseEvent & {
  type: "screen_time";
  path: string;
  durationMs: number;
};

export type ClickEvent = BaseEvent & {
  type: "click";
  path: string;
  /** 0–1, relative to viewport width */
  xNorm: number;
  /** Absolute pixel position within the full scrollable page (scrollY + clientY) */
  yPage: number;
  rageClick: boolean;
  /** Click landed on an element with no interactive affordance (no button/link/cursor:pointer) */
  deadClick: boolean;
};

export type ScrollDepthEvent = BaseEvent & {
  type: "scroll_depth";
  path: string;
  maxDepthPercent: number;
};

export type AnalyticsEvent = ScreenTimeEvent | ClickEvent | ScrollDepthEvent;

const STORAGE_KEY = "nakoplen_analytics_v1";
const PID_KEY = "nakoplen_pid";
const SCENARIO_KEY = "nakoplen_scenario";
const MAX_EVENTS = 6000;

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

/**
 * One ID per participant, persisted across reloads/tab-closes so a whole
 * test session (however many times they open the tab) counts as one
 * person. A moderator can assign a readable ID up front via ?pid=p07 on
 * the link they send that participant — otherwise one is generated.
 */
export function getParticipantId(): string {
  if (typeof window === "undefined") return "server";
  try {
    const fromQuery = new URL(window.location.href).searchParams.get("pid");
    if (fromQuery) {
      window.localStorage.setItem(PID_KEY, fromQuery);
      return fromQuery;
    }
    const existing = window.localStorage.getItem(PID_KEY);
    if (existing) return existing;
    const generated = `p_${Date.now().toString(36).slice(-4)}${Math.random().toString(36).slice(2, 6)}`;
    window.localStorage.setItem(PID_KEY, generated);
    return generated;
  } catch {
    return "unknown";
  }
}

/** Clears the stored pid so the next getParticipantId() call mints a fresh
 *  one — use this between participants on a shared test device. Event
 *  history is untouched (it's how they stay told apart in /stats). */
export function startNewParticipant() {
  try {
    window.localStorage.removeItem(PID_KEY);
    window.sessionStorage.removeItem(SCENARIO_KEY);
  } catch {
    // ignore
  }
}

export function getScenario(): Scenario {
  if (typeof window === "undefined") return null;
  try {
    return (window.sessionStorage.getItem(SCENARIO_KEY) as Scenario) || null;
  } catch {
    return null;
  }
}

export function setScenario(scenario: Scenario) {
  try {
    if (scenario) window.sessionStorage.setItem(SCENARIO_KEY, scenario);
    else window.sessionStorage.removeItem(SCENARIO_KEY);
  } catch {
    // ignore
  }
}
