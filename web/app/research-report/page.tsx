"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { fetchAllEvents, type AnalyticsEvent, type ClickEvent, type JourneyEvent, type ScreenTimeEvent, type ShowcasePrototype } from "@/lib/analytics";
import { asset } from "@/lib/asset";

const prototypes: { id: ShowcasePrototype; label: string; color: string }[] = [
  { id: "cashbox", label: "Кешбокс", color: "#786cff" },
  { id: "deposit", label: "Вклад Плюс", color: "#00a58a" },
  { id: "metals", label: "Металлы", color: "#df9a00" },
  { id: "mts", label: "МТС Накопления", color: "#e84d6c" },
];

const screenNames: Record<string, string> = {
  "/showcase-test": "Старт задания — главная", "/new-catalog": "Каталог накоплений", "/products": "Все продукты", "/showcase-success": "Задание выполнено",
  "/home-anon": "Главная — анонимный пользователь", "/home-identified": "Главная — клиент банка", "/my-savings": "Мои накопления",
  "/open-cashbox": "Открытие Кешбокса", "/transfer": "Перевод", "/topup": "Пополнение", "/identity": "Подтверждение личности", "/goal/new": "Создание цели", "/analytics": "Аналитика",
  "/product/a1": "МТС Счёт — ежедневный остаток", "/product/a2": "Кешбокс", "/product/a3": "МТС Счёт — минимальный остаток", "/product/a4": "Бонусы за накопления",
  "/product/b1": "МТС Счёт — ежедневный остаток", "/product/b2": "Кешбокс", "/product/d1": "Вклад Плюс", "/product/d2": "Вклад МТС Деньги", "/product/d3": "Вклад МТС Максимум",
  "/product/m1": "МТС Накопления", "/product/m2": "Цифровые активы", "/product/m3": "Металлы",
};
const screenScreenshots: Record<string, { src: string; height: number }> = {
  "/showcase-test": { src: "/images/screenshots/home-full.png", height: 812 },
  "/new-catalog": { src: "/images/screenshots/catalog.png", height: 2601 },
  "/products": { src: "/images/screenshots/products.png", height: 812 },
  "/showcase-success": { src: "/images/screenshots/root.png", height: 812 },
  "/home-anon": { src: "/images/screenshots/home-anon.png", height: 812 }, "/home-identified": { src: "/images/screenshots/home-identified.png", height: 812 },
  "/my-savings": { src: "/images/screenshots/my-savings.png", height: 1120 }, "/open-cashbox": { src: "/images/screenshots/open-cashbox.png", height: 812 },
  "/transfer": { src: "/images/screenshots/transfer.png", height: 813 }, "/topup": { src: "/images/screenshots/topup.png", height: 812 }, "/identity": { src: "/images/screenshots/identity.png", height: 812 },
  "/goal/new": { src: "/images/screenshots/goal-new.png", height: 813 }, "/analytics": { src: "/images/screenshots/analytics.png", height: 812 },
  "/product/a1": { src: "/images/screenshots/product-a1.png", height: 1101 }, "/product/a2": { src: "/images/screenshots/product-a2.png", height: 1077 },
  "/product/a3": { src: "/images/screenshots/product-a3.png", height: 1055 }, "/product/a4": { src: "/images/screenshots/product-a4.png", height: 1116 },
  "/product/b1": { src: "/images/screenshots/product-b1.png", height: 1101 }, "/product/b2": { src: "/images/screenshots/product-b2.png", height: 1077 },
  "/product/d1": { src: "/images/screenshots/product-d1.png", height: 1077 }, "/product/d2": { src: "/images/screenshots/product-d2.png", height: 959 }, "/product/d3": { src: "/images/screenshots/product-d3.png", height: 937 },
  "/product/m1": { src: "/images/screenshots/product-m1.png", height: 915 }, "/product/m3": { src: "/images/screenshots/product-m3.png", height: 937 },
};

type Session = {
  pid: string; prototype: ShowcasePrototype; startedAt: number; successAt?: number;
  shortest: boolean; activeMs: number; path: string[];
};

type JourneyPath = { id: string; nodes: string[]; success: boolean };
type FlowNode = { path: string; step: number; count: number; row: number };
type FlowLink = { from: FlowNode; to: FlowNode; count: number };

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
  return "Неизвестный экран";
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

/** Keeps every recorded transition (unlike the summary table, which only
 * stores unique screens) so the path map can show detours and returns. */
function journeysFrom(events: AnalyticsEvent[], prototype: ShowcasePrototype): JourneyPath[] {
  const starts = events.filter((e): e is JourneyEvent => e.type === "journey" && e.name === "start" && e.prototype === prototype)
    .sort((a, b) => a.timestamp - b.timestamp);
  return starts.map((start, index) => {
    const nextStart = starts[index + 1];
    const milestones = events.filter((e): e is JourneyEvent => e.type === "journey" && e.pid === start.pid && e.prototype === prototype && e.timestamp >= start.timestamp && (!nextStart || e.timestamp < nextStart.timestamp))
      .sort((a, b) => a.timestamp - b.timestamp);
    const success = milestones.find((e) => e.name === "success");
    const visited = events.filter((e): e is ScreenTimeEvent => e.type === "screen_time" && e.pid === start.pid && e.scenario === "showcase_test" && e.timestamp >= start.timestamp && (!nextStart || e.timestamp < nextStart.timestamp) && (!success || e.timestamp <= success.timestamp))
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((e) => e.path);
    const nodes = ["/showcase-test", ...visited].filter((path, i, all) => i === 0 || path !== all[i - 1]);
    if (success && nodes[nodes.length - 1] !== "/showcase-success") nodes.push("/showcase-success");
    return { id: `${start.pid}-${start.timestamp}`, nodes, success: !!success };
  }).filter((journey) => journey.nodes.length > 1);
}

function PathMap({ journeys }: { journeys: JourneyPath[] }) {
  const { nodes, links, steps, height } = useMemo(() => {
    const counts = new Map<string, number>();
    const linkCounts = new Map<string, number>();
    let maxStep = 0;
    for (const journey of journeys) {
      journey.nodes.forEach((path, step) => {
        counts.set(`${step}:${path}`, (counts.get(`${step}:${path}`) ?? 0) + 1);
        maxStep = Math.max(maxStep, step);
        if (step) {
          const key = `${step - 1}:${journey.nodes[step - 1]}→${step}:${path}`;
          linkCounts.set(key, (linkCounts.get(key) ?? 0) + 1);
        }
      });
    }
    const grouped = new Map<number, FlowNode[]>();
    for (const [key, count] of counts) {
      const divider = key.indexOf(":");
      const step = Number(key.slice(0, divider));
      const path = key.slice(divider + 1);
      const list = grouped.get(step) ?? [];
      list.push({ path, step, count, row: 0 }); grouped.set(step, list);
    }
    const allNodes = [...grouped.values()].flatMap((list) => list.sort((a, b) => b.count - a.count || a.path.localeCompare(b.path)).map((node, row) => ({ ...node, row })));
    const byKey = new Map(allNodes.map((node) => [`${node.step}:${node.path}`, node]));
    const allLinks: FlowLink[] = [...linkCounts].flatMap(([key, count]) => {
      const [fromKey, toKey] = key.split("→"); const from = byKey.get(fromKey); const to = byKey.get(toKey);
      return from && to ? [{ from, to, count }] : [];
    });
    return { nodes: allNodes, links: allLinks, steps: maxStep + 1, height: Math.max(390, Math.max(0, ...allNodes.map((node) => node.row)) * 118 + 176) };
  }, [journeys]);
  const width = Math.max(760, steps * 220 + 80);
  const x = (node: FlowNode) => 28 + node.step * 220;
  const y = (node: FlowNode) => 52 + node.row * 118;
  if (!journeys.length) return <div style={styles.pathMapEmpty}>Для этого сценария ещё нет записанных путей.</div>;
  return <div style={styles.pathMapScroll}><div style={{ ...styles.pathMapCanvas, width, height }}>
    <svg aria-hidden="true" width={width} height={height} style={styles.pathMapLinks}>{links.map((link) => {
      const startX = x(link.from) + 168; const startY = y(link.from) + 43; const endX = x(link.to); const endY = y(link.to) + 43;
      return <path key={`${link.from.step}-${link.from.path}-${link.to.step}-${link.to.path}`} d={`M ${startX} ${startY} C ${startX + 44} ${startY}, ${endX - 44} ${endY}, ${endX} ${endY}`} fill="none" stroke="#7da8ef" strokeOpacity=".48" strokeWidth={Math.max(1.2, Math.min(13, link.count * 3.2))} />;
    })}</svg>
    {Array.from({ length: steps }, (_, step) => <div key={step} style={{ ...styles.pathStep, left: x({ step, path: "", count: 0, row: 0 }) }}>Шаг {step + 1}</div>)}
    {nodes.map((node) => { const shot = screenScreenshots[node.path]; return <div key={`${node.step}-${node.path}`} style={{ ...styles.pathNode, left: x(node), top: y(node) }}><div style={styles.pathNodeImage}>{shot ? <img src={asset(shot.src)} alt="" style={styles.pathNodeImg} /> : <span>Экран</span>}</div><div style={styles.pathNodeInfo}><strong>{labelPath(node.path)}</strong><span>{node.count} {node.count === 1 ? "пользователь" : "пользователя"}</span></div>{node.path === "/showcase-success" && <span style={styles.pathSuccess}>✓</span>}</div>; })}
  </div></div>;
}

function Metric({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return <div style={styles.metric}><div style={styles.metricValue}>{value}</div><div style={styles.metricLabel}>{label}</div>{note && <div style={styles.metricNote}>{note}</div>}</div>;
}

function Heatmap({ clicks, title, path }: { clicks: ClickEvent[]; title: string; path: string | null }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const screenshot = path ? screenScreenshots[path] : undefined;
  const width = 375;
  const height = screenshot?.height ?? 812;
  useEffect(() => {
    const node = canvas.current;
    const ctx = node?.getContext("2d");
    if (!node || !ctx) return;
    ctx.clearRect(0, 0, width, height);
    // Normalize point strength for large studies. A 500-person test can
    // produce thousands of clicks; without this, source-over blending turns
    // the whole screen into one opaque red block.
    const strength = Math.max(0.012, Math.min(0.22, 1.1 / Math.sqrt(Math.max(1, clicks.length))));
    const radius = clicks.length > 1500 ? 22 : clicks.length > 400 ? 28 : 36;
    for (const click of clicks) {
      const x = click.xNorm * width;
      const y = Math.min(height - 10, click.yPage);
      const gradient = ctx.createRadialGradient(x, y, 1, x, y, radius);
      const color = click.deadClick ? "236,147,0" : "232,77,108";
      gradient.addColorStop(0, `rgba(${color},${strength})`);
      gradient.addColorStop(.45, `rgba(${color},${strength * .35})`);
      gradient.addColorStop(1, "rgba(232,77,108,0)");
      ctx.fillStyle = gradient;
      ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
    }
  }, [clicks]);
  return <div style={styles.heatmapWrap}>
    <div style={styles.heatmapTop}><div><strong>{title}</strong><span style={styles.heatmapScreenName}>Скриншот: {path ? labelPath(path) : "не выбран"}</span></div><span>{clicks.length} кликов</span></div>
    {path && screenshot ? <div style={styles.heatmapStage}><img src={asset(screenshot.src)} alt={`Скриншот: ${labelPath(path)}`} style={styles.heatmapScreenshot} /><canvas ref={canvas} width={width} height={height} style={styles.heatmapCanvas} /></div> : <div style={styles.heatmapEmpty}>{path ? "Для этого экрана пока нет скриншота" : "Выберите экран"}</div>}
    <p style={styles.heatmapHint}>Тепловая карта нормализует плотность для исследований до 500 участников: зоны интереса остаются видны, но не перекрывают экран. Оранжевым отмечены клики вне интерактивных элементов.</p>
  </div>;
}

export default function ResearchReportPage() {
  const [events, setEvents] = useState<AnalyticsEvent[] | null>(null);
  const [selected, setSelected] = useState<ShowcasePrototype | "all">("all");
  const [pathPrototype, setPathPrototype] = useState<ShowcasePrototype>("cashbox");
  const [heatmapScope, setHeatmapScope] = useState<ShowcasePrototype | "all">("all");
  const [heatmapPid, setHeatmapPid] = useState<string | "all">("all");
  const [heatmapPath, setHeatmapPath] = useState<string | null>(null);
  useEffect(() => { fetchAllEvents().then(setEvents); }, []);
  const sessions = useMemo(() => sessionsFrom(events ?? []), [events]);
  const pids = useMemo(() => [...new Set(sessions.map((s) => s.pid))], [sessions]);
  const visible = selected === "all" ? sessions : sessions.filter((s) => s.prototype === selected);
  const completed = visible.filter((s) => s.successAt);
  const users = [...new Set(visible.map((s) => s.pid))];
  const successfulUsers = new Set(completed.map((s) => s.pid)).size;
  const shortestUsers = new Set(completed.filter((s) => s.shortest).map((s) => s.pid)).size;
  const unfinishedUsers = users.length - successfulUsers;
  const avgSuccess = completed.length ? completed.reduce((sum, s) => sum + (s.successAt! - s.startedAt), 0) / completed.length : undefined;
  const avgSession = visible.length ? visible.reduce((sum, s) => sum + s.activeMs, 0) / visible.length : undefined;
  const scenarioJourneys = useMemo(() => journeysFrom(events ?? [], pathPrototype), [events, pathPrototype]);
  const scopedSessions = useMemo(() => sessions.filter((s) => heatmapScope === "all" || s.prototype === heatmapScope), [sessions, heatmapScope]);
  const heatmapPaths = useMemo(() => [...new Set((events ?? []).filter((e): e is ClickEvent => e.type === "click" && e.scenario === "showcase_test").filter((click) => {
    if (heatmapScope === "all") return true;
    return scopedSessions.some((s) => s.pid === click.pid && click.timestamp >= s.startedAt && (!s.successAt || click.timestamp <= s.successAt));
  }).map((click) => click.path))], [events, heatmapScope, scopedSessions]);
  const selectedHeatmapPath = heatmapPath && heatmapPaths.includes(heatmapPath) ? heatmapPath : heatmapPaths[0] ?? null;
  // A person appears only if they actually visited the selected screen within
  // the selected scenario — not merely because they took part in another test.
  const heatmapPids = useMemo(() => [...new Set((events ?? []).filter((e): e is ScreenTimeEvent => e.type === "screen_time" && e.scenario === "showcase_test" && e.path === selectedHeatmapPath).filter((screen) => heatmapScope === "all" || scopedSessions.some((s) => s.pid === screen.pid && screen.timestamp >= s.startedAt && (!s.successAt || screen.timestamp <= s.successAt))).map((screen) => screen.pid))], [events, heatmapScope, scopedSessions, selectedHeatmapPath]);
  const selectedHeatmapPid = heatmapPid !== "all" && heatmapPids.includes(heatmapPid) ? heatmapPid : "all";
  const heatmapClicks = useMemo(() => (events ?? []).filter((e): e is ClickEvent => e.type === "click" && e.scenario === "showcase_test" && e.path === selectedHeatmapPath && (selectedHeatmapPid === "all" || e.pid === selectedHeatmapPid)), [events, selectedHeatmapPid, selectedHeatmapPath])
    .filter((click) => {
      if (heatmapScope === "all") return true;
      const session = scopedSessions.find((s) => s.pid === click.pid && click.timestamp >= s.startedAt && (!s.successAt || click.timestamp <= s.successAt));
      return !!session;
    });

  return <main style={styles.page}>
    <div style={styles.topbar}><div><p style={styles.eyebrow}>ИССЛЕДОВАНИЕ ПРОТОТИПОВ</p><h1 style={styles.title}>Отчёт по пользовательским тестам</h1><p style={styles.subtitle}>Данные обновляются из анонимных событий участников</p></div><Link href="/" style={styles.back}>К прототипам →</Link></div>
    {events === null ? <p style={styles.muted}>Загружаем данные…</p> : <>
      <div style={styles.filters}>{[{ id: "all" as const, label: "Все прототипы", color: "#1d2023" }, ...prototypes].map((p) => <button key={p.id} onClick={() => setSelected(p.id)} style={{ ...styles.filter, ...(selected === p.id ? { background: p.color, color: "#fff", borderColor: p.color } : {}) }}>{p.label}</button>)}</div>
      <section style={styles.metricGrid}>
        <Metric value={users.length} label="пользователей начали тест" />
        <Metric value={successfulUsers} label="успешно прошли" note={`из ${users.length} пользователей`} />
        <Metric value={unfinishedUsers} label="не дошли до успеха" note={`из ${users.length} пользователей`} />
        <Metric value={users.length ? `${Math.round(successfulUsers / users.length * 100)}%` : "—"} label="конверсия в успех" note={`${successfulUsers} из ${users.length} пользователей`} />
        <Metric value={duration(avgSuccess)} label="ср. время до успеха" />
        <Metric value={duration(avgSession)} label="ср. активное время сессии" />
        <Metric value={shortestUsers} label="прошли кратчайшим путём" note={`из ${successfulUsers} успешно прошедших`} />
      </section>
      <section style={styles.card}><div style={styles.sectionTop}><div><h2 style={styles.heading}>Пути</h2><p style={styles.description}>Переходы между экранами выбранного сценария. Толщина линии показывает, сколько пользователей прошли этим маршрутом.</p></div><select aria-label="Сценарий для карты путей" value={pathPrototype} onChange={(event) => setPathPrototype(event.target.value as ShowcasePrototype)} style={styles.pathScenarioSelect}>{prototypes.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}</select></div>
        <PathMap journeys={scenarioJourneys} />
      </section>
      <section style={styles.card}><div style={styles.sectionTop}><div><h2 style={styles.heading}>Тепловые карты</h2><p style={styles.description}>Все срезы доступны здесь: общий, по сценарию и по респонденту.</p></div></div>
        <div style={styles.heatmapControls}><div style={styles.controlGroup}><label htmlFor="heatmap-scenario" style={styles.controlLabel}>1. Сценарий</label><select id="heatmap-scenario" value={heatmapScope} onChange={(event) => { setHeatmapScope(event.target.value as ShowcasePrototype | "all"); setHeatmapPid("all"); setHeatmapPath(null); }} style={styles.select}>{[{ id: "all" as const, label: "Общий" }, ...prototypes.map((p) => ({ id: p.id, label: p.label }))].map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div><div style={styles.controlGroup}><label htmlFor="heatmap-screen" style={styles.controlLabel}>2. Экран</label><select id="heatmap-screen" value={selectedHeatmapPath ?? ""} onChange={(event) => { setHeatmapPath(event.target.value || null); setHeatmapPid("all"); }} style={styles.select} disabled={!heatmapPaths.length}><option value="">Выберите экран</option>{heatmapPaths.map((path) => <option key={path} value={path}>{labelPath(path)}</option>)}</select></div><div style={styles.controlGroup}><label htmlFor="heatmap-participant" style={styles.controlLabel}>3. Респондент</label><select id="heatmap-participant" value={selectedHeatmapPid} onChange={(event) => setHeatmapPid(event.target.value)} style={styles.select}><option value="all">Все релевантные</option>{heatmapPids.map((pid) => <option key={pid} value={pid}>{participantName(pid, pids)}</option>)}</select></div></div>
        <Heatmap clicks={heatmapClicks} path={selectedHeatmapPath} title={`${heatmapScope === "all" ? "Общая карта" : prototypes.find((p) => p.id === heatmapScope)?.label}${selectedHeatmapPath ? ` · ${labelPath(selectedHeatmapPath)}` : ""}${selectedHeatmapPid === "all" ? "" : ` · ${participantName(selectedHeatmapPid, pids)}`}`} />
      </section>
      <section style={styles.card}><div style={styles.sectionTop}><div><h2 style={styles.heading}>Респонденты и путь</h2><p style={styles.description}>Время сессии — суммарное активное время на экранах. До успеха — от входа в задание до нажатия целевого действия.</p></div></div>
        <div style={styles.tableWrap}><table style={styles.table}><thead><tr><th style={styles.tableHead}>Респондент</th><th style={styles.tableHead}>Прототип</th><th style={styles.tableHead}>Дата</th><th style={styles.tableHead}>Сессия</th><th style={styles.tableHead}>До успеха</th><th style={{ ...styles.tableHead, ...styles.path }}>Маршрут</th></tr></thead><tbody>{[...visible].sort((a, b) => b.startedAt - a.startedAt).map((s) => <tr key={`${s.pid}-${s.prototype}-${s.startedAt}`} style={styles.tableRow}><td style={styles.tableCell}>{participantName(s.pid, pids)}</td><td style={styles.tableCell}><span style={{ ...styles.productBadge, background: prototypes.find((p) => p.id === s.prototype)?.color }}>{prototypes.find((p) => p.id === s.prototype)?.label}</span></td><td style={styles.tableCell}>{dateLabel(s.startedAt)}</td><td style={styles.tableCell}>{duration(s.activeMs)}</td><td style={styles.tableCell}>{s.successAt ? <>{duration(s.successAt - s.startedAt)}{s.shortest && <span style={styles.shortest}>Кратчайший</span>}</> : "Не завершил"}</td><td style={{ ...styles.tableCell, ...styles.path }}>{s.path.length ? s.path.join(" → ") : "Путь ещё не записан"}</td></tr>)}</tbody></table></div>
      </section>
      <p style={styles.footer}>Тепловые карты строятся только по данным пользовательских тестов и не используют прежнюю страницу аналитики.</p>
    </>}
  </main>;
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "#f5f6f8", color: "#1d2023", padding: "44px clamp(20px, 5vw, 80px) 64px", fontFamily: "'MTS Compact', Arial, sans-serif", boxSizing: "border-box" },
  topbar: { maxWidth: 1360, margin: "0 auto 30px", display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-start" }, eyebrow: { fontSize: 12, letterSpacing: ".08em", fontWeight: 700, color: "#777f89", margin: 0 }, title: { fontFamily: "'MTS Wide', Arial, sans-serif", fontSize: "clamp(28px, 4vw, 42px)", margin: "8px 0", lineHeight: 1.1 }, subtitle: { margin: 0, color: "#6b737c", fontSize: 16 }, back: { color: "#5b50db", textDecoration: "none", fontWeight: 600, whiteSpace: "nowrap" }, filters: { maxWidth: 1360, margin: "0 auto 24px", display: "flex", flexWrap: "wrap", gap: 8 }, filter: { background: "#fff", border: "1px solid #dde0e5", borderRadius: 999, padding: "9px 14px", color: "#454b52", cursor: "pointer", font: "inherit", fontWeight: 600 }, metricGrid: { maxWidth: 1360, margin: "0 auto 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: 12 }, metric: { background: "#fff", borderRadius: 16, padding: "18px", minHeight: 100, boxSizing: "border-box" }, metricValue: { fontFamily: "'MTS Wide', Arial, sans-serif", fontSize: 25, lineHeight: 1.1 }, metricLabel: { color: "#69717a", fontSize: 14, marginTop: 8 }, metricNote: { color: "#9299a1", fontSize: 12, marginTop: 4 }, card: { maxWidth: 1360, margin: "0 auto 20px", background: "#fff", borderRadius: 20, padding: "24px", boxSizing: "border-box" }, heading: { fontFamily: "'MTS Wide', Arial, sans-serif", fontSize: 21, margin: "0 0 8px" }, description: { margin: 0, color: "#727981", fontSize: 14, maxWidth: 660 }, sectionTop: { display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 20 }, pathScenarioSelect: { minWidth: 190, alignSelf: "flex-start", minHeight: 40, padding: "8px 34px 8px 11px", borderRadius: 9, border: "1px solid #d5d9df", background: "#fff", color: "#1d2023", font: "inherit", fontSize: 14, cursor: "pointer" }, pathMapScroll: { overflow: "auto", border: "1px solid #dfe5ed", borderRadius: 16, backgroundImage: "radial-gradient(#dbe2ec 1px, transparent 1px)", backgroundSize: "12px 12px", backgroundColor: "#fbfcfe" }, pathMapCanvas: { position: "relative", minHeight: 390 }, pathMapLinks: { position: "absolute", inset: 0, pointerEvents: "none" }, pathStep: { position: "absolute", top: 14, color: "#87909b", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }, pathNode: { position: "absolute", width: 168, minHeight: 86, display: "flex", gap: 9, padding: 8, boxSizing: "border-box", borderRadius: 12, background: "rgba(255,255,255,.96)", border: "1px solid #e0e5ec", boxShadow: "0 2px 8px rgba(20,34,56,.08)" }, pathNodeImage: { width: 50, height: 68, flex: "0 0 50px", overflow: "hidden", display: "grid", placeItems: "center", borderRadius: 7, background: "#eef1f5", color: "#7a838e", fontSize: 10 }, pathNodeImg: { width: "100%", height: "100%", display: "block", objectFit: "cover", objectPosition: "top" }, pathNodeInfo: { minWidth: 0, display: "flex", flexDirection: "column", gap: 5, fontSize: 11, lineHeight: 1.25 }, pathSuccess: { position: "absolute", right: -7, bottom: -7, display: "grid", placeItems: "center", width: 23, height: 23, borderRadius: 999, background: "#27bf68", color: "#fff", fontWeight: 800, border: "2px solid #fff" }, pathMapEmpty: { minHeight: 220, display: "grid", placeItems: "center", borderRadius: 14, background: "#f5f6f8", color: "#727981", fontSize: 14 }, heatmapControls: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 20, padding: 14, borderRadius: 14, background: "#f5f6f8" }, controlGroup: { display: "flex", flexDirection: "column", alignItems: "stretch", gap: 6 }, controlLabel: { color: "#727981", fontSize: 13, fontWeight: 600 }, select: { width: "100%", minHeight: 40, padding: "8px 34px 8px 11px", borderRadius: 9, border: "1px solid #d5d9df", background: "#fff", color: "#1d2023", font: "inherit", fontSize: 14, cursor: "pointer" }, heatmapWrap: { border: "1px solid #e1e4e8", borderRadius: 14, overflow: "hidden", background: "#f2f4f7" }, heatmapTop: { padding: "12px 14px", background: "#fff", display: "flex", justifyContent: "space-between", fontSize: 14 }, heatmapScreenName: { display: "block", marginTop: 4, color: "#727981", fontSize: 12 }, heatmapStage: { position: "relative", width: 375, maxWidth: "100%", margin: "0 auto", overflow: "hidden", background: "#f2f4f7", borderLeft: "1px solid #dfe2e6", borderRight: "1px solid #dfe2e6" }, heatmapScreenshot: { width: "100%", height: "auto", display: "block" }, heatmapCanvas: { position: "absolute", inset: 0, display: "block", width: "100%", height: "100%" }, heatmapEmpty: { height: 220, display: "grid", placeItems: "center", color: "#727981", fontSize: 14 }, heatmapHint: { margin: 0, padding: "9px 14px", background: "#fff", color: "#727981", fontSize: 12 }, tableWrap: { overflowX: "auto", border: "1px solid #e4e7eb", borderRadius: 14 }, table: { width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 1040, fontSize: 14 }, tableHead: { padding: "13px 16px", background: "#f5f6f8", color: "#68717b", fontSize: 12, fontWeight: 700, textAlign: "left", whiteSpace: "nowrap", borderBottom: "1px solid #e4e7eb" }, tableRow: { background: "#fff" }, tableCell: { padding: "16px", verticalAlign: "top", borderBottom: "1px solid #edf0f2", lineHeight: 1.4 }, productBadge: { display: "inline-block", padding: "5px 8px", color: "#fff", borderRadius: 7, fontWeight: 600, whiteSpace: "nowrap" }, path: { color: "#606873", minWidth: 340, maxWidth: 520, lineHeight: 1.5 }, shortest: { display: "block", color: "#138a76", fontSize: 12, marginTop: 3 }, muted: { maxWidth: 1360, margin: "30px auto", color: "#727981" }, footer: { maxWidth: 1360, margin: "0 auto", color: "#727981", fontSize: 13 },
};
