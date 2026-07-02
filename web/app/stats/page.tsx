"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  clearEvents,
  getEvents,
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

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms} мс`;
  const totalSec = Math.round(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return min > 0 ? `${min} мин ${sec} с` : `${sec} с`;
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

type ParticipantStats = {
  pid: string;
  scenarios: Scenario[];
  sessionMs: number;
  screens: number;
  clicks: number;
  rageClicks: number;
  deadClicks: number;
};

function aggregateByParticipant(events: AnalyticsEvent[]): ParticipantStats[] {
  const byPid = new Map<string, { s: ParticipantStats; scenarioSet: Set<Scenario> }>();
  function get(pid: string) {
    let entry = byPid.get(pid);
    if (!entry) {
      entry = { s: { pid, scenarios: [], sessionMs: 0, screens: 0, clicks: 0, rageClicks: 0, deadClicks: 0 }, scenarioSet: new Set() };
      byPid.set(pid, entry);
    }
    return entry;
  }
  for (const e of events) {
    // Events logged before pid tracking existed have no pid — group them
    // under one label instead of a blank row.
    const { s, scenarioSet } = get(e.pid || "без ID (старые данные)");
    scenarioSet.add(e.scenario);
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
    .sort((a, b) => b.sessionMs - a.sessionMs);
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

/** Additive-blend radial dots — classic click-heatmap look, no external libs.
 *  Dead clicks render in orange so they stand out from normal clicks. */
function Heatmap({ clicks }: { clicks: ClickEvent[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const width = 375;
  const height = Math.max(700, Math.min(4000, Math.max(0, ...clicks.map((c) => c.yPage)) + 100));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.fillRect(0, 0, width, height);

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
  }, [clicks, width, height]);

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
      <div style={{ width, maxWidth: "100%", overflow: "hidden", borderRadius: 16, border: `1px solid ${S.fieldBorder}` }}>
        <canvas ref={canvasRef} width={width} height={height} style={{ display: "block", width: "100%", height: "auto" }} />
      </div>
    </>
  );
}

const TABS = [
  { key: "screens", label: "Экраны" },
  { key: "participants", label: "Участники" },
  { key: "scenarios", label: "Сценарии" },
] as const;
type Tab = (typeof TABS)[number]["key"];

export default function StatsPage() {
  const [events, setEvents] = useState<AnalyticsEvent[] | null>(null);
  const [tab, setTab] = useState<Tab>("screens");
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [pidFilter, setPidFilter] = useState<string | null>(null);

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  const allEvents = events ?? [];
  const filteredEvents = useMemo(
    () => (pidFilter ? allEvents.filter((e) => e.pid === pidFilter) : allEvents),
    [allEvents, pidFilter]
  );

  const screenStats = useMemo(() => aggregateByScreen(filteredEvents), [filteredEvents]);
  const participantStats = useMemo(() => aggregateByParticipant(allEvents), [allEvents]);
  const scenarioStats = useMemo(() => aggregateByScenario(allEvents), [allEvents]);
  const totalDeadClicks = participantStats.reduce((sum, p) => sum + p.deadClicks, 0);
  const totalRageClicks = participantStats.reduce((sum, p) => sum + p.rageClicks, 0);

  const activePath = selectedPath ?? screenStats[0]?.path ?? null;
  const activeClicks = useMemo(
    () => filteredEvents.filter((e): e is ClickEvent => e.type === "click" && e.path === activePath),
    [filteredEvents, activePath]
  );

  function handleClear() {
    clearEvents();
    setEvents([]);
    setSelectedPath(null);
    setPidFilter(null);
  }

  function handleNewParticipant() {
    startNewParticipant();
    window.location.reload();
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(allEvents, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nakoplen-analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="phone-width page-enter" style={{ minHeight: "100svh", background: S.bgLower, padding: "44px 20px 40px", boxSizing: "border-box" }}>
      <Link href="/" style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, color: S.purple, textDecoration: "none" }}>← Сценарии</Link>
      <p style={{ fontFamily: "'MTS Wide', sans-serif", fontWeight: 500, fontSize: 24, color: S.textPrimary, margin: "8px 0 4px" }}>Аналитика прототипа</p>
      <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, color: S.textSecondary, margin: "0 0 20px" }}>
        Время на экране, клики, тепловая карта. Копится в localStorage этого браузера.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button onClick={handleExport} style={{ flex: 1, height: 40, background: S.fieldBg, border: `1px solid ${S.fieldBorder}`, borderRadius: 12, color: S.textPrimary, fontFamily: "'MTS Compact', sans-serif", fontSize: 13, cursor: "pointer" }}>
          Экспорт JSON
        </button>
        <button onClick={handleClear} style={{ flex: 1, height: 40, background: S.fieldBg, border: `1px solid ${S.fieldBorder}`, borderRadius: 12, color: S.red, fontFamily: "'MTS Compact', sans-serif", fontSize: 13, cursor: "pointer" }}>
          Очистить всё
        </button>
      </div>
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

          {pidFilter && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(143,143,255,0.12)", border: `1px solid ${S.purple}`, borderRadius: 12, padding: "8px 12px", marginBottom: 16 }}>
              <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 13, color: S.textPrimary }}>Фильтр: {pidFilter}</span>
              <button onClick={() => setPidFilter(null)} style={{ background: "none", border: "none", color: S.purple, fontFamily: "'MTS Compact', sans-serif", fontSize: 13, cursor: "pointer" }}>Сбросить</button>
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
                    <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 15, color: S.textPrimary, marginBottom: 4 }}>{s.path}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
                      <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: S.textSecondary }}>{s.visits} посещ.</span>
                      <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: S.textSecondary }}>ср. {formatDuration(s.avgMs)}</span>
                      <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: S.textSecondary }}>{s.clicks} кликов</span>
                      {s.deadClicks > 0 && <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: S.orange }}>{s.deadClicks} мёртвых</span>}
                      {s.rageClicks > 0 && <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: S.red }}>{s.rageClicks} rage-click</span>}
                      {s.maxScrollPercent > 0 && <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: S.textSecondary }}>скролл до {s.maxScrollPercent}%</span>}
                    </div>
                  </button>
                ))}
              </div>

              {activePath && (
                <div>
                  <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 14, color: S.textPrimary, marginBottom: 8 }}>
                    Тепловая карта кликов — {activePath}
                  </p>
                  <Heatmap clicks={activeClicks} />
                </div>
              )}
            </>
          )}

          {tab === "participants" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {participantStats.map((p) => (
                <div key={p.pid} style={{ background: S.fieldBg, border: `1px solid ${S.fieldBorder}`, borderRadius: 16, padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 15, color: S.textPrimary }}>{p.pid}</p>
                    <button
                      onClick={() => { setPidFilter(p.pid); setTab("screens"); setSelectedPath(null); }}
                      style={{ background: "none", border: "none", color: S.purple, fontFamily: "'MTS Compact', sans-serif", fontSize: 12, cursor: "pointer" }}
                    >
                      экраны →
                    </button>
                  </div>
                  <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: S.textSecondary, marginBottom: 4 }}>
                    {p.scenarios.map(scenarioLabel).join(", ")}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
                    <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: S.textSecondary }}>сессия {formatDuration(p.sessionMs)}</span>
                    <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: S.textSecondary }}>{p.screens} экранов</span>
                    <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: S.textSecondary }}>{p.clicks} кликов</span>
                    {p.deadClicks > 0 && <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: S.orange }}>{p.deadClicks} мёртвых</span>}
                    {p.rageClicks > 0 && <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: S.red }}>{p.rageClicks} rage-click</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "scenarios" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {scenarioStats.map((s) => (
                <div key={scenarioLabel(s.scenario)} style={{ background: S.fieldBg, border: `1px solid ${S.fieldBorder}`, borderRadius: 16, padding: "12px 14px" }}>
                  <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 15, color: S.textPrimary, marginBottom: 4 }}>{scenarioLabel(s.scenario)}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
                    <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: S.textSecondary }}>{s.participants} участников</span>
                    <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: S.textSecondary }}>{s.visits} посещ.</span>
                    <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: S.textSecondary }}>ср. {formatDuration(s.avgMs)}</span>
                    <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: S.textSecondary }}>всего {formatDuration(s.totalMs)}</span>
                    <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: S.textSecondary }}>{s.clicks} кликов</span>
                    {s.deadClicks > 0 && <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: S.orange }}>{s.deadClicks} мёртвых</span>}
                    {s.rageClicks > 0 && <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: S.red }}>{s.rageClicks} rage-click</span>}
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
