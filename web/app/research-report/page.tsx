"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { fetchAllEvents, type AnalyticsEvent, type ClickEvent, type JourneyEvent, type ScreenTimeEvent, type ShowcasePrototype } from "@/lib/analytics";

const prototypes: { id: ShowcasePrototype; label: string; color: string }[] = [
  { id: "cashbox", label: "Кешбокс", color: "#786cff" },
  { id: "deposit", label: "Вклад Плюс", color: "#00a58a" },
  { id: "metals", label: "Металлы", color: "#df9a00" },
  { id: "mts", label: "МТС Накопления", color: "#e84d6c" },
];

const screenNames: Record<string, string> = {
  "/showcase-test": "Главная", "/new-catalog": "Каталог", "/products": "Все продукты", "/showcase-success": "Успех",
};

type Session = {
  pid: string; prototype: ShowcasePrototype; startedAt: number; successAt?: number;
  shortest: boolean; activeMs: number; path: string[];
};

function dayKey(timestamp: number) {
  const date = new Date(timestamp);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}
function duration(ms?: number) {
  if (ms === undefined) return "—";
  const seconds = Math.round(ms / 1000);
  return seconds >= 60 ? `${Math.floor(seconds / 60)} мин ${seconds % 60} с` : `${seconds} с`;
}
function dateLabel(timestamp: number) {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(timestamp);
}
function participantName(pid: string, pids: string[]) {
  return `Респондент ${pids.indexOf(pid) + 1}`;
}
function labelPath(path: string) {
  if (screenNames[path]) return screenNames[path];
  const product = path.match(/^\/product\/([a-z]\d)$/);
  return product ? `Карточка продукта (${product[1].toUpperCase()})` : path;
}

function sessionsFrom(events: AnalyticsEvent[]): Session[] {
  const starts = events.filter((e): e is JourneyEvent => e.type === "journey" && e.name === "start")
    .sort((a, b) => a.timestamp - b.timestamp);
  return starts.map((start) => {
    const milestones = events.filter((e): e is JourneyEvent => e.type === "journey" && e.pid === start.pid && e.prototype === start.prototype && e.timestamp >= start.timestamp)
      .sort((a, b) => a.timestamp - b.timestamp);
    const success = milestones.find((e) => e.name === "success");
    const screenEvents = events.filter((e): e is ScreenTimeEvent => e.type === "screen_time" && e.pid === start.pid && e.scenario === "showcase_test" && e.timestamp >= start.timestamp && (!success || e.timestamp <= success.timestamp))
      .sort((a, b) => a.timestamp - b.timestamp);
    return {
      pid: start.pid, prototype: start.prototype, startedAt: start.timestamp, successAt: success?.timestamp,
      shortest: !!success?.shortestPath,
      activeMs: screenEvents.reduce((sum, e) => sum + Math.min(e.durationMs, 10 * 60_000), 0),
      path: [...new Set(screenEvents.map((e) => labelPath(e.path)))],
    };
  });
}

function Metric({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return <div style={styles.metric}><div style={styles.metricValue}>{value}</div><div style={styles.metricLabel}>{label}</div>{note && <div style={styles.metricNote}>{note}</div>}</div>;
}

function Heatmap({ clicks, title }: { clicks: ClickEvent[]; title: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const width = 760;
  const height = 380;
  useEffect(() => {
    const node = canvas.current;
    const ctx = node?.getContext("2d");
    if (!node || !ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f2f4f7";
    ctx.fillRect(0, 0, width, height);
    for (const click of clicks) {
      const x = click.xNorm * width;
      // A unified view has no single page height. Cap the vertical coordinate
      // at 1.5 viewport heights, retaining the useful top-screen hotspots.
      const y = Math.min(height - 10, click.yPage / 1200 * height);
      const gradient = ctx.createRadialGradient(x, y, 1, x, y, 42);
      gradient.addColorStop(0, click.deadClick ? "rgba(236,147,0,.58)" : "rgba(232,77,108,.48)");
      gradient.addColorStop(.45, click.deadClick ? "rgba(236,147,0,.18)" : "rgba(232,77,108,.16)");
      gradient.addColorStop(1, "rgba(232,77,108,0)");
      ctx.fillStyle = gradient;
      ctx.beginPath(); ctx.arc(x, y, 42, 0, Math.PI * 2); ctx.fill();
    }
  }, [clicks]);
  return <div style={styles.heatmapWrap}>
    <div style={styles.heatmapTop}><strong>{title}</strong><span>{clicks.length} кликов</span></div>
    {clicks.length ? <canvas ref={canvas} width={width} height={height} style={styles.heatmapCanvas} /> : <div style={styles.heatmapEmpty}>Кликов в этом срезе пока нет</div>}
    <p style={styles.heatmapHint}>Интенсивность показывает плотность нажатий. Оранжевым отмечены клики вне интерактивных элементов.</p>
  </div>;
}

export default function ResearchReportPage() {
  const [events, setEvents] = useState<AnalyticsEvent[] | null>(null);
  const [selected, setSelected] = useState<ShowcasePrototype | "all">("all");
  const [dayOrder, setDayOrder] = useState<"new" | "old">("new");
  const [heatmapScope, setHeatmapScope] = useState<ShowcasePrototype | "all">("all");
  const [heatmapPid, setHeatmapPid] = useState<string | "all">("all");
  useEffect(() => { fetchAllEvents().then(setEvents); }, []);
  const sessions = useMemo(() => sessionsFrom(events ?? []), [events]);
  const pids = useMemo(() => [...new Set(sessions.map((s) => s.pid))], [sessions]);
  const visible = selected === "all" ? sessions : sessions.filter((s) => s.prototype === selected);
  const completed = visible.filter((s) => s.successAt);
  const avgSuccess = completed.length ? completed.reduce((sum, s) => sum + (s.successAt! - s.startedAt), 0) / completed.length : undefined;
  const avgSession = visible.length ? visible.reduce((sum, s) => sum + s.activeMs, 0) / visible.length : undefined;
  const byDay = useMemo(() => {
    const map = new Map<number, Session[]>();
    visible.forEach((s) => map.set(dayKey(s.startedAt), [...(map.get(dayKey(s.startedAt)) ?? []), s]));
    return [...map.entries()].sort(([a], [b]) => dayOrder === "new" ? b - a : a - b);
  }, [visible, dayOrder]);
  const heatmapClicks = useMemo(() => (events ?? []).filter((e): e is ClickEvent => e.type === "click" && e.scenario === "showcase_test" && (heatmapPid === "all" || e.pid === heatmapPid)), [events, heatmapPid])
    .filter((click) => {
      if (heatmapScope === "all") return true;
      const session = sessions.find((s) => s.pid === click.pid && s.prototype === heatmapScope && click.timestamp >= s.startedAt && (!s.successAt || click.timestamp <= s.successAt));
      return !!session;
    });

  return <main style={styles.page}>
    <div style={styles.topbar}><div><p style={styles.eyebrow}>ИССЛЕДОВАНИЕ ПРОТОТИПОВ</p><h1 style={styles.title}>Отчёт по пользовательским тестам</h1><p style={styles.subtitle}>Данные обновляются из анонимных событий участников</p></div><Link href="/" style={styles.back}>К прототипам →</Link></div>
    {events === null ? <p style={styles.muted}>Загружаем данные…</p> : <>
      <div style={styles.filters}>{[{ id: "all" as const, label: "Все прототипы", color: "#1d2023" }, ...prototypes].map((p) => <button key={p.id} onClick={() => setSelected(p.id)} style={{ ...styles.filter, ...(selected === p.id ? { background: p.color, color: "#fff", borderColor: p.color } : {}) }}>{p.label}</button>)}</div>
      <section style={styles.metricGrid}>
        <Metric value={visible.length} label="сессий" />
        <Metric value={completed.length} label="успешных прохождений" />
        <Metric value={completed.length ? `${Math.round(completed.length / visible.length * 100)}%` : "—"} label="конверсия в успех" />
        <Metric value={duration(avgSuccess)} label="ср. время до успеха" />
        <Metric value={duration(avgSession)} label="ср. активное время сессии" />
        <Metric value={completed.length ? `${Math.round(completed.filter((s) => s.shortest).length / completed.length * 100)}%` : "—"} label="прошли кратчайшим путём" note="Без переходов к другим продуктам" />
      </section>
      <section style={styles.card}><div style={styles.sectionTop}><h2 style={styles.heading}>Динамика по дням</h2><button onClick={() => setDayOrder(dayOrder === "new" ? "old" : "new")} style={styles.sortButton}>{dayOrder === "new" ? "Сначала новые ↓" : "Сначала старые ↑"}</button></div>{byDay.length ? <div style={styles.dayGrid}>{byDay.map(([day, list]) => <div key={day} style={styles.day}><strong style={styles.dayCount}>{list.length}</strong><span style={styles.dayLabel}>{dateLabel(day)}</span><span style={styles.daySuccess}>{list.filter((s) => s.successAt).length} успехов</span></div>)}</div> : <p style={styles.muted}>Пока нет начатых тестов.</p>}</section>
      <section style={styles.card}><div style={styles.sectionTop}><div><h2 style={styles.heading}>Тепловые карты</h2><p style={styles.description}>Все срезы доступны здесь: общий, по сценарию и по респонденту.</p></div></div>
        <div style={styles.heatmapControls}><div style={styles.controlGroup}><span style={styles.controlLabel}>Сценарий</span>{[{ id: "all" as const, label: "Общий" }, ...prototypes.map((p) => ({ id: p.id, label: p.label }))].map((item) => <button key={item.id} onClick={() => setHeatmapScope(item.id)} style={{ ...styles.smallFilter, ...(heatmapScope === item.id ? styles.smallFilterActive : {}) }}>{item.label}</button>)}</div><div style={styles.controlGroup}><span style={styles.controlLabel}>Респондент</span><button onClick={() => setHeatmapPid("all")} style={{ ...styles.smallFilter, ...(heatmapPid === "all" ? styles.smallFilterActive : {}) }}>Все</button>{pids.map((pid) => <button key={pid} onClick={() => setHeatmapPid(pid)} style={{ ...styles.smallFilter, ...(heatmapPid === pid ? styles.smallFilterActive : {}) }}>{participantName(pid, pids)}</button>)}</div></div>
        <Heatmap clicks={heatmapClicks} title={`${heatmapScope === "all" ? "Общая карта" : prototypes.find((p) => p.id === heatmapScope)?.label}${heatmapPid === "all" ? "" : ` · ${participantName(heatmapPid, pids)}`}`} />
      </section>
      <section style={styles.card}><div style={styles.sectionTop}><div><h2 style={styles.heading}>Респонденты и путь</h2><p style={styles.description}>Время сессии — суммарное активное время на экранах. До успеха — от входа в задание до нажатия целевого действия.</p></div><button onClick={() => setDayOrder(dayOrder === "new" ? "old" : "new")} style={styles.sortButton}>По дате: {dayOrder === "new" ? "новые" : "старые"}</button></div>
        <div style={styles.tableWrap}><table style={styles.table}><thead><tr><th>Респондент</th><th>Прототип</th><th>Дата</th><th>Сессия</th><th>До успеха</th><th>Маршрут</th></tr></thead><tbody>{[...visible].sort((a, b) => dayOrder === "new" ? b.startedAt - a.startedAt : a.startedAt - b.startedAt).map((s) => <tr key={`${s.pid}-${s.prototype}-${s.startedAt}`}><td>{participantName(s.pid, pids)}</td><td><span style={{ ...styles.productBadge, background: prototypes.find((p) => p.id === s.prototype)?.color }}>{prototypes.find((p) => p.id === s.prototype)?.label}</span></td><td>{dateLabel(s.startedAt)}</td><td>{duration(s.activeMs)}</td><td>{s.successAt ? <>{duration(s.successAt - s.startedAt)}{s.shortest && <span style={styles.shortest}>Кратчайший</span>}</> : "Не завершил"}</td><td style={styles.path}>{s.path.length ? s.path.join(" → ") : "Путь ещё не записан"}</td></tr>)}</tbody></table></div>
      </section>
      <p style={styles.footer}>Тепловые карты строятся только по данным пользовательских тестов и не используют прежнюю страницу аналитики.</p>
    </>}
  </main>;
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "#f5f6f8", color: "#1d2023", padding: "44px clamp(20px, 5vw, 80px) 64px", fontFamily: "'MTS Compact', Arial, sans-serif", boxSizing: "border-box" },
  topbar: { maxWidth: 1360, margin: "0 auto 30px", display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-start" }, eyebrow: { fontSize: 12, letterSpacing: ".08em", fontWeight: 700, color: "#777f89", margin: 0 }, title: { fontFamily: "'MTS Wide', Arial, sans-serif", fontSize: "clamp(28px, 4vw, 42px)", margin: "8px 0", lineHeight: 1.1 }, subtitle: { margin: 0, color: "#6b737c", fontSize: 16 }, back: { color: "#5b50db", textDecoration: "none", fontWeight: 600, whiteSpace: "nowrap" }, filters: { maxWidth: 1360, margin: "0 auto 24px", display: "flex", flexWrap: "wrap", gap: 8 }, filter: { background: "#fff", border: "1px solid #dde0e5", borderRadius: 999, padding: "9px 14px", color: "#454b52", cursor: "pointer", font: "inherit", fontWeight: 600 }, metricGrid: { maxWidth: 1360, margin: "0 auto 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: 12 }, metric: { background: "#fff", borderRadius: 16, padding: "18px", minHeight: 100, boxSizing: "border-box" }, metricValue: { fontFamily: "'MTS Wide', Arial, sans-serif", fontSize: 25, lineHeight: 1.1 }, metricLabel: { color: "#69717a", fontSize: 14, marginTop: 8 }, metricNote: { color: "#9299a1", fontSize: 12, marginTop: 4 }, card: { maxWidth: 1360, margin: "0 auto 20px", background: "#fff", borderRadius: 20, padding: "24px", boxSizing: "border-box" }, heading: { fontFamily: "'MTS Wide', Arial, sans-serif", fontSize: 21, margin: "0 0 8px" }, description: { margin: 0, color: "#727981", fontSize: 14, maxWidth: 660 }, dayGrid: { display: "flex", alignItems: "stretch", gap: 10, overflowX: "auto", paddingTop: 12 }, day: { minWidth: 105, background: "#f3f4f7", borderRadius: 12, padding: "14px", display: "flex", flexDirection: "column", gap: 5 }, dayCount: { fontSize: 25, fontFamily: "'MTS Wide', Arial, sans-serif" }, dayLabel: { fontSize: 14 }, daySuccess: { color: "#777f89", fontSize: 12 }, sectionTop: { display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 16 }, sortButton: { background: "#f1f2f5", border: "none", borderRadius: 9, padding: "8px 11px", color: "#454b52", cursor: "pointer", font: "inherit", fontSize: 13, whiteSpace: "nowrap" }, heatmapControls: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }, controlGroup: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 7 }, controlLabel: { color: "#727981", fontSize: 13, marginRight: 4 }, smallFilter: { padding: "6px 9px", borderRadius: 8, border: "1px solid #dde0e5", background: "#fff", cursor: "pointer", font: "inherit", fontSize: 13, color: "#454b52" }, smallFilterActive: { background: "#1d2023", color: "#fff", borderColor: "#1d2023" }, heatmapWrap: { border: "1px solid #e1e4e8", borderRadius: 14, overflow: "hidden", background: "#f2f4f7" }, heatmapTop: { padding: "12px 14px", background: "#fff", display: "flex", justifyContent: "space-between", fontSize: 14 }, heatmapCanvas: { display: "block", width: "100%", height: "auto", maxHeight: 380 }, heatmapEmpty: { height: 220, display: "grid", placeItems: "center", color: "#727981", fontSize: 14 }, heatmapHint: { margin: 0, padding: "9px 14px", background: "#fff", color: "#727981", fontSize: 12 }, tableWrap: { overflowX: "auto" }, table: { width: "100%", borderCollapse: "collapse", minWidth: 950, fontSize: 14 }, productBadge: { display: "inline-block", padding: "5px 8px", color: "#fff", borderRadius: 7, fontWeight: 600, whiteSpace: "nowrap" }, path: { color: "#606873", minWidth: 250 }, shortest: { display: "block", color: "#138a76", fontSize: 12, marginTop: 3 }, muted: { maxWidth: 1360, margin: "30px auto", color: "#727981" }, footer: { maxWidth: 1360, margin: "0 auto", color: "#727981", fontSize: 13 },
};
