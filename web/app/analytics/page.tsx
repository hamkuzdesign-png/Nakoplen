"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const S = {
  bgPrimary: "#1d2023",
  bgSecondary: "rgba(98,108,119,0.25)",
  textPrimary: "#fafafa",
  textSecondary: "#969fa8",
  green: "#26cd58",
};

const SKEL_COLOR = "rgba(127,140,153,0.35)";

/* Icon skins — same gradients as the "Skins" component on /my-savings (Nakop = %, Deposit = money) */
const ICON_BG = "linear-gradient(135deg, rgba(186,224,255,0.05) 0.96154%, rgba(40,49,72,0.5) 100%)";
const COIN_OUTER = `url("data:image/svg+xml;utf8,<svg viewBox='0 0 52 52' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23g)' opacity='1'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(5.2 5.2 -5.2 10.849 0 0)'><stop stop-color='rgba(186,224,255,0.24)' offset='0'/><stop stop-color='rgba(113,137,164,0.62)' offset='0.42067'/><stop stop-color='rgba(77,93,118,0.81)' offset='0.63101'/><stop stop-color='rgba(58,71,95,0.905)' offset='0.73618'/><stop stop-color='rgba(40,49,72,1)' offset='0.84135'/></radialGradient></defs></svg>")`;
const COIN_INNER = `url("data:image/svg+xml;utf8,<svg viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23g)' opacity='1'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(4.8 4.8 -4.8 10.015 0 0)'><stop stop-color='rgba(186,224,255,0.24)' offset='0'/><stop stop-color='rgba(113,137,164,0.62)' offset='0.42067'/><stop stop-color='rgba(77,93,118,0.81)' offset='0.63101'/><stop stop-color='rgba(58,71,95,0.905)' offset='0.73618'/><stop stop-color='rgba(40,49,72,1)' offset='0.84135'/></radialGradient></defs></svg>")`;

/* ── Skeleton shimmer block ── */
function Skel({ w, h, r = 8 }: { w: string | number; h: number; r?: number }) {
  return (
    <div className="skel-pulse" style={{ width: w, height: h, borderRadius: r, background: SKEL_COLOR, flexShrink: 0, opacity: 0.5 }} />
  );
}

/* Bar column heights from Figma (total column h including 16px label + 4px gap) */
const SKEL_BARS = [150, 109, 177, 142, 170, 117];

/* ── Skeleton screen ── */
function SkeletonScreen({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ minHeight: "100svh", background: "#000", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes skelPulse { 0%,100%{opacity:0.5} 50%{opacity:0.25} }
        .skel-pulse { animation: skelPulse 1.4s ease-in-out infinite; }
      `}</style>

      {/* Navbar (dark rounded block, matches other pages) */}
      <div style={{ background: S.bgPrimary, borderRadius: "0 0 32px 32px", flexShrink: 0 }}>
        {/* Nav row */}
        <div style={{ display: "flex", alignItems: "center", padding: "44px 20px 20px", position: "relative" }}>
          <button onClick={onBack} style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, borderRadius: 12, background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <img src="/images/icon-back.svg" alt="" style={{ width: 24, height: 24 }} />
          </button>
          <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 17, color: S.textPrimary, flex: 1, textAlign: "center" }}>Аналитика</p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 0 40px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Chart card skeleton */}
        <div style={{ background: S.bgPrimary, borderRadius: 32, overflow: "hidden", paddingBottom: 20 }}>
          {/* Title skeleton */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "32px 20px 0" }}>
            <Skel w={75} h={24} />
            <Skel w={113} h={20} />
          </div>

          {/* Bar chart — exact Figma heights, 56px wide each, bottom-aligned in 211px container */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 211, padding: "0 20px 20px" }}>
            {SKEL_BARS.map((totalH, i) => {
              const barH = totalH - 16 - 4; // subtract label + gap
              return (
                <div key={i} style={{ width: 56, flexShrink: 0, display: "flex", flexDirection: "column", gap: 4, height: totalH, justifyContent: "flex-end" }}>
                  <Skel w={56} h={barH} r={12} />
                  <Skel w={56} h={16} r={12} />
                </div>
              );
            })}
          </div>

          {/* Chips — 6 chips, 80×32, flex-wrap */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "0 20px" }}>
            {[0,1,2,3,4,5].map(i => <Skel key={i} w={80} h={32} r={12} />)}
          </div>
        </div>

        {/* List card skeleton */}
        <div style={{ background: S.bgPrimary, borderRadius: 32, overflow: "hidden", padding: "12px 0" }}>
          {/* Section title */}
          <div style={{ padding: "12px 20px 8px" }}>
            <Skel w={135} h={16} r={8} />
          </div>

          {/* 3 cells */}
          {[0,1,2].map(i => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 20px", minHeight: 84 }}>
              <Skel w={52} h={52} r={16} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <Skel w={135} h={16} r={8} />
                <Skel w={229} h={20} r={8} />
                {i === 2 && <Skel w={135} h={16} r={8} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Home indicator */}
      <div style={{ display: "flex", justifyContent: "center", padding: "0 0 10px" }}>
        <div style={{ width: 108, height: 4, borderRadius: 12, background: S.textPrimary }} />
      </div>
    </div>
  );
}

/* Monthly income split by product type — accounts (Счета) vs deposits (Вклады).
   Reconciled with "Мои накопления": every open product's row income there (МТС Счёт ×2,
   Вклад МТС Максимум) sums into the matching category here. Вклад МТС Плюс is unfunded
   (0 ₽) and Кешбокс / Вклад «Плюс» are still just offers on that screen, so neither
   contributes to the payout history.
   Settled months sum to exactly +12 719 ₽ — the same "за всё время" figure shown on
   /my-savings (10 032 ₽ ежедневный + 641 ₽ минимальный + 2 046 ₽ Максимум).
   "current" flag → white gradient instead of green, "~" value prefix (ongoing, not yet settled) */
const BARS = [
  { label: "январь",   accounts: 0,    deposits: 0,   current: false },
  { label: "февраль",  accounts: 320,  deposits: 0,   current: false },
  { label: "март",     accounts: 0,    deposits: 950, current: false },
  { label: "апрель",   accounts: 0,    deposits: 0,   current: false },
  { label: "май",      accounts: 1688, deposits: 0,   current: false },
  { label: "июнь",     accounts: 4173, deposits: 0,   current: false },
  { label: "июль",     accounts: 1500, deposits: 0,   current: false },
  { label: "август",   accounts: 1200, deposits: 350, current: false },
  { label: "сентябрь", accounts: 0,    deposits: 746, current: false },
  { label: "октябрь",  accounts: 1792, deposits: 0,   current: false },
  { label: "ноябрь",   accounts: 700,  deposits: 280, current: true  },
];

/* Matches the "+12 719 ₽ за всё время" badge on /my-savings — same figure, same label */
const LIFETIME_TOTAL = "12 719 ₽";

type Category = "accounts" | "deposits";

const CATEGORIES: Record<Category, { label: string; total: string; chipBg: string }> = {
  accounts: { label: "Счета", total: "10 673 ₽", chipBg: "rgba(18,134,217,0.2)" },
  deposits: { label: "Вклады", total: "2 046 ₽", chipBg: "rgba(119,119,255,0.2)" },
};

const TRANSACTIONS: { date: string; month: string; items: { title: string; sub: string; amount: string; category: Category }[] }[] = [
  { date: "23 ОКТЯБРЯ", month: "октябрь", items: [
    { title: "МТС Счёт", sub: "Счёт – выплата процентов", amount: "+1 480 ₽", category: "accounts" },
  ]},
  { date: "14 ОКТЯБРЯ", month: "октябрь", items: [
    { title: "МТС Счёт", sub: "Счёт – выплата процентов", amount: "+312 ₽", category: "accounts" },
  ]},
  { date: "20 СЕНТЯБРЯ", month: "сентябрь", items: [
    { title: "Вклад МТС Максимум", sub: "Вклад – выплата процентов", amount: "+746 ₽", category: "deposits" },
  ]},
  { date: "18 АВГУСТА", month: "август", items: [
    { title: "МТС Счёт", sub: "Счёт – выплата процентов", amount: "+1 200 ₽", category: "accounts" },
    { title: "Вклад МТС Максимум", sub: "Вклад – выплата процентов", amount: "+350 ₽", category: "deposits" },
  ]},
  { date: "30 ИЮЛЯ", month: "июль", items: [
    { title: "МТС Счёт", sub: "Счёт – выплата процентов", amount: "+1 500 ₽", category: "accounts" },
  ]},
  { date: "05 ИЮНЯ", month: "июнь", items: [
    { title: "МТС Счёт", sub: "Счёт – выплата процентов", amount: "+4 173 ₽", category: "accounts" },
  ]},
  { date: "25 МАЯ", month: "май", items: [
    { title: "МТС Счёт", sub: "Счёт – выплата процентов", amount: "+1 688 ₽", category: "accounts" },
  ]},
  { date: "15 МАРТА", month: "март", items: [
    { title: "Вклад МТС Максимум", sub: "Вклад – выплата процентов", amount: "+950 ₽", category: "deposits" },
  ]},
  { date: "10 ФЕВРАЛЯ", month: "февраль", items: [
    { title: "МТС Счёт", sub: "Счёт – выплата процентов", amount: "+320 ₽", category: "accounts" },
  ]},
];

/* amount → bar rectangle height, px (min 28 for empty months, capped at 180) */
function barHeightFor(amount: number) {
  if (amount <= 0) return 28;
  return Math.min(180, Math.round(28 + amount * 0.033));
}

/* Amount for a bar under the given category filter ("all" sums both) */
function amountForBar(bar: (typeof BARS)[number], filter: Category | "all") {
  return filter === "all" ? bar.accounts + bar.deposits : bar[filter];
}

/* 12345 → "12 345" */
function formatAmount(n: number) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function CrossIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 4L12 12M12 4L4 12" stroke="#FAFAFA" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* Bar entrance timing */
const BAR_ANIM_DURATION = 900;
const BAR_ANIM_STAGGER = 45;

/* A bar column whose height and value label are driven by the same `progress` value (0→1),
   so the sum visibly rides up together with the growing bar instead of sitting static above it.
   The rise plays exactly once, on mount, independent of the `amount`/`targetHeight` props —
   later prop changes (filter/month toggles) just re-render at progress=1 with the new numbers,
   instead of resetting progress to 0 and re-animating (which briefly collapsed the bar to
   nothing and made the value drop down near the bottom of the chart). */
function AnimatedBar({ amount, prefix, targetHeight, background, valueColor, isSelected, delayMs, onClick }: {
  amount: number; prefix: string; targetHeight: number; background: string; valueColor: string; isSelected: boolean; delayMs: number; onClick: () => void;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    let start: number | null = null;
    const timer = setTimeout(() => {
      const step = (ts: number) => {
        if (start === null) start = ts;
        const t = Math.min(1, (ts - start) / BAR_ANIM_DURATION);
        setProgress(t);
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delayMs);
    return () => { clearTimeout(timer); if (raf) cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <button onClick={onClick} style={{ width: 56, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
      <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: valueColor, lineHeight: "16px", textAlign: "center", width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {prefix}{formatAmount(Math.round(amount * progress))} ₽
      </span>
      <div style={{ width: "100%", height: Math.round(targetHeight * progress), background, borderRadius: "16px 16px 0 0", opacity: isSelected ? 1 : 0.3 }} />
    </button>
  );
}

/* Transaction icon — gradient bg with % symbol, as in Figma */
function TxIcon({ category }: { category: Category }) {
  if (category === "deposits") {
    return (
      <div style={{ width: 52, height: 52, flexShrink: 0, position: "relative", overflow: "hidden", borderRadius: 16, backgroundImage: ICON_BG }}>
        <div style={{ position: "absolute", left: 10, top: 12, width: 52, height: 52 }}>
          <img src="/images/savings2/money.svg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", maxWidth: "none" }} />
        </div>
      </div>
    );
  }
  return (
    <div style={{ width: 52, height: 52, flexShrink: 0, position: "relative", overflow: "hidden", borderRadius: 16, backgroundImage: ICON_BG }}>
      <div style={{ position: "absolute", left: 10, top: 12, width: 52, height: 52 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 9999, backgroundImage: COIN_OUTER, opacity: 0.72 }} />
        <div style={{ position: "absolute", top: 2, left: 2, width: 48, height: 48, borderRadius: 9999, backgroundImage: COIN_INNER }} />
        <div style={{ position: "absolute", top: 11, left: 13, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <img src="/images/savings2/discount.svg" alt="" style={{ width: 24, height: 24 }} />
        </div>
      </div>
    </div>
  );
}

/* ── Full analytics screen ── */
function AnalyticsScreen({ onBack }: { onBack: () => void }) {
  const chartScrollRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<Category | "all">("all");
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  useEffect(() => {
    const el = chartScrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  function toggleMonth(i: number) {
    setSelectedMonth((cur) => (cur === i ? null : i));
  }

  const selectedBar = selectedMonth !== null ? BARS[selectedMonth] : null;
  const headerTotal = selectedBar
    ? `${selectedBar.current ? "~" : ""}${formatAmount(amountForBar(selectedBar, filter))} ₽`
    : filter === "all" ? LIFETIME_TOTAL : CATEGORIES[filter].total;
  const headerSubtitle = selectedBar ? `Доход за ${selectedBar.label}` : "Доход за всё время";

  return (
    <div style={{ minHeight: "100svh", background: "#000", display: "flex", flexDirection: "column" }}>
      {/* Navbar (dark rounded block) */}
      <div style={{ background: S.bgPrimary, borderRadius: "0 0 32px 32px", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", padding: "44px 20px 20px", position: "relative" }}>
        <button onClick={onBack} style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, borderRadius: 12, background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <img src="/images/icon-back.svg" alt="" style={{ width: 24, height: 24 }} />
        </button>
        <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 17, color: S.textPrimary, flex: 1, textAlign: "center" }}>Аналитика</p>
      </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 0 40px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Chart card */}
        <div style={{ background: S.bgPrimary, borderRadius: 32, overflow: "hidden", paddingBottom: 20 }}>
          {/* Total */}
          <div style={{ padding: "32px 20px 12px", display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
            <div>
              <p style={{ fontFamily: "'MTS Wide', sans-serif", fontWeight: 500, fontSize: 20, color: S.textPrimary, lineHeight: "24px", marginBottom: 4 }}>{headerTotal}</p>
              <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 400, fontSize: 14, color: S.textSecondary, lineHeight: "20px" }}>{headerSubtitle}</p>
            </div>
            {/* Active filter chip — click × to reset */}
            {filter !== "all" && (
              <button onClick={() => setFilter("all")} style={{ background: "rgba(127,140,153,0.35)", border: "none", borderRadius: 12, padding: "6px 10px", display: "flex", gap: 2, alignItems: "center", cursor: "pointer" }}>
                <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, color: S.textPrimary, lineHeight: "20px" }}>{CATEGORIES[filter].label}</span>
                <CrossIcon />
              </button>
            )}
          </div>

          {/* Bar chart — scrollable, 56px wide each. Bars and labels are separate rows
              so every month label sits on one shared line regardless of bar height. */}
          <div ref={chartScrollRef} style={{ overflowX: "auto", paddingBottom: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", minWidth: "max-content" }}>
              {/* Bars row — click a bar to filter the history by that month */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 200, padding: "0 20px" }}>
                {BARS.map((bar, i) => {
                  const amount = amountForBar(bar, filter);
                  const isSelected = selectedMonth === i;
                  const gradBg = bar.current
                    ? "linear-gradient(180deg, rgba(255,255,255,0.8) 36.7%, #1d2023 100%)"
                    : "linear-gradient(180deg, #26cd58 36.7%, #1d2023 100%)";
                  const valueColor = bar.current ? S.textSecondary : "#74df8b";
                  /* Forecast bar (current/ongoing period) gets a dotted texture on top of the gradient —
                     uniform ~15px square grid (matches Figma), clipped to 3 columns by the bar's own width/radius */
                  const background = bar.current
                    ? `radial-gradient(circle, rgba(255,255,255,0.5) 1.2px, transparent 1.2px) 11px 12px / 15px 15px, ${gradBg}`
                    : gradBg;
                  return (
                    <AnimatedBar
                      key={i}
                      amount={amount}
                      prefix={bar.current ? "~" : ""}
                      targetHeight={barHeightFor(amount)}
                      background={background}
                      valueColor={valueColor}
                      isSelected={isSelected}
                      delayMs={i * BAR_ANIM_STAGGER}
                      onClick={() => toggleMonth(i)}
                    />
                  );
                })}
              </div>
              {/* Labels row — one shared line, independent of bar height */}
              <div style={{ display: "flex", gap: 8, padding: "4px 20px 20px" }}>
                {BARS.map((bar, i) => (
                  <button key={i} onClick={() => toggleMonth(i)} style={{ width: 56, flexShrink: 0, fontFamily: "'MTS Compact', sans-serif", fontSize: 12, fontWeight: selectedMonth === i ? 500 : 400, color: S.textSecondary, lineHeight: "16px", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", background: "none", border: "none", padding: 0, cursor: "pointer" }}>{bar.label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Category chips — click to filter analytics by product type */}
          {filter === "all" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "0 20px" }}>
              {(Object.keys(CATEGORIES) as Category[]).map((key) => (
                <button key={key} onClick={() => setFilter(key)} style={{ background: CATEGORIES[key].chipBg, border: "none", borderRadius: 12, padding: "6px 8px", display: "flex", gap: 2, alignItems: "center", cursor: "pointer" }}>
                  <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, color: "#fff", lineHeight: "20px" }}>{CATEGORIES[key].label}</span>
                  <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, fontWeight: 500, color: "#fff", lineHeight: "20px" }}>{CATEGORIES[key].total}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Transactions list — filtered by selected product type / month */}
        {(() => {
          const groups = TRANSACTIONS
            .filter((group) => selectedBar === null || group.month === selectedBar.label)
            .map((group) => ({ date: group.date, items: filter === "all" ? group.items : group.items.filter((it) => it.category === filter) }))
            .filter((group) => group.items.length > 0);

          if (groups.length === 0) {
            return (
              <div style={{ background: S.bgPrimary, borderRadius: 32, overflow: "hidden", padding: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", padding: "4px 0 16px" }}>
                  <img src="/images/analytics/empty-payouts.png" alt="" style={{ width: 100, height: 100, mixBlendMode: "lighten" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
                    <p style={{ fontFamily: "'MTS Wide', sans-serif", fontWeight: 500, fontSize: 20, color: S.textPrimary, lineHeight: "24px", textAlign: "center" }}>Начислений нет</p>
                    <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 400, fontSize: 14, color: S.textSecondary, lineHeight: "20px", textAlign: "center" }}>Покажем их здесь, как только они появятся</p>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div style={{ background: S.bgPrimary, borderRadius: 32, overflow: "hidden", padding: "8px 0 20px" }}>
              {groups.map((group, gi) => (
                <div key={group.date}>
                  {/* Section date header */}
                  <div style={{ padding: gi === 0 ? "12px 20px 8px" : "20px 20px 8px" }}>
                    <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, fontWeight: 500, color: S.textSecondary, textTransform: "uppercase", lineHeight: "20px" }}>
                      {group.date}
                    </p>
                  </div>
                  {/* Transaction rows */}
                  {group.items.map((item, ii) => (
                    <div key={ii} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px" }}>
                      <TxIcon category={item.category} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 17, color: S.textPrimary, lineHeight: "24px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</p>
                        <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, color: S.textSecondary, lineHeight: "20px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.sub}</p>
                      </div>
                      <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 17, fontWeight: 500, color: "#74df8b", flexShrink: 0, lineHeight: "24px" }}>{item.amount}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 3000);
    return () => clearTimeout(t);
  }, []);

  function handleBack() {
    router.back();
  }

  return (
    <div className="phone-width page-enter">
      {loaded ? <AnalyticsScreen onBack={handleBack} /> : <SkeletonScreen onBack={handleBack} />}
    </div>
  );
}
