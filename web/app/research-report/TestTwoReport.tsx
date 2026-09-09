"use client";

import { useMemo, type ReactNode } from "react";
import roster from "@/lib/test-two-roster.json";
import { SHOWCASE_TARGETS, type AnalyticsEvent, type ShowcasePrototype } from "@/lib/analytics";

type Journey = { id: string; nodes: string[]; success: boolean };
const names: Record<string, string> = { cashbox: "Кешбокс", deposit: "МТС Максимум", metals: "ЦФА", mts: "МТС Накопления" };
const box = { background: "white", borderRadius: 16, padding: 20, marginBottom: 20 };
const cell = { padding: 12, borderBottom: "1px solid #eee", textAlign: "left" as const, verticalAlign: "top" as const };

export default function TestTwoReport({ events, selected, renderPaths, renderHeatmap, labelPath }: {
  events: AnalyticsEvent[]; selected: ShowcasePrototype | "all";
  renderPaths: (paths: Journey[]) => ReactNode;
  renderHeatmap: (events: AnalyticsEvent[]) => ReactNode;
  labelPath: (path: string) => string;
}) {
  const people = useMemo(() => roster.map((person, index) => ({ number: index + 1, tasks: person.tasks.filter(t => selected === "all" || t.prototype === selected).map(task => {
    // Match only the reviewed pid and the platform's task interval. No inferred
    // identity for the six unmatched questionnaires and no synthetic telemetry.
    const recorded = person.pid ? events.filter(e => e.pid === person.pid && e.timestamp >= task.start - 1000 && e.timestamp <= task.end + 1000 && (e.type === "journey" ? e.prototype === task.prototype : new URL(e.path, "https://report.local").searchParams.get("prototype") === task.prototype)) : [];
    const unique = [...new Map(recorded.map(e => [JSON.stringify(e), e])).values()].sort((a,b) => a.timestamp-b.timestamp);
    const success = unique.find(e => e.type === "journey" && e.name === "success");
    const steps = unique.flatMap(e => e.type === "screen_time" ? [{time: e.timestamp - e.durationMs, path: e.path}] : e.type === "journey" && e.name === "product_visit" && e.productId ? [{time:e.timestamp,path:`/product/${e.productId}`}] : []);
    const nodes = steps.filter(s => s.time >= task.start - 1000 && (!success || s.time <= success.timestamp)).sort((a,b)=>a.time-b.time).map(s=>s.path.split("?")[0]).filter(p => p !== "/showcase-success").filter((p,i,a)=>i===0||p!==a[i-1]);
    if (success) {
      const target = `/product/${SHOWCASE_TARGETS[task.prototype as ShowcasePrototype]}`;
      if (nodes.at(-1) !== target) nodes.push(target);
      nodes.push("/showcase-success");
    }
    return {...task, matched: !!person.pid, recorded: unique, success: !!success, nodes};
  }) })), [events, selected]);
  const tasks = people.flatMap(p=>p.tasks);
  const paths = people.flatMap(p=>p.tasks.filter(t=>t.nodes.length>0).map(t=>({id:`${p.number}-${t.prototype}`,nodes:t.nodes,success:t.success})));
  const recordedEvents = tasks.flatMap(t=>t.recorded);
  return <div style={{maxWidth:1360,margin:"0 auto"}}>
    <section style={box}>
      <h2>Тест 2 · 26 респондентов</h2>
      <p>Все 26 анкет Pathway включены. Сопоставлены по четырём стартам 20 участников; у 6 связь с маршрутом не подтверждена. Отсутствие записи не считается отказом.</p>
      <div style={{display:"flex",gap:28,flexWrap:"wrap"}}>
        <div><strong>26</strong><p>респондентов</p></div>
        <div><strong>{tasks.filter(t=>!t.gaveUp).length} / {tasks.length}</strong><p>заданий со статусом успеха Pathway</p></div>
        <div><strong>{tasks.filter(t=>t.gaveUp).length}</strong><p>отказов по Pathway</p></div>
        <div><strong>{tasks.filter(t=>t.success).length}</strong><p>записанных целевых нажатий</p></div>
      </div>
      <p>Статус Pathway и целевое нажатие в прототипе — разные показатели. Длительность ниже взята из Pathway.</p>
    </section>
    <section style={box}><h2>Пути</h2><p>Только сопоставленные записи из интервалов выбранных заданий. При выборе всех сценариев один респондент может иметь четыре пути. Шаг успеха добавляется только при записанном целевом нажатии.</p>{renderPaths(paths)}</section>
    <section style={box}><h2>Тепловая карта</h2><p>Клики сопоставленных участников в интервалах выбранных заданий.</p>{renderHeatmap(recordedEvents)}</section>
    <section style={box}><h2>Респонденты и путь</h2><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Респондент","Сценарий / время Pathway","Результат Pathway","Целевое нажатие","Маршрут"].map(s=><th key={s} style={cell}>{s}</th>)}</tr></thead><tbody>{people.map(p=><tr key={p.number}><td style={cell}>Респондент {p.number}</td><td style={cell}>{p.tasks.map(t=><p key={t.prototype}>{names[t.prototype]} · {t.duration} с</p>)}</td><td style={cell}>{p.tasks.map(t=><p key={t.prototype}>{names[t.prototype]}: {t.gaveUp ? "Отказ" : "Успех по Pathway"}</p>)}</td><td style={cell}>{p.tasks.map(t=><p key={t.prototype}>{names[t.prototype]}: {t.success ? "Записано" : t.matched ? "Не зафиксировано" : "Нет подтверждённой связи"}</p>)}</td><td style={cell}>{p.tasks.map(t=><p key={t.prototype}><strong>{names[t.prototype]}: </strong>{t.nodes.length ? t.nodes.map(labelPath).join(" → ") : "Маршрут не подтверждён"}{t.success && " · Нажал целевое действие"}</p>)}</td></tr>)}</tbody></table></div></section>
  </div>;
}
