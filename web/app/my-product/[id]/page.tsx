"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const S = {
  bgPrimary: "#1d2023",
  bgLower: "#000000",
  textPrimary: "#fafafa",
  textSecondary: "#969fa8",
  green: "#26cd58",
  greenLight: "#74df8b",
};

/* Same coin/discount icon skins used on /my-savings and /analytics */
const ICON_BG = "linear-gradient(135deg, rgba(186,224,255,0.05) 0.96154%, rgba(40,49,72,0.5) 100%)";
const COIN_OUTER = `url("data:image/svg+xml;utf8,<svg viewBox='0 0 52 52' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23g)' opacity='1'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(5.2 5.2 -5.2 10.849 0 0)'><stop stop-color='rgba(186,224,255,0.24)' offset='0'/><stop stop-color='rgba(113,137,164,0.62)' offset='0.42067'/><stop stop-color='rgba(77,93,118,0.81)' offset='0.63101'/><stop stop-color='rgba(58,71,95,0.905)' offset='0.73618'/><stop stop-color='rgba(40,49,72,1)' offset='0.84135'/></radialGradient></defs></svg>")`;
const COIN_INNER = `url("data:image/svg+xml;utf8,<svg viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23g)' opacity='1'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(4.8 4.8 -4.8 10.015 0 0)'><stop stop-color='rgba(186,224,255,0.24)' offset='0'/><stop stop-color='rgba(113,137,164,0.62)' offset='0.42067'/><stop stop-color='rgba(77,93,118,0.81)' offset='0.63101'/><stop stop-color='rgba(58,71,95,0.905)' offset='0.73618'/><stop stop-color='rgba(40,49,72,1)' offset='0.84135'/></radialGradient></defs></svg>")`;

function DiscountIcon() {
  return (
    <div style={{ flexShrink: 0, width: 52, height: 52 }}>
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 16, width: 52, height: 52, backgroundImage: ICON_BG }}>
        <div style={{ position: "absolute", left: 10, top: 12, width: 52, height: 52 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 9999, backgroundImage: COIN_OUTER, opacity: 0.72 }} />
          <div style={{ position: "absolute", top: 2, left: 2, width: 48, height: 48, borderRadius: 9999, backgroundImage: COIN_INNER }} />
          <div style={{ position: "absolute", top: 11, left: 13, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <img alt="" src="/images/savings2/discount.svg" style={{ width: 24, height: 24 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MoneyIcon() {
  return (
    <div style={{ flexShrink: 0, width: 52, height: 52 }}>
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 16, width: 52, height: 52, backgroundImage: ICON_BG }}>
        <div style={{ position: "absolute", left: 10, top: 12, width: 52, height: 52 }}>
          <img alt="" src="/images/savings2/money.svg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", maxWidth: "none" }} />
        </div>
      </div>
    </div>
  );
}

type OwnedProduct = {
  name: string;
  subtitle: string;
  amount: number;
  rate: number;
  icon: "discount" | "money";
  lifetime: string | null;
  history: { label: string; amount: number }[];
};

/* Balances/rates/lifetime totals mirror the rows on /my-savings and the
   "Счета"/"Вклады" chip totals on /analytics — history bars sum to the
   same figure as the `lifetime` badge where one is shown. */
const OWNED: Record<string, OwnedProduct> = {
  os1: {
    name: "МТС Счёт",
    subtitle: "15,5% на ежедневный остаток",
    amount: 467100,
    rate: 15.5,
    icon: "discount",
    lifetime: "+10 032 ₽",
    history: [
      { label: "фев", amount: 320 },
      { label: "май", amount: 1688 },
      { label: "июл", amount: 1500 },
      { label: "авг", amount: 1200 },
      { label: "окт", amount: 1792 },
      { label: "ноя", amount: 3532 },
    ],
  },
  os2: {
    name: "МТС Счёт",
    subtitle: "12,5% на минимальный остаток",
    amount: 30000.32,
    rate: 12.5,
    icon: "discount",
    lifetime: "+641 ₽",
    history: [
      { label: "июн", amount: 641 },
    ],
  },
  dep1: {
    name: "Вклад МТС Плюс",
    subtitle: "Пополните до 25 августа 2026",
    amount: 0,
    rate: 14.7,
    icon: "money",
    lifetime: null,
    history: [],
  },
  dep2: {
    name: "Вклад МТС Максимум",
    subtitle: "18,3%, потратьте до 15.02 ещё 38 000 ₽",
    amount: 154900,
    rate: 18.3,
    icon: "money",
    lifetime: "+2 046 ₽",
    history: [
      { label: "мар", amount: 950 },
      { label: "авг", amount: 350 },
      { label: "сен", amount: 746 },
    ],
  },
};

function formatAmount(n: number) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function formatRate(rate: number) {
  return rate.toString().replace(".", ",");
}

export default function MyProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const product = OWNED[id];

  if (!product) {
    return (
      <div className="screen" style={{ alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: S.textSecondary, fontFamily: "'MTS Compact', sans-serif" }}>Продукт не найден</p>
      </div>
    );
  }

  const yearly = (product.amount * product.rate) / 100;
  const monthly = yearly / 12;
  const daily = yearly / 365;
  const maxHistory = Math.max(1, ...product.history.map((h) => h.amount));

  return (
    <div className="phone-width page-enter" style={{ minHeight: "100svh", background: S.bgLower, display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <div style={{ background: S.bgPrimary, borderRadius: "0 0 32px 32px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", padding: "44px 20px 20px", position: "relative" }}>
          <button onClick={() => router.back()} style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, borderRadius: 12, background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <img src="/images/icon-back.svg" alt="" style={{ width: 24, height: 24 }} />
          </button>
          <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 17, color: S.textPrimary, flex: 1, textAlign: "center" }}>{product.name}</p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 0 40px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Balance card */}
        <div style={{ background: S.bgPrimary, borderRadius: 32, padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {product.icon === "discount" ? <DiscountIcon /> : <MoneyIcon />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, color: S.textSecondary, lineHeight: "18px" }}>{product.subtitle}</p>
              <p style={{ fontFamily: "'MTS Wide', sans-serif", fontWeight: 500, fontSize: 28, color: S.textPrimary, lineHeight: "32px" }}>{formatAmount(product.amount)} ₽</p>
            </div>
          </div>
          {product.lifetime && (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div style={{ background: "rgba(38,205,88,0.12)", borderRadius: 8, padding: "2px 6px" }}>
                <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 14, color: S.green, lineHeight: "20px" }}>{product.lifetime}</p>
              </div>
              <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, color: S.textPrimary, opacity: 0.72, lineHeight: "18px" }}>за всё время</p>
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 16, height: 44, fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 14, color: S.textPrimary, cursor: "pointer" }}>Пополнить</button>
            <button style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 16, height: 44, fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 14, color: S.textPrimary, cursor: "pointer" }}>Перевести</button>
          </div>
        </div>

        {/* Расчётный доход */}
        <div style={{ background: S.bgPrimary, borderRadius: 32, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontFamily: "'MTS Wide', sans-serif", fontWeight: 500, fontSize: 20, color: S.textPrimary, lineHeight: "24px" }}>Расчётный доход</p>
          {product.amount > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "В день", value: daily },
                { label: "В месяц", value: monthly },
                { label: "В год", value: yearly },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, color: S.textSecondary, lineHeight: "20px" }}>{row.label}</p>
                  <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 17, color: S.greenLight, lineHeight: "24px" }}>+{formatAmount(row.value)} ₽</p>
                </div>
              ))}
              <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 12, color: S.textSecondary, lineHeight: "16px" }}>
                Расчёт по ставке {formatRate(product.rate)}% от текущего остатка. Фактическая выплата может отличаться.
              </p>
            </div>
          ) : (
            <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, color: S.textSecondary, lineHeight: "20px" }}>
              Пополните счёт, чтобы начать получать доход по ставке до {formatRate(product.rate)}%
            </p>
          )}
        </div>

        {/* Мини-аналитика */}
        <div style={{ background: S.bgPrimary, borderRadius: 32, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontFamily: "'MTS Wide', sans-serif", fontWeight: 500, fontSize: 20, color: S.textPrimary, lineHeight: "24px" }}>Аналитика начислений</p>
            <Link href="/analytics" style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, color: S.textSecondary, lineHeight: "20px", textDecoration: "none" }}>Все →</Link>
          </div>
          {product.history.length > 0 ? (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
              {product.history.map((h, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 11, color: S.greenLight, lineHeight: "14px", whiteSpace: "nowrap" }}>{formatAmount(h.amount)}</span>
                  <div style={{ width: "100%", height: Math.max(8, Math.round((80 * h.amount) / maxHistory)), background: "linear-gradient(180deg, #26cd58 36.7%, #1d2023 100%)", borderRadius: "12px 12px 0 0" }} />
                  <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 11, color: S.textSecondary, lineHeight: "14px" }}>{h.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, color: S.textSecondary, lineHeight: "20px" }}>Начислений пока нет — появятся здесь после первой выплаты</p>
          )}
        </div>

      </div>
    </div>
  );
}
