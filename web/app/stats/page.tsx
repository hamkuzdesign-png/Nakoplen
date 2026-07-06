"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import {
  fetchAllEvents,
  startNewParticipant,
  type AnalyticsEvent,
  type ClickEvent,
  type Scenario,
} from "@/lib/analytics";

const S = {
  bgLower: "#000000",
  bgPrimary: "#1d2023",
  textPrimary: "#fafafa",
  textSecondary: "#969fa8",
  fieldBg: "rgba(98,108,119,0.25)",
  fieldBorder: "rgba(127,140,153,0.35)",
  purple: "#8f8fff",
  red: "#ff5c5c",
  orange: "#ffb020",
};

const SCENARIO_LABELS: Record<string, string> = {
  anon: "Аноним",
  uprid: "УПРИД",
  identified: "Идентифицированный",
  has_products: "Имеет продукты",
  none: "Без сценария (меню)",
};

function scenarioLabel(scenario: Scenario) {
  return SCENARIO_LABELS[scenario ?? "none"];
}

/** Product id → short display name, shared between /product/[id] and
 *  /my-product/[id] labels (see PATH_LABELS below). */
const PRODUCT_NAMES: Record<string, string> = {
  a1: "МТС Счёт (ежедневный)",
  b1: "МТС Счёт (ежедневный)",
  a2: "Кешбокс",
  b2: "Кешбокс",
  a3: "МТС Счёт (минимальный)",
  a4: "Бонусы за накопления",
  d1: "Вклад Плюс",
  d2: "Вклад МТС Деньги",
  d3: "Вклад МТС Максимум",
  m1: "МТС Накопления",
  m2: "Цифровые активы",
  m3: "Металлы",
};

/** Static path → human-readable Russian screen name. Dynamic segments
 *  (/product/:id, /my-product/:id) are resolved separately in screenLabel(). */
const PATH_LABELS: Record<string, string> = {
  "/": "Выбор сценария",
  "/home": "Главная — Имеет продукты",
  "/home-anon": "Главная — Аноним",
  "/home-uprid": "Главная — УПРИД",
  "/home-identified": "Главная — Идентифицированный",
  "/catalog": "Каталог накоплений",
  "/products": "Каталог продуктов",
  "/my-savings": "Мои накопления",
  "/savings": "Накопления (обзор)",
  "/goal/new": "Создание цели",
  "/open-cashbox": "Открытие «Кешбокса»",
  "/card": "Оформление карты",
  "/topup": "Пополнение счёта",
  "/transfer": "Перевод / пополнение",
  "/identity": "Подтверждение личности",
  "/analytics": "Аналитика по накоплениям (экран приложения)",
  "/stats": "Аналитика прототипа (эта страница)",
};

/** Human-readable label for any recorded path, including dynamic product routes. */
function screenLabel(path: string): string {
  if (PATH_LABELS[path]) return PATH_LABELS[path];
  const product = path.match(/^\/product\/([a-z0-9]+)$/i);
  if (product) return `Товар — ${PRODUCT_NAMES[product[1]] ?? product[1]}`;
  const myProduct = path.match(/^\/my-product\/([a-z0-9]+)$/i);
  if (myProduct) return `Мой продукт — ${PRODUCT_NAMES[myProduct[1]] ?? myProduct[1]}`;
  return path;
}

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms} мс`;
  const totalSec = Math.round(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return min > 0 ? `${min} мин ${sec} с` : `${sec} с`;
}

/** "5 мин назад" / "3 ч назад" / "2 дн назад" — used to show who was here
 *  most recently now that the participant list is sorted that way. */
function formatRelativeTime(ts: number): string {
  const diffSec = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (diffSec < 60) return "только что";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin} мин назад`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour} ч назад`;
  const diffDay = Math.round(diffHour / 24);
  return `${diffDay} дн назад`;
}

type ScreenStats = {
  path: string;
  visits: number;
  totalMs: number;
  avgMs: number;
  clicks: number;
  rageClicks: number;
  deadClicks: number;
  maxScrollPercent: number;
};

function aggregateByScreen(events: AnalyticsEvent[]): ScreenStats[] {
  const byPath = new Map<string, ScreenStats>();
  function get(path: string) {
    let s = byPath.get(path);
    if (!s) {
      s = { path, visits: 0, totalMs: 0, avgMs: 0, clicks: 0, rageClicks: 0, deadClicks: 0, maxScrollPercent: 0 };
      byPath.set(path, s);
    }
    return s;
  }
  for (const e of events) {
    if (e.type === "screen_time") {
      const s = get(e.path);
      s.visits += 1;
      s.totalMs += e.durationMs;
    } else if (e.type === "click") {
      const s = get(e.path);
      s.clicks += 1;
      if (e.rageClick) s.rageClicks += 1;
      if (e.deadClick) s.deadClicks += 1;
    } else if (e.type === "scroll_depth") {
      const s = get(e.path);
      s.maxScrollPercent = Math.max(s.maxScrollPercent, e.maxDepthPercent);
    }
  }
  for (const s of byPath.values()) s.avgMs = s.visits > 0 ? s.totalMs / s.visits : 0;
  return [...byPath.values()].sort((a, b) => b.totalMs - a.totalMs);
}

/** Maps each raw pid to a friendly "Участник N", numbered by first
 *  appearance in the (chronologically-ordered) event list — stable across
 *  reloads since it's derived purely from the data, not from a sort order
 *  that might change with new events. Events logged before pid tracking
 *  existed share one synthetic pid and keep their own label untouched. */
function buildParticipantLabels(events: AnalyticsEvent[]): Map<string, string> {
  const labels = new Map<string, string>();
  let n = 0;
  for (const e of events) {
    const pid = e.pid || "без ID (старые данные)";
    if (labels.has(pid)) continue;
    if (pid === "без ID (старые данные)") {
      labels.set(pid, pid);
    } else {
      n += 1;
      labels.set(pid, `Участник ${n}`);
    }
  }
  return labels;
}

/** Screenshot filename for a given screen path — see web/public/images/screenshots/
 *  and the capture script used to generate them. Falls back to a plain dark
 *  canvas (see Heatmap) when no screenshot exists for a path. */
function screenshotForPath(path: string): string {
  const slug = path === "/" ? "root" : path.replace(/^\//, "").replace(/\//g, "-");
  return asset(`/images/screenshots/${slug}.png`);
}

/** One-off cutoff (2026-07-06 10:00 MSK) separating the dev/test noise
 *  accumulated before that point from real participant sessions — computed
 *  at render time only, nothing is tagged or removed in Supabase. */
const OLD_PARTICIPANT_CUTOFF_MS = 1783321200000;

type ParticipantStats = {
  pid: string;
  scenarios: Scenario[];
  sessionMs: number;
  screens: number;
  clicks: number;
  rageClicks: number;
  deadClicks: number;
  lastSeenTs: number;
};

/** Sorted by most-recently-active first, so a moderator glancing at the list
 *  sees whoever just walked through the prototype at the top — not whoever
 *  happened to spend the longest session. */
function aggregateByParticipant(events: AnalyticsEvent[]): ParticipantStats[] {
  const byPid = new Map<string, { s: ParticipantStats; scenarioSet: Set<Scenario> }>();
  function get(pid: string) {
    let entry = byPid.get(pid);
    if (!entry) {
      entry = { s: { pid, scenarios: [], sessionMs: 0, screens: 0, clicks: 0, rageClicks: 0, deadClicks: 0, lastSeenTs: 0 }, scenarioSet: new Set() };
      byPid.set(pid, entry);
    }
    return entry;
  }
  for (const e of events) {
    // Events logged before pid tracking existed have no pid — group them
    // under one label instead of a blank row.
    const { s, scenarioSet } = get(e.pid || "без ID (старые данные)");
    scenarioSet.add(e.scenario);
    s.lastSeenTs = Math.max(s.lastSeenTs, e.timestamp);
    if (e.type === "screen_time") {
      s.sessionMs += e.durationMs;
      s.screens += 1;
    } else if (e.type === "click") {
      s.clicks += 1;
      if (e.rageClick) s.rageClicks += 1;
      if (e.deadClick) s.deadClicks += 1;
    }
  }
  return [...byPid.values()]
    .map(({ s, scenarioSet }) => ({ ...s, scenarios: [...scenarioSet] }))
    .sort((a, b) => b.lastSeenTs - a.lastSeenTs);
}

type ScenarioStats = {
  scenario: Scenario;
  participants: number;
  visits: number;
  totalMs: number;
  avgMs: number;
  clicks: number;
  rageClicks: number;
  deadClicks: number;
};

function aggregateByScenario(events: AnalyticsEvent[]): ScenarioStats[] {
  const byScenario = new Map<string, { s: ScenarioStats; pids: Set<string> }>();
  function get(scenario: Scenario) {
    const key = scenario ?? "none";
    let entry = byScenario.get(key);
    if (!entry) {
      entry = { s: { scenario, participants: 0, visits: 0, totalMs: 0, avgMs: 0, clicks: 0, rageClicks: 0, deadClicks: 0 }, pids: new Set() };
      byScenario.set(key, entry);
    }
    return entry;
  }
  for (const e of events) {
    const { s, pids } = get(e.scenario);
    pids.add(e.pid);
    if (e.type === "screen_time") {
      s.visits += 1;
      s.totalMs += e.durationMs;
    } else if (e.type === "click") {
      s.clicks += 1;
      if (e.rageClick) s.rageClicks += 1;
      if (e.deadClick) s.deadClicks += 1;
    }
  }
  return [...byScenario.values()]
    .map(({ s, pids }) => ({ ...s, participants: pids.size, avgMs: s.visits > 0 ? s.totalMs / s.visits : 0 }))
    .sort((a, b) => b.totalMs - a.totalMs);
}

/** Additive-blend radial dots over a real screenshot of the screen (see
 *  web/public/images/screenshots/) — classic click-heatmap look, no external
 *  libs. Dead clicks render in orange so they stand out from normal clicks.
 *  Falls back to a plain dark canvas when there's no screenshot for this path. */
function Heatmap({ clicks, path }: { clicks: ClickEvent[]; path: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [screenshotOk, setScreenshotOk] = useState(true);
  const width = 375;
  const height = Math.max(700, Math.min(4000, Math.max(0, ...clicks.map((c) => c.yPage)) + 100));

  useEffect(() => {
    setScreenshotOk(true);
  }, [path]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    if (!screenshotOk) {
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      ctx.fillRect(0, 0, width, height);
    }

    ctx.globalCompositeOperation = "lighter";
    for (const c of clicks) {
      const x = c.xNorm * width;
      const y = c.yPage;
      const r = 26;
      const color = c.deadClick ? "255,176,32" : "255,80,80";
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(${color},0.55)`);
      grad.addColorStop(1, `rgba(${color},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  }, [clicks, width, height, screenshotOk]);

  if (clicks.length === 0) {
    return <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, color: S.textSecondary, padding: "20px 0" }}>Кликов на этом экране пока нет</p>;
  }

  return (
    <>
      <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: S.textSecondary }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: S.red, display: "inline-block" }} /> обычный клик
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: S.textSecondary }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: S.orange, display: "inline-block" }} /> мёртвый клик
        </span>
      </div>
      <div style={{ width, maxWidth: "100%", overflow: "hidden", borderRadius: 16, border: `1px solid ${S.fieldBorder}`, position: "relative", background: S.bgPrimary }}>
        {screenshotOk && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={screenshotForPath(path)}
            alt=""
            onError={() => setScreenshotOk(false)}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", display: "block" }}
          />
        )}
        <canvas ref={canvasRef} width={width} height={height} style={{ display: "block", width: "100%", height: "auto", position: "relative" }} />
      </div>
    </>
  );
}

function StatChip({ label, color }: { label: string; color?: string }) {
  return <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: color ?? S.textSecondary }}>{label}</span>;
}

const TABS = [
  { key: "screens", label: "Экраны" },
  { key: "participants", label: "Участники" },
  { key: "scenarios", label: "Сценарии" },
] as const;
type Tab = (typeof TABS)[number]["key"];

/** Drill-down inside the "Участники" tab: pick a participant → pick one of
 *  their scenarios → see that scenario's screens for that person → pick a
 *  screen for its heatmap. Each level's stats are the same aggregate
 *  functions used elsewhere, just run on a progressively narrower slice
 *  of events (all of theirs → theirs in that scenario → theirs on that screen). */
type Drill =
  | { level: "list" }
  | { level: "scenarios"; pid: string }
  | { level: "screens"; pid: string; scenario: Scenario }
  | { level: "heatmap"; pid: string; scenario: Scenario; path: string };

function ParticipantDrilldown({ allEvents, participantStats, labels }: { allEvents: AnalyticsEvent[]; participantStats: ParticipantStats[]; labels: Map<string, string> }) {
  const [drill, setDrill] = useState<Drill>({ level: "list" });

  // Hooks must run unconditionally on every render, so this is computed
  // before any of the early returns below (even though "list" doesn't need it).
  const drillPid = drill.level !== "list" ? drill.pid : null;
  const pidEvents = useMemoized(allEvents, (e) => e.pid === drillPid);
  const drillLabel = drillPid ? labels.get(drillPid) ?? drillPid : "";

  if (drill.level === "list") {
    const newParticipants = participantStats.filter((p) => p.lastSeenTs >= OLD_PARTICIPANT_CUTOFF_MS);
    const oldParticipants = participantStats.filter((p) => p.lastSeenTs < OLD_PARTICIPANT_CUTOFF_MS);
    const renderRow = (p: ParticipantStats) => (
      <button
        key={p.pid}
        onClick={() => setDrill({ level: "scenarios", pid: p.pid })}
        style={{ textAlign: "left", background: S.fieldBg, border: `1px solid ${S.fieldBorder}`, borderRadius: 16, padding: "12px 14px", cursor: "pointer" }}
      >
        <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 15, color: S.textPrimary, marginBottom: 4 }}>{labels.get(p.pid) ?? p.pid} →</p>
        <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: S.textSecondary, marginBottom: 4 }}>
          {p.scenarios.map(scenarioLabel).join(", ")}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
          <StatChip label={formatRelativeTime(p.lastSeenTs)} color={S.purple} />
          <StatChip label={`сессия ${formatDuration(p.sessionMs)}`} />
          <StatChip label={`${p.screens} экранов`} />
          <StatChip label={`${p.clicks} кликов`} />
          {p.deadClicks > 0 && <StatChip label={`${p.deadClicks} мёртвых`} color={S.orange} />}
          {p.rageClicks > 0 && <StatChip label={`${p.rageClicks} rage-click`} color={S.red} />}
        </div>
      </button>
    );
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 13, color: S.textSecondary, textTransform: "uppercase" }}>
            Новые участники ({newParticipants.length})
          </p>
          {newParticipants.length === 0 ? (
            <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 13, color: S.textSecondary }}>Пока никого</p>
          ) : (
            newParticipants.map(renderRow)
          )}
        </div>
        {oldParticipants.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 13, color: S.textSecondary, textTransform: "uppercase" }}>
              Старые участники, до 10:00 ({oldParticipants.length})
            </p>
            {oldParticipants.map(renderRow)}
          </div>
        )}
      </div>
    );
  }

  if (drill.level === "scenarios") {
    const scenarios = aggregateByScenario(pidEvents);
    return (
      <div>
        <Breadcrumb onBack={() => setDrill({ level: "list" })} label="← Участники" />
        <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 16, color: S.textPrimary, margin: "4px 0 12px" }}>{drillLabel}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {scenarios.map((s) => (
            <button
              key={scenarioLabel(s.scenario)}
              onClick={() => setDrill({ level: "screens", pid: drill.pid, scenario: s.scenario })}
              style={{ textAlign: "left", background: S.fieldBg, border: `1px solid ${S.fieldBorder}`, borderRadius: 16, padding: "12px 14px", cursor: "pointer" }}
            >
              <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 15, color: S.textPrimary, marginBottom: 4 }}>{scenarioLabel(s.scenario)} →</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
                <StatChip label={`${s.visits} посещ.`} />
                <StatChip label={`всего ${formatDuration(s.totalMs)}`} />
                <StatChip label={`${s.clicks} кликов`} />
                {s.deadClicks > 0 && <StatChip label={`${s.deadClicks} мёртвых`} color={S.orange} />}
                {s.rageClicks > 0 && <StatChip label={`${s.rageClicks} rage-click`} color={S.red} />}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const scenarioEvents = pidEvents.filter((e) => e.scenario === drill.scenario);

  if (drill.level === "screens") {
    const screens = aggregateByScreen(scenarioEvents);
    return (
      <div>
        <Breadcrumb onBack={() => setDrill({ level: "scenarios", pid: drill.pid })} label={`← ${drillLabel}`} />
        <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 16, color: S.textPrimary, margin: "4px 0 12px" }}>
          {drillLabel} · {scenarioLabel(drill.scenario)}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {screens.map((s) => (
            <button
              key={s.path}
              onClick={() => setDrill({ level: "heatmap", pid: drill.pid, scenario: drill.scenario, path: s.path })}
              style={{ textAlign: "left", background: S.fieldBg, border: `1px solid ${S.fieldBorder}`, borderRadius: 16, padding: "12px 14px", cursor: "pointer" }}
            >
              <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 15, color: S.textPrimary, marginBottom: 2 }}>{screenLabel(s.path)} →</p>
              <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: S.textSecondary, marginBottom: 4 }}>{s.path}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
                <StatChip label={`${s.visits} посещ.`} />
                <StatChip label={`ср. ${formatDuration(s.avgMs)}`} />
                <StatChip label={`${s.clicks} кликов`} />
                {s.deadClicks > 0 && <StatChip label={`${s.deadClicks} мёртвых`} color={S.orange} />}
                {s.rageClicks > 0 && <StatChip label={`${s.rageClicks} rage-click`} color={S.red} />}
                {s.maxScrollPercent > 0 && <StatChip label={`скролл до ${s.maxScrollPercent}%`} />}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // drill.level === "heatmap"
  const clicks = scenarioEvents.filter((e): e is ClickEvent => e.type === "click" && e.path === drill.path);
  return (
    <div>
      <Breadcrumb onBack={() => setDrill({ level: "screens", pid: drill.pid, scenario: drill.scenario })} label={`← ${scenarioLabel(drill.scenario)}`} />
      <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 16, color: S.textPrimary, margin: "4px 0 12px" }}>
        {drillLabel} · {scenarioLabel(drill.scenario)} · {screenLabel(drill.path)}
      </p>
      <Heatmap clicks={clicks} path={drill.path} />
    </div>
  );
}

function Breadcrumb({ onBack, label }: { onBack: () => void; label: string }) {
  return (
    <button onClick={onBack} style={{ background: "none", border: "none", color: S.purple, fontFamily: "'MTS Compact', sans-serif", fontSize: 13, cursor: "pointer", padding: 0 }}>
      {label}
    </button>
  );
}

/** Tiny helper so each drill level's filter reads as a one-liner above. */
function useMemoized(events: AnalyticsEvent[], predicate: (e: AnalyticsEvent) => boolean) {
  return useMemo(() => events.filter(predicate), [events, predicate]);
}

export default function StatsPage() {
  const [events, setEvents] = useState<AnalyticsEvent[] | null>(null);
  const [tab, setTab] = useState<Tab>("screens");
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  useEffect(() => {
    fetchAllEvents().then(setEvents);
  }, []);

  const allEvents = events ?? [];

  const screenStats = useMemo(() => aggregateByScreen(allEvents), [allEvents]);
  const participantStats = useMemo(() => aggregateByParticipant(allEvents), [allEvents]);
  const participantLabels = useMemo(() => buildParticipantLabels(allEvents), [allEvents]);
  const scenarioStats = useMemo(() => aggregateByScenario(allEvents), [allEvents]);
  const totalDeadClicks = participantStats.reduce((sum, p) => sum + p.deadClicks, 0);
  const totalRageClicks = participantStats.reduce((sum, p) => sum + p.rageClicks, 0);

  const activePath = selectedPath ?? screenStats[0]?.path ?? null;
  const activeClicks = useMemo(
    () => allEvents.filter((e): e is ClickEvent => e.type === "click" && e.path === activePath),
    [allEvents, activePath]
  );

  function handleNewParticipant() {
    startNewParticipant();
    window.location.reload();
  }

  return (
    <div className="phone-width page-enter" style={{ minHeight: "100svh", background: S.bgLower, padding: "44px 20px 40px", boxSizing: "border-box" }}>
      <Link href="/" style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, color: S.purple, textDecoration: "none" }}>← Сценарии</Link>
      <p style={{ fontFamily: "'MTS Wide', sans-serif", fontWeight: 500, fontSize: 24, color: S.textPrimary, margin: "8px 0 20px" }}>Аналитика прототипа</p>

      <button
        onClick={handleNewParticipant}
        style={{ width: "100%", height: 36, background: "none", border: "none", color: S.textSecondary, fontFamily: "'MTS Compact', sans-serif", fontSize: 12, cursor: "pointer", marginBottom: 16 }}
      >
        Передаёте устройство следующему участнику? → Начать новый ID участника
      </button>

      {events === null ? (
        <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, color: S.textSecondary }}>Загрузка…</p>
      ) : participantStats.length === 0 ? (
        <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, color: S.textSecondary }}>
          Данных пока нет — походите по прототипу и вернитесь сюда.
        </p>
      ) : (
        <>
          {(totalDeadClicks > 0 || totalRageClicks > 0) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
              {totalDeadClicks > 0 && (
                <div style={{ background: "rgba(255,176,32,0.12)", border: "1px solid rgba(255,176,32,0.3)", borderRadius: 12, padding: "10px 12px" }}>
                  <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 13, color: S.orange }}>
                    {totalDeadClicks} мёртвых кликов — тапы мимо интерактивных элементов
                  </p>
                </div>
              )}
              {totalRageClicks > 0 && (
                <div style={{ background: "rgba(255,92,92,0.12)", border: "1px solid rgba(255,92,92,0.3)", borderRadius: 12, padding: "10px 12px" }}>
                  <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 13, color: S.red }}>
                    {totalRageClicks} rage-кликов — быстрые повторные тапы в одно место
                  </p>
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 4, marginBottom: 16, background: S.fieldBg, borderRadius: 14, padding: 4 }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  flex: 1,
                  height: 34,
                  background: tab === t.key ? S.purple : "transparent",
                  border: "none",
                  borderRadius: 10,
                  color: tab === t.key ? "#fff" : S.textSecondary,
                  fontFamily: "'MTS Compact', sans-serif",
                  fontWeight: 500,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "screens" && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                {screenStats.map((s) => (
                  <button
                    key={s.path}
                    onClick={() => setSelectedPath(s.path)}
                    style={{
                      textAlign: "left",
                      background: activePath === s.path ? "rgba(143,143,255,0.15)" : S.fieldBg,
                      border: `1px solid ${activePath === s.path ? S.purple : S.fieldBorder}`,
                      borderRadius: 16,
                      padding: "12px 14px",
                      cursor: "pointer",
                    }}
                  >
                    <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 15, color: S.textPrimary, marginBottom: 2 }}>{screenLabel(s.path)}</p>
                    <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: S.textSecondary, marginBottom: 4 }}>{s.path}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
                      <StatChip label={`${s.visits} посещ.`} />
                      <StatChip label={`ср. ${formatDuration(s.avgMs)}`} />
                      <StatChip label={`${s.clicks} кликов`} />
                      {s.deadClicks > 0 && <StatChip label={`${s.deadClicks} мёртвых`} color={S.orange} />}
                      {s.rageClicks > 0 && <StatChip label={`${s.rageClicks} rage-click`} color={S.red} />}
                      {s.maxScrollPercent > 0 && <StatChip label={`скролл до ${s.maxScrollPercent}%`} />}
                    </div>
                  </button>
                ))}
              </div>

              {activePath && (
                <div>
                  <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 14, color: S.textPrimary, marginBottom: 8 }}>
                    Тепловая карта кликов — {screenLabel(activePath)}
                  </p>
                  <Heatmap clicks={activeClicks} path={activePath} />
                </div>
              )}
            </>
          )}

          {tab === "participants" && <ParticipantDrilldown allEvents={allEvents} participantStats={participantStats} labels={participantLabels} />}

          {tab === "scenarios" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {scenarioStats.map((s) => (
                <div key={scenarioLabel(s.scenario)} style={{ background: S.fieldBg, border: `1px solid ${S.fieldBorder}`, borderRadius: 16, padding: "12px 14px" }}>
                  <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 15, color: S.textPrimary, marginBottom: 4 }}>{scenarioLabel(s.scenario)}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
                    <StatChip label={`${s.participants} участников`} />
                    <StatChip label={`${s.visits} посещ.`} />
                    <StatChip label={`ср. ${formatDuration(s.avgMs)}`} />
                    <StatChip label={`всего ${formatDuration(s.totalMs)}`} />
                    <StatChip label={`${s.clicks} кликов`} />
                    {s.deadClicks > 0 && <StatChip label={`${s.deadClicks} мёртвых`} color={S.orange} />}
                    {s.rageClicks > 0 && <StatChip label={`${s.rageClicks} rage-click`} color={S.red} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
