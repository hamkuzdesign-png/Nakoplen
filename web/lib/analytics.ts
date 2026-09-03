/**
 * Lightweight analytics for the prototype. Every event is appended to this
 * browser's localStorage (instant, always works) and — when
 * NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are set at build
 * time — also sent to a shared Supabase table, so /stats can show every
 * participant's session, not just this device's. See web/supabase/schema.sql
 * for the table + RLS policies, and README-analytics.md for setup.
 * Without those env vars (e.g. plain local dev) it silently falls back to
 * localStorage-only, exactly like before.
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const REMOTE_TABLE = "events";

export function isRemoteConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

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

/** Flat row shape matching web/supabase/schema.sql's `events` table. */
function toRow(e: AnalyticsEvent) {
  return {
    pid: e.pid,
    scenario: e.scenario,
    ts: e.timestamp,
    type: e.type,
    path: e.type === "click" || e.type === "screen_time" || e.type === "scroll_depth" ? e.path : null,
    duration_ms: e.type === "screen_time" ? e.durationMs : null,
    x_norm: e.type === "click" ? e.xNorm : null,
    y_page: e.type === "click" ? e.yPage : null,
    rage_click: e.type === "click" ? e.rageClick : null,
    dead_click: e.type === "click" ? e.deadClick : null,
    max_depth_percent: e.type === "scroll_depth" ? e.maxDepthPercent : null,
  };
}

function fromRow(r: Record<string, unknown>): AnalyticsEvent | null {
  const base = { pid: r.pid as string, scenario: (r.scenario as Scenario) ?? null, timestamp: r.ts as number };
  switch (r.type) {
    case "screen_time":
      return { ...base, type: "screen_time", path: r.path as string, durationMs: r.duration_ms as number };
    case "click":
      return {
        ...base,
        type: "click",
        path: r.path as string,
        xNorm: r.x_norm as number,
        yPage: r.y_page as number,
        rageClick: !!r.rage_click,
        deadClick: !!r.dead_click,
      };
    case "scroll_depth":
      return { ...base, type: "scroll_depth", path: r.path as string, maxDepthPercent: r.max_depth_percent as number };
    default:
      return null;
  }
}

/** Fire-and-forget insert into the shared Supabase table. `keepalive` lets
 *  this survive the page-hide/beforeunload flush that fires on tab close. */
function pushRemote(event: AnalyticsEvent) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
  fetch(`${SUPABASE_URL}/rest/v1/${REMOTE_TABLE}`, {
    method: "POST",
    keepalive: true,
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(toRow(event)),
  }).catch(() => {
    // best-effort telemetry — dropped events don't block the UI
  });
}

export function logEvent(event: AnalyticsEvent) {
  const events = readEvents();
  events.push(event);
  writeEvents(events);
  pushRemote(event);
}

/** PostgREST caps any single response at 1000 rows by default. With ordering
 *  by ts.asc, an unpaginated request silently returns only the *oldest* page
 *  forever, hiding every event after it — this is what made every real
 *  participant after the first ~1000 rows invisible on /stats. Page through
 *  with Range headers until a short page tells us we've reached the end. */
const REMOTE_PAGE_SIZE = 1000;

/** Every participant's events when Supabase is configured, falling back to
 *  this browser's localStorage otherwise (or if the fetch fails). */
export async function fetchAllEvents(): Promise<AnalyticsEvent[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return readEvents();
  try {
    const rows: Record<string, unknown>[] = [];
    for (let offset = 0; ; offset += REMOTE_PAGE_SIZE) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${REMOTE_TABLE}?select=*&order=ts.asc`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Range: `${offset}-${offset + REMOTE_PAGE_SIZE - 1}`,
        },
      });
      if (!res.ok && res.status !== 206) throw new Error(`Supabase fetch failed: ${res.status}`);
      const page = (await res.json()) as Record<string, unknown>[];
      rows.push(...page);
      if (page.length < REMOTE_PAGE_SIZE) break;
    }
    return rows.map(fromRow).filter((e): e is AnalyticsEvent => e !== null);
  } catch {
    return readEvents();
  }
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
