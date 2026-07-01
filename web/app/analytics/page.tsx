"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const S = {
  bgPrimary: "#1d2023",
  bgSecondary: "rgba(98,108,119,0.25)",
  textPrimary: "#fafafa",
  textSecondary: "#969fa8",
  green: "#26cd58",
};

const SKEL_COLOR = "rgba(127,140,153,0.35)";

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
        <div style={{ display: "flex", alignItems: "center", padding: "12px 20px 16px", position: "relative", height: 44 }}>
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

/* Exact bar heights from Figma (total column h incl label 16px + gap 4px).
   "current" flag → white gradient instead of green */
const BARS = [
  { label: "май",      value: "0 ₽",      totalH: 48,  current: false },
  { label: "июнь",     value: "0 ₽",      totalH: 48,  current: false },
  { label: "июль",     value: "1 500 ₽",  totalH: 119, current: false },
  { label: "август",   value: "3 000 ₽",  totalH: 167, current: false },
  { label: "сентябрь", value: "500 ₽",    totalH: 80,  current: false },
  { label: "октябрь",  value: "1 500 ₽",  totalH: 119, current: false },
  { label: "сентябрь", value: "~4 583 ₽", totalH: 191, current: true  },
];

const TRANSACTIONS = [
  { date: "23 ОКТЯБРЯ", items: [
    { title: "Кешбокс", sub: "Счёт – выплата процент", amount: "+92 ₽" },
  ]},
  { date: "25 МАЯ", items: [
    { title: "Ежедневный остаток", sub: "Счёт – выплата процентов", amount: "+10 253,32 ₽" },
    { title: "Кешбокс", sub: "Счёт – выплата процент", amount: "+88 ₽" },
  ]},
];

/* Transaction icon — gradient bg with % symbol, as in Figma */
function TxIcon() {
  return (
    <div style={{ width: 52, height: 52, borderRadius: 16, flexShrink: 0, overflow: "hidden", position: "relative", background: "linear-gradient(135deg, rgba(186,224,255,0.05) 1%, rgba(40,49,72,0.5) 100%)" }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src="/images/icon-discount.svg" alt="" style={{ width: 24, height: 24 }} />
      </div>
    </div>
  );
}

/* ── Full analytics screen ── */
function AnalyticsScreen({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ minHeight: "100svh", background: "#000", display: "flex", flexDirection: "column" }}>
      {/* Navbar (dark rounded block) */}
      <div style={{ background: S.bgPrimary, borderRadius: "0 0 32px 32px", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", padding: "12px 20px 16px", position: "relative", height: 44 }}>
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
          <div style={{ padding: "32px 20px 12px" }}>
            <p style={{ fontFamily: "'MTS Wide', sans-serif", fontWeight: 500, fontSize: 20, color: S.textPrimary, lineHeight: "24px", marginBottom: 4 }}>348 669 ₽</p>
            <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 400, fontSize: 14, color: S.textSecondary, lineHeight: "20px" }}>Доход за всё время</p>
          </div>

          {/* Bar chart — scrollable, exact Figma heights, 56px wide each */}
          <div style={{ overflowX: "auto", paddingBottom: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 212, padding: "0 20px 20px", minWidth: "max-content" }}>
              {BARS.map((bar, i) => {
                const barH = bar.totalH - 16 - 4; // subtract label + gap
                const gradBg = bar.current
                  ? "linear-gradient(180deg, rgba(255,255,255,0.8) 36.7%, #1d2023 100%)"
                  : "linear-gradient(180deg, #26cd58 36.7%, #1d2023 100%)";
                const valueColor = bar.current ? S.textSecondary : "#74df8b";
                const labelColor = S.textSecondary;
                return (
                  <div key={i} style={{ width: 56, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: bar.totalH, justifyContent: "flex-end" }}>
                    <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: valueColor, lineHeight: "16px", textAlign: "center", width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bar.value}</span>
                    <div style={{ width: "100%", height: barH, background: gradBg, borderRadius: "16px 16px 0 0", opacity: 0.3, minHeight: 8 }} />
                    <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: labelColor, lineHeight: "16px", textAlign: "center", width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bar.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "0 20px" }}>
            <div style={{ background: "rgba(18,134,217,0.2)", borderRadius: 12, padding: "6px 8px", display: "flex", gap: 2, alignItems: "center" }}>
              <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, color: "#fff", lineHeight: "20px" }}>Счета</span>
              <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, fontWeight: 500, color: "#fff", lineHeight: "20px" }}>10 352 ₽</span>
            </div>
            <div style={{ background: "rgba(119,119,255,0.2)", borderRadius: 12, padding: "6px 8px", display: "flex", gap: 2, alignItems: "center" }}>
              <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, color: "#fff", lineHeight: "20px" }}>Вклады</span>
              <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, fontWeight: 500, color: "#fff", lineHeight: "20px" }}>5 012 ₽</span>
            </div>
          </div>
        </div>

        {/* Transactions list */}
        <div style={{ background: S.bgPrimary, borderRadius: 32, overflow: "hidden", padding: "8px 0 20px" }}>
          {TRANSACTIONS.map((group, gi) => (
            <div key={gi}>
              {/* Section date header */}
              <div style={{ padding: gi === 0 ? "12px 20px 8px" : "20px 20px 8px" }}>
                <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, fontWeight: 500, color: S.textSecondary, textTransform: "uppercase", lineHeight: "20px" }}>
                  {group.date}
                </p>
              </div>
              {/* Transaction rows */}
              {group.items.map((item, ii) => (
                <div key={ii} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px" }}>
                  <TxIcon />
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
