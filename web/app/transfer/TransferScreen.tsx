"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { asset } from "@/lib/asset";
import { OWNED } from "@/app/my-product/[id]/data";

const S = {
  bgLower: "#000000",
  bgPrimary: "#1d2023",
  textPrimary: "#fafafa",
  textSecondary: "#969fa8",
  purple: "#8f8fff",
  red: "#ff5c5c",
  green: "#26cd58",
};

/* Same coin/discount icon skins as /my-savings, /my-product, /goal/new */
const ICON_BG = "linear-gradient(135deg, rgba(186,224,255,0.05) 0.96154%, rgba(40,49,72,0.5) 100%)";
const COIN_OUTER = `url("data:image/svg+xml;utf8,<svg viewBox='0 0 52 52' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23g)' opacity='1'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(5.2 5.2 -5.2 10.849 0 0)'><stop stop-color='rgba(186,224,255,0.24)' offset='0'/><stop stop-color='rgba(113,137,164,0.62)' offset='0.42067'/><stop stop-color='rgba(77,93,118,0.81)' offset='0.63101'/><stop stop-color='rgba(58,71,95,0.905)' offset='0.73618'/><stop stop-color='rgba(40,49,72,1)' offset='0.84135'/></radialGradient></defs></svg>")`;
const COIN_INNER = `url("data:image/svg+xml;utf8,<svg viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23g)' opacity='1'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(4.8 4.8 -4.8 10.015 0 0)'><stop stop-color='rgba(186,224,255,0.24)' offset='0'/><stop stop-color='rgba(113,137,164,0.62)' offset='0.42067'/><stop stop-color='rgba(77,93,118,0.81)' offset='0.63101'/><stop stop-color='rgba(58,71,95,0.905)' offset='0.73618'/><stop stop-color='rgba(40,49,72,1)' offset='0.84135'/></radialGradient></defs></svg>")`;

const CHIPS = [500, 1000, 2000, 5000, 10000];

/* Card account — same "МТС Деньги ·· 0015" balance shown on /open-cashbox.
   Figma labels it ·· 0012 on this screen, but we mesh with the number
   already used elsewhere in the prototype for consistency. */
const CARD_ACCOUNT = { label: "МТС Деньги ·· 0015", amount: 112000.32 };

const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [",", "0", "back"],
];

function DiscountIcon() {
  return (
    <div style={{ flexShrink: 0, width: 52, height: 52 }}>
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 16, width: 52, height: 52, backgroundImage: ICON_BG }}>
        <div style={{ position: "absolute", left: 10, top: 12, width: 52, height: 52 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 9999, backgroundImage: COIN_OUTER, opacity: 0.72 }} />
          <div style={{ position: "absolute", top: 2, left: 2, width: 48, height: 48, borderRadius: 9999, backgroundImage: COIN_INNER }} />
          <div style={{ position: "absolute", top: 11, left: 13, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <img alt="" src={asset("/images/savings2/discount.svg")} style={{ width: 24, height: 24 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CardIcon() {
  return (
    <div className="cb-field-icon"><img src={asset("/images/chip-card.png")} alt="" /></div>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="#969FA8" strokeWidth="1.3" />
      <path d="M8 7.2V11.2M8 5.2V5.3" stroke="#969FA8" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function BackspaceIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M9 6H19a1 1 0 011 1v10a1 1 0 01-1 1H9l-6-6 6-6z" stroke="#FAFAFA" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M13 10.5L17 14.5M17 10.5L13 14.5" stroke="#FAFAFA" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function CalculatorIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="3" width="14" height="18" rx="2.5" stroke="#FAFAFA" strokeWidth="1.4" />
      <path d="M8 7.5H16" stroke="#FAFAFA" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8.2" cy="12" r="0.9" fill="#FAFAFA" />
      <circle cx="12" cy="12" r="0.9" fill="#FAFAFA" />
      <circle cx="15.8" cy="12" r="0.9" fill="#FAFAFA" />
      <circle cx="8.2" cy="15.5" r="0.9" fill="#FAFAFA" />
      <circle cx="12" cy="15.5" r="0.9" fill="#FAFAFA" />
      <circle cx="15.8" cy="15.5" r="0.9" fill="#FAFAFA" />
    </svg>
  );
}

/* "123 456" / "123 456,78" — grouped thousands, decimals kept as typed */
function formatDisplay(raw: string) {
  if (!raw) return "0";
  const [intPart, decPart] = raw.split(",");
  const grouped = (intPart || "0").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return decPart !== undefined ? `${grouped},${decPart}` : grouped;
}

function formatBalance(n: number) {
  const rounded = Math.round(n * 100) / 100;
  const [intPart, decPart] = rounded.toString().split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return decPart ? `${grouped},${decPart.padEnd(2, "0")}` : grouped;
}

type Direction = "withdraw" | "topup";

/* "withdraw" — savings account → card, same screen as the /my-savings "Перевести" button.
   "topup"    — card → savings account, same screen as the /my-savings "Пополнить" button.
   Both reuse the same "Между своими" layout from Figma, just with the two
   Source Selection fields (and CTA copy) swapped. */
export default function TransferScreen({ direction }: { direction: Direction }) {
  const router = useRouter();
  const savingsAccount = OWNED["os1"]; // МТС Счёт ·· 4433 — same balance shown on /my-savings
  const [amountRaw, setAmountRaw] = useState("");
  const [done, setDone] = useState(false);

  const from = direction === "withdraw"
    ? { label: `${savingsAccount.name} ·· 4433`, amount: savingsAccount.amount, icon: <DiscountIcon /> }
    : { label: CARD_ACCOUNT.label, amount: CARD_ACCOUNT.amount, icon: <CardIcon /> };
  const to = direction === "withdraw"
    ? { label: CARD_ACCOUNT.label, amount: CARD_ACCOUNT.amount, icon: <CardIcon /> }
    : { label: `${savingsAccount.name} ·· 4433`, amount: savingsAccount.amount, icon: <DiscountIcon /> };

  const ctaLabel = direction === "withdraw" ? "Перевести" : "Пополнить";
  const doneTitle = direction === "withdraw" ? "Перевод выполнен" : "Счёт пополнен";
  const doneVerb = direction === "withdraw" ? "переведено на" : "зачислено на";

  const amountNum = parseFloat(amountRaw.replace(",", ".")) || 0;
  const maxAllowed = Math.min(1000000, from.amount);
  const overLimit = amountNum > maxAllowed;
  const valid = amountNum >= 10 && !overLimit;

  function pressKey(key: string) {
    if (key === "back") {
      setAmountRaw((prev) => prev.slice(0, -1));
      return;
    }
    if (key === ",") {
      setAmountRaw((prev) => (prev.includes(",") ? prev : `${prev || "0"},`));
      return;
    }
    setAmountRaw((prev) => {
      const decPart = prev.split(",")[1];
      if (decPart && decPart.length >= 2) return prev; // max 2 decimal digits
      if (prev.replace(",", "").replace(/^0+/, "").length >= 9) return prev; // sane cap
      if (prev === "0") return key; // don't leave a stray leading zero (e.g. after "0," → backspace → digit)
      return `${prev}${key}`;
    });
  }

  function addChip(value: number) {
    const next = Math.min(maxAllowed, amountNum + value);
    setAmountRaw(next % 1 === 0 ? String(next) : String(next).replace(".", ","));
  }

  return (
    <div className="phone-width" style={{ minHeight: "100svh", background: S.bgLower, position: "relative" }}>
      <div className="page-enter" style={{ minHeight: "100svh", display: "flex", flexDirection: "column", position: "relative" }}>

        {/* ── Navbar ── */}
        <div style={{ display: "flex", alignItems: "center", padding: "44px 20px 16px", position: "relative" }}>
          <button onClick={() => router.back()} style={{ position: "absolute", left: 20, background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", border: "none", borderRadius: 12, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} aria-label="Назад">
            <img src={asset("/images/icon-back.svg")} alt="" style={{ width: 24, height: 24 }} />
          </button>
          <p style={{ flex: 1, textAlign: "center", fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 17, color: S.textPrimary }}>Между своими</p>
        </div>

        {/* ── From / To fields ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "8px 20px" }}>
          <div className="cb-field">
            {from.icon}
            <div className="cb-field-text">
              <p className="cb-field-caption">с {from.label}</p>
              <p className="cb-field-value">{formatBalance(from.amount)} ₽</p>
            </div>
          </div>
          <div className="cb-field">
            {to.icon}
            <div className="cb-field-text">
              <p className="cb-field-caption">на {to.label}</p>
              <p className="cb-field-value">{formatBalance(to.amount)} ₽</p>
            </div>
          </div>
        </div>

        {/* ── Amount ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center", padding: "24px 20px 8px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="tr-cursor" />
            <p style={{ fontFamily: "'MTS Wide', sans-serif", fontWeight: 500, fontSize: 32, lineHeight: "36px", color: amountRaw ? S.textPrimary : S.textSecondary }}>{formatDisplay(amountRaw)}</p>
            <p style={{ fontFamily: "'MTS Wide', sans-serif", fontWeight: 500, fontSize: 32, lineHeight: "36px", color: S.textPrimary, paddingLeft: 4 }}>₽</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, minHeight: 24 }}>
            <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, lineHeight: "20px", color: overLimit ? S.red : S.textSecondary, textAlign: "center" }}>
              {overLimit ? "Недостаточно средств на счёте" : "Сумма от 10 ₽ до 1 000 000 ₽"}
            </p>
            {!overLimit && <InfoIcon />}
          </div>
        </div>

        {/* ── Quick chips ── */}
        <div style={{ display: "flex", gap: 8, padding: "8px 20px", overflowX: "auto" }} className="tr-chip-row">
          {CHIPS.map((v) => (
            <button key={v} onClick={() => addChip(v)} style={{ flexShrink: 0, background: "rgba(127,140,153,0.35)", border: "none", borderRadius: 16, padding: 12, cursor: "pointer" }}>
              <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, color: S.textPrimary, whiteSpace: "nowrap" }}>+{v.toLocaleString("ru-RU")} ₽</span>
            </button>
          ))}
        </div>

        {/* ── Keyboard + CTA ── */}
        <div style={{ background: S.bgPrimary, borderRadius: "32px 32px 0 0", paddingBottom: "env(safe-area-inset-bottom)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "16px 20px" }}>
            {KEYS.map((row, ri) => (
              <div key={ri} style={{ display: "flex", gap: 8 }}>
                {row.map((key) => (
                  <button
                    key={key}
                    className="tr-key"
                    onClick={() => pressKey(key)}
                    style={{ flex: 1, height: 48, background: "none", border: "none", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                  >
                    {key === "back" ? <BackspaceIcon /> : (
                      <span style={{ fontFamily: "'MTS Wide', sans-serif", fontWeight: 500, fontSize: 24, lineHeight: "28px", color: S.textPrimary }}>{key}</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, padding: "0 20px 20px", alignItems: "center" }}>
            <button
              onClick={() => valid && setDone(true)}
              disabled={!valid}
              style={{ flex: 1, height: 52, background: S.purple, opacity: valid ? 1 : 0.4, border: "none", borderRadius: 16, cursor: valid ? "pointer" : "default" }}
            >
              <span style={{ fontFamily: "'MTS Wide', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.6px", textTransform: "uppercase", color: "#fff" }}>{ctaLabel}</span>
            </button>
            <button style={{ width: 52, height: 52, flexShrink: 0, background: "rgba(127,140,153,0.35)", border: "none", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} aria-label="Калькулятор">
              <CalculatorIcon />
            </button>
          </div>
        </div>
      </div>

      {done && (
        <>
          <div className="goal-sheet-overlay" onClick={() => router.push("/my-savings")} />
          <div className="goal-sheet">
            <div style={{ background: S.bgPrimary, borderRadius: 32, margin: "0 8px calc(8px + env(safe-area-inset-bottom))", padding: "32px 20px 20px", display: "flex", flexDirection: "column", gap: 32, alignItems: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(38,205,88,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M8 16.5L13.5 22L24 10" stroke={S.green} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                <p style={{ fontFamily: "'MTS Wide', sans-serif", fontWeight: 500, fontSize: 20, color: S.textPrimary, textAlign: "center" }}>{doneTitle}</p>
                <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 17, color: S.textSecondary, textAlign: "center", lineHeight: "24px" }}>
                  {formatDisplay(amountRaw)} ₽ {doneVerb} {to.label}
                </p>
              </div>
              <button onClick={() => router.push("/my-savings")} style={{ width: "100%", height: 52, background: S.purple, border: "none", borderRadius: 16, cursor: "pointer" }}>
                <span style={{ fontFamily: "'MTS Wide', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.6px", textTransform: "uppercase", color: "#fff" }}>Готово</span>
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        .tr-cursor {
          width: 2px;
          align-self: stretch;
          background: ${S.textPrimary};
          border-radius: 1px;
          margin-right: 2px;
          animation: trBlink 1s step-start infinite;
        }
        @keyframes trBlink { 50% { opacity: 0; } }
        .tr-key:active { background: rgba(255,255,255,0.08); }
        .tr-chip-row::-webkit-scrollbar { display: none; }
        .tr-chip-row { scrollbar-width: none; }
      `}</style>
    </div>
  );
}
