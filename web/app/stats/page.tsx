"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { clearEvents, getEvents, type AnalyticsEvent, type ClickEvent } from "@/lib/analytics";

const S = {
  bgLower: "#000000",
  bgPrimary: "#1d2023",
  textPrimary: "#fafafa",
  textSecondary: "#969fa8",
  fieldBg: "rgba(98,108,119,0.25)",
  fieldBorder: "rgba(127,140,153,0.35)",
  purple: "#8f8fff",
  red: "#ff5c5c",
};

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
  maxScrollPercent: number;
};

function aggregate(events: AnalyticsEvent[]): ScreenStats[] {
  const byPath = new Map<string, ScreenStats>();
  function get(path: string) {
    let s = byPath.get(path);
    if (!s) {
      s = { path, visits: 0, totalMs: 0, avgMs: 0, clicks: 0, rageClicks: 0, maxScrollPercent: 0 };
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
    } else if (e.type === "scroll_depth") {
      const s = get(e.path);
      s.maxScrollPercent = Math.max(s.maxScrollPercent, e.maxDepthPercent);
    }
  }
  for (const s of byPath.values()) s.avgMs = s.visits > 0 ? s.totalMs / s.visits : 0;
  return [...byPath.values()].sort((a, b) => b.totalMs - a.totalMs);
}

/** Additive-blend radial dots — classic click-heatmap look, no external libs. */
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
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, "rgba(255,80,80,0.55)");
      grad.addColorStop(1, "rgba(255,80,80,0)");
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
    <div style={{ width, maxWidth: "100%", overflow: "hidden", borderRadius: 16, border: `1px solid ${S.fieldBorder}` }}>
      <canvas ref={canvasRef} width={width} height={height} style={{ display: "block", width: "100%", height: "auto" }} />
    </div>
  );
}

export default function StatsPage() {
  const [events, setEvents] = useState<AnalyticsEvent[] | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  const stats = useMemo(() => aggregate(events ?? []), [events]);
  const totalRageClicks = stats.reduce((sum, s) => sum + s.rageClicks, 0);

  const activePath = selectedPath ?? stats[0]?.path ?? null;
  const activeClicks = useMemo(
    () => (events ?? []).filter((e): e is ClickEvent => e.type === "click" && e.path === activePath),
    [events, activePath]
  );

  function handleClear() {
    clearEvents();
    setEvents([]);
    setSelectedPath(null);
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(events ?? [], null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nakoplen-analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="phone-width page-enter" style={{ minHeight: "100svh", background: S.bgLower, padding: "44px 20px 40px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <Link href="/" style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, color: S.purple, textDecoration: "none" }}>← Сценарии</Link>
      </div>
      <p style={{ fontFamily: "'MTS Wide', sans-serif", fontWeight: 500, fontSize: 24, color: S.textPrimary, margin: "8px 0 4px" }}>Аналитика прототипа</p>
      <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, color: S.textSecondary, margin: "0 0 20px" }}>
        Время на экране, клики и тепловая карта. Копится в localStorage этого браузера.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button onClick={handleExport} style={{ flex: 1, height: 40, background: S.fieldBg, border: `1px solid ${S.fieldBorder}`, borderRadius: 12, color: S.textPrimary, fontFamily: "'MTS Compact', sans-serif", fontSize: 13, cursor: "pointer" }}>
          Экспорт JSON
        </button>
        <button onClick={handleClear} style={{ flex: 1, height: 40, background: S.fieldBg, border: `1px solid ${S.fieldBorder}`, borderRadius: 12, color: S.red, fontFamily: "'MTS Compact', sans-serif", fontSize: 13, cursor: "pointer" }}>
          Очистить
        </button>
      </div>

      {events === null ? (
        <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, color: S.textSecondary }}>Загрузка…</p>
      ) : stats.length === 0 ? (
        <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, color: S.textSecondary }}>
          Данных пока нет — походите по прототипу и вернитесь сюда.
        </p>
      ) : (
        <>
          {totalRageClicks > 0 && (
            <div style={{ background: "rgba(255,92,92,0.12)", border: `1px solid rgba(255,92,92,0.3)`, borderRadius: 12, padding: "10px 12px", marginBottom: 16 }}>
              <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 13, color: S.red }}>
                {totalRageClicks} «раздражённых» кликов (быстрые повторные тапы в одно место) — возможный признак нерабочего элемента
              </p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {stats.map((s) => (
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
    </div>
  );
}
