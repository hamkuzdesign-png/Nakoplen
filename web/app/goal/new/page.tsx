"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { asset } from "@/lib/asset";

const S = {
  bgPrimary: "#1d2023",
  bgLower: "#000000",
  textPrimary: "#fafafa",
  textSecondary: "#969fa8",
  textTertiary: "#626c77",
  green: "#26cd58",
  purple: "#8f8fff",
  fieldBg: "rgba(98,108,119,0.25)",
  fieldBorder: "rgba(127,140,153,0.35)",
  accentActive: "#007cff",
};

type CategoryId = "car" | "house" | "education" | "travel" | "piggy" | "other";

/* "Недвижимость" — первая в списке и дефолтная выбранная категория. Автомобиль
   поставлен последним, чтобы при обёртке по кругу (prev = последний элемент)
   соседями домика по каруселе остались именно "Автомобиль" слева и
   "Образование" справа — как на исходном экране в Figma. */
const CATEGORIES: { id: CategoryId; label: string; illustration: string; video?: string; icon: string }[] = [
  /* webm only — no mp4 fallback. The mp4 has an opaque black background (mp4/H.264
     can't carry alpha), and browsers that can't decode alpha-webm can't be fixed with
     mix-blend-mode either (Safari doesn't apply blend modes to <video>). So instead of
     risking that black square, detectAlphaVideoSupport() below gates the video entirely —
     browsers that fail the check get the plain (genuinely transparent) PNG, never the video. */
  { id: "house",     label: "Недвижимость", illustration: asset("/images/goal/illustration-house.png"),     video: asset("/images/goal/illustration-house-video.webm"),   icon: asset("/images/goal/icon-house.png") },
  { id: "education", label: "Образование",  illustration: asset("/images/goal/illustration-education.png"), icon: asset("/images/goal/icon-education.png") },
  { id: "travel",    label: "Путешествия",  illustration: asset("/images/goal/illustration-travel.png"),    video: asset("/images/goal/illustration-travel-video.webm"),  icon: asset("/images/goal/icon-travel.png") },
  { id: "piggy",     label: "Копилка",      illustration: asset("/images/goal/illustration-piggy.png"),     video: asset("/images/goal/illustration-piggy-video.webm"),   icon: asset("/images/goal/icon-piggy.png") },
  { id: "other",     label: "Другое",       illustration: asset("/images/goal/illustration-other.png"),     icon: asset("/images/goal/icon-other.png") },
  { id: "car",       label: "Автомобиль",   illustration: asset("/images/goal/illustration-car.png"),       video: asset("/images/goal/illustration-car-video.webm"),     icon: asset("/images/goal/icon-car.png") },
];

type SourceId = "mts-schet" | "vklad-plus" | "cfa";

const SOURCES: { id: SourceId; label: string; kind: "discount" | "money" | "image" }[] = [
  { id: "mts-schet", label: "МТС Счёт ·· 4433", kind: "discount" },
  { id: "vklad-plus", label: "Вклад Плюс ·· 2211", kind: "money" },
  { id: "cfa", label: "Цифровые активы ·· 2211", kind: "image" },
];

const MONTHS_GEN = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const MONTHS_NOM = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const WEEKDAYS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

function formatAmountInput(raw: string) {
  return raw.replace(/\D/g, "").slice(0, 12).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function formatAmount(n: number) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/** 4x4 single-frame VP9 webm, every pixel red at ~50% alpha — used to test
 *  whether this browser actually *composites* webm alpha, not just whether
 *  it claims to decode VP9 at all. Recent Safari/iOS added baseline VP9
 *  hardware decode and reports canPlayType('video/webm; codecs="vp9"') as
 *  playable, but still doesn't composite the alpha track — it renders fully
 *  opaque black. That false positive is exactly what caused the black-square
 *  regression, so the real fix is decoding a known-transparent pixel and
 *  checking it, not trusting canPlayType. */
const ALPHA_TEST_WEBM =
  "data:video/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJChYECGFOAZwEAAAAAAAIVEU2bdLpNu4tTq4QVSalmU6yBoU27i1OrhBZUrmtTrIHWTbuMU6uEElTDZ1OsggEnTbuMU6uEHFO7a1OsggH/7AEAAAAAAABZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVSalmsCrXsYMPQkBNgIxMYXZmNjEuNy4xMDBXQYxMYXZmNjEuNy4xMDBEiYhARAAAAAAAABZUrmvMrgEAAAAAAABD14EBc8WICPr3Fp6iGVqcgQAitZyDdW5kiIEAhoVWX1ZQOYOBASPjg4QCYloA4JSwgQS6gQSagQJTwIEBVbCEVbmBARJUw2dAf3Nzn2PAgGfImUWjh0VOQ09ERVJEh4xMYXZmNjEuNy4xMDBzc9pjwItjxYgI+vcWnqIZWmfIpUWjh0VOQ09ERVJEh5hMYXZjNjEuMTkuMTAwIGxpYnZweC12cDlnyKFFo4hEVVJBVElPTkSHkzAwOjAwOjAwLjA0MDAwMDAwMAAfQ7Z1zueBAKDJoaeBAAAAgkmDQgAAMAA2ADgkHBiMAAAgAAAVL/+IwKb//BH////LgAB1oZ2mm+6BAaWWgkmDQgAAMAA2ADgkHBiMAAAgIABIQBxTu2uRu4+zgQC3iveBAfGCAazwgQM=";

let alphaSupportPromise: Promise<boolean> | null = null;

/** Runs the real decode-and-read-a-pixel test above exactly once per page
 *  load (cached), regardless of how many times the effect that calls this
 *  re-runs or how many category videos mount. */
function detectAlphaVideoSupport(): Promise<boolean> {
  if (alphaSupportPromise) return alphaSupportPromise;
  alphaSupportPromise = (async () => {
    try {
      const v = document.createElement("video");
      v.muted = true;
      v.playsInline = true;
      v.src = ALPHA_TEST_WEBM;
      await new Promise<void>((resolve, reject) => {
        v.addEventListener("loadeddata", () => resolve(), { once: true });
        v.addEventListener("error", () => reject(v.error), { once: true });
        setTimeout(() => reject(new Error("timeout")), 2000);
      });
      // Some browsers only decode a frame once playback has actually
      // started — drawImage on a merely-loaded, never-played video reads back blank.
      await v.play().catch(() => {});
      await new Promise((r) => setTimeout(r, 150));
      v.pause();
      const canvas = document.createElement("canvas");
      canvas.width = 4;
      canvas.height = 4;
      const ctx = canvas.getContext("2d");
      if (!ctx) return false;
      ctx.drawImage(v, 0, 0, 4, 4);
      const alpha = ctx.getImageData(1, 1, 1, 1).data[3];
      return alpha < 250;
    } catch {
      return false;
    }
  })();
  return alphaSupportPromise;
}

function buildCalendarWeeks(year: number, month: number) {
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstWeekday).fill(null)];
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/* ── small inline icons, matching the stroke-icon style already used in analytics/page.tsx ── */
function PencilIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M14.6029 4.11708C15.4177 3.41227 15.8251 3.05987 16.4788 3.00747C17.1326 2.95506 17.4972 3.18019 18.2264 3.63044C18.6421 3.88712 19.0658 4.19852 19.4335 4.56604C19.8011 4.93356 20.1126 5.35721 20.3694 5.77279C20.8198 6.50177 21.045 6.86626 20.9925 7.5198C20.9401 8.17335 20.5876 8.58061 19.8826 9.39512C19.5232 9.81034 19.1122 10.2801 18.6706 10.7759L13.2217 5.32872C13.7177 4.8872 14.1876 4.47638 14.6029 4.11708Z" fill="#FAFAFA" fillOpacity="0.72" />
      <path d="M11.7375 6.67467C11.1232 7.24337 10.5106 7.82686 9.94648 8.39079C8.44386 9.89294 6.80245 11.7392 5.67146 13.0458C5.36675 13.3978 5.12787 13.6738 4.95063 13.9264C4.62569 14.3329 4.3956 15.0901 4.04235 16.2527L3.51463 17.9895C3.03526 19.5671 2.79558 20.356 3.2199 20.7802C3.64422 21.2044 4.43329 20.9647 6.01145 20.4855L7.74876 19.958C8.98041 19.584 9.75726 19.3481 10.1441 18.9914C10.377 18.8205 10.633 18.599 10.9511 18.3238C12.2582 17.1932 14.1049 15.5523 15.6076 14.0501C16.1717 13.4862 16.7553 12.8738 17.3242 12.2596L11.7375 6.67467Z" fill="#FAFAFA" fillOpacity="0.72" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="3.5" width="11" height="10" rx="2" stroke="#FAFAFA" strokeWidth="1.3" />
      <path d="M2.5 6.5H13.5M5.5 2V4M10.5 2V4" stroke="#FAFAFA" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke="#FAFAFA" strokeWidth="1.4" />
      <path d="M10 9V14M10 6.5V6.6" stroke="#FAFAFA" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function CrossIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 4L12 12M12 4L4 12" stroke="#FAFAFA" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function CheckboxIcon({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="1" y="1" width="22" height="22" rx="7" fill={S.purple} />
        <path d="M7.5 12.3L10.3 15L16.5 8.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="1.3" y="1.3" width="21.4" height="21.4" rx="6.7" stroke="rgba(255,255,255,0.24)" strokeWidth="1.4" />
    </svg>
  );
}

/* Same coin/money icon skins as /my-savings and /my-product */
const ICON_BG = "linear-gradient(135deg, rgba(186,224,255,0.05) 0.96154%, rgba(40,49,72,0.5) 100%)";
const COIN_OUTER = `url("data:image/svg+xml;utf8,<svg viewBox='0 0 52 52' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23g)' opacity='1'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(5.2 5.2 -5.2 10.849 0 0)'><stop stop-color='rgba(186,224,255,0.24)' offset='0'/><stop stop-color='rgba(113,137,164,0.62)' offset='0.42067'/><stop stop-color='rgba(77,93,118,0.81)' offset='0.63101'/><stop stop-color='rgba(58,71,95,0.905)' offset='0.73618'/><stop stop-color='rgba(40,49,72,1)' offset='0.84135'/></radialGradient></defs></svg>")`;
const COIN_INNER = `url("data:image/svg+xml;utf8,<svg viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23g)' opacity='1'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(4.8 4.8 -4.8 10.015 0 0)'><stop stop-color='rgba(186,224,255,0.24)' offset='0'/><stop stop-color='rgba(113,137,164,0.62)' offset='0.42067'/><stop stop-color='rgba(77,93,118,0.81)' offset='0.63101'/><stop stop-color='rgba(58,71,95,0.905)' offset='0.73618'/><stop stop-color='rgba(40,49,72,1)' offset='0.84135'/></radialGradient></defs></svg>")`;

function SourceIcon({ kind }: { kind: "discount" | "money" | "image" }) {
  if (kind === "image") {
    return (
      <div style={{ flexShrink: 0, width: 52, height: 52, borderRadius: 16, overflow: "hidden", background: S.fieldBg }}>
        <img alt="" src={asset("/images/prod-tsifrovye.png")} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }
  if (kind === "money") {
    return (
      <div style={{ flexShrink: 0, width: 52, height: 52 }}>
        <div style={{ position: "relative", overflow: "hidden", borderRadius: 16, width: 52, height: 52, backgroundImage: ICON_BG }}>
          <div style={{ position: "absolute", left: 10, top: 12, width: 52, height: 52 }}>
            <img alt="" src={asset("/images/savings2/money.svg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", maxWidth: "none" }} />
          </div>
        </div>
      </div>
    );
  }
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

/* ── "Где будете копить?" bottom sheet — multi-select source picker ── */
function SourceSheet({ draft, onToggle, onConfirm, onClose }: {
  draft: Set<SourceId>; onToggle: (id: SourceId) => void; onConfirm: () => void; onClose: () => void;
}) {
  return (
    <>
      <div className="goal-sheet-overlay" onClick={onClose} />
      <div className="goal-sheet">
        <div style={{ background: S.bgPrimary, borderRadius: "32px 32px 0 0", paddingBottom: "env(safe-area-inset-bottom)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 0" }}>
            <div style={{ width: 32, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.35)" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 20px 4px" }}>
            <p style={{ fontFamily: "'MTS Wide', sans-serif", fontWeight: 500, fontSize: 20, color: S.textPrimary }}>Где будете копить?</p>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <CrossIcon />
            </button>
          </div>
          <div style={{ padding: "8px 0" }}>
            {SOURCES.map((src) => (
              <button key={src.id} onClick={() => onToggle(src.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                <SourceIcon kind={src.kind} />
                <span style={{ flex: 1, fontFamily: "'MTS Compact', sans-serif", fontSize: 17, color: S.textPrimary, lineHeight: "24px" }}>{src.label}</span>
                <CheckboxIcon checked={draft.has(src.id)} />
              </button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "8px 20px 20px" }}>
            <button onClick={onConfirm} style={{ width: "100%", background: S.purple, border: "none", borderRadius: 16, height: 52, cursor: "pointer" }}>
              <span style={{ fontFamily: "'MTS Wide', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.6px", textTransform: "uppercase", color: "#fff" }}>Выбрать</span>
            </button>
            <button onClick={onClose} style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 16, height: 52, cursor: "pointer" }}>
              <span style={{ fontFamily: "'MTS Wide', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.6px", textTransform: "uppercase", color: S.textPrimary }}>Открыть новый</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── calendar bottom sheet — picks the target date for the goal ── */
function CalendarSheet({ month, onPrevMonth, onNextMonth, onPickDay, onClose, selected }: {
  month: Date; onPrevMonth: () => void; onNextMonth: () => void; onPickDay: (day: number) => void; onClose: () => void; selected: Date | null;
}) {
  const weeks = buildCalendarWeeks(month.getFullYear(), month.getMonth());
  const today = new Date();
  return (
    <>
      <div className="goal-sheet-overlay" onClick={onClose} />
      <div className="goal-sheet">
        <div style={{ background: S.bgPrimary, borderRadius: "32px 32px 0 0", paddingBottom: "calc(20px + env(safe-area-inset-bottom))" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 0" }}>
            <div style={{ width: 32, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.35)" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px 12px" }}>
            <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 20, color: S.textPrimary }}>{MONTHS_NOM[month.getMonth()]} {month.getFullYear()}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onPrevMonth} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <img src={asset("/images/icon-back.svg")} alt="" style={{ width: 20, height: 20 }} />
              </button>
              <button onClick={onNextMonth} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <img src={asset("/images/icon-back.svg")} alt="" style={{ width: 20, height: 20, transform: "scaleX(-1)" }} />
              </button>
            </div>
          </div>
          <div style={{ display: "flex", padding: "0 20px 4px" }}>
            {WEEKDAYS.map((w) => (
              <div key={w} style={{ flex: 1, textAlign: "center", fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 12, color: S.textTertiary }}>{w}</div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", padding: "0 20px 8px" }}>
            {weeks.map((week, wi) => (
              <div key={wi} style={{ display: "flex" }}>
                {week.map((day, di) => {
                  const isSelected = day !== null && selected && selected.getFullYear() === month.getFullYear() && selected.getMonth() === month.getMonth() && selected.getDate() === day;
                  const isToday = day !== null && today.getFullYear() === month.getFullYear() && today.getMonth() === month.getMonth() && today.getDate() === day;
                  return (
                    <div key={di} style={{ flex: 1, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {day !== null && (
                        <button onClick={() => onPickDay(day)} style={{
                          width: 32, height: 32, borderRadius: "50%", border: "none", cursor: "pointer",
                          background: isSelected ? S.purple : "transparent",
                          color: isSelected ? "#fff" : isToday ? S.purple : S.textPrimary,
                          fontFamily: "'MTS Compact', sans-serif", fontSize: 15,
                        }}>{day}</button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── success card — matches Figma's "Modal Card Graphic 2.0" ── */
function SuccessCard({ onTopUp, onGoToSavings }: { onTopUp: () => void; onGoToSavings: () => void }) {
  return (
    <>
      <div className="goal-sheet-overlay" />
      <div className="goal-sheet">
        <div style={{ background: S.bgPrimary, borderRadius: 32, margin: "0 8px calc(8px + env(safe-area-inset-bottom))", padding: "32px 20px 20px", display: "flex", flexDirection: "column", gap: 32, alignItems: "center" }}>
          <div style={{ width: 120, height: 120, position: "relative" }}>
            <img alt="" src={asset("/images/goal/success-check.png")} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
            <p style={{ fontFamily: "'MTS Wide', sans-serif", fontWeight: 500, fontSize: 20, color: S.textPrimary, textAlign: "center" }}>Цель создана</p>
            <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 17, color: S.textSecondary, textAlign: "center", lineHeight: "24px" }}>Доступна в разделе накоплений и в привязанных счетах</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            <button onClick={onTopUp} style={{ width: "100%", height: 52, background: S.purple, border: "none", borderRadius: 16, cursor: "pointer" }}>
              <span style={{ fontFamily: "'MTS Wide', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.6px", textTransform: "uppercase", color: "#fff" }}>Пополнить</span>
            </button>
            <button onClick={onGoToSavings} style={{ width: "100%", height: 52, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 16, cursor: "pointer" }}>
              <span style={{ fontFamily: "'MTS Wide', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.6px", textTransform: "uppercase", color: S.textPrimary }}>В накопления</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function NewGoalPage() {
  const router = useRouter();
  const [categoryIdx, setCategoryIdx] = useState(0); // "Недвижимость" — дефолт из макета Figma
  const [amountRaw, setAmountRaw] = useState("");
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [selectedSources, setSelectedSources] = useState<Set<SourceId>>(new Set());
  const [sourceSheetOpen, setSourceSheetOpen] = useState(false);
  const [draftSources, setDraftSources] = useState<Set<SourceId>>(new Set());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [created, setCreated] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);
  const [amountWidth, setAmountWidth] = useState(0);
  const amountMeasureRef = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dragStartX = useRef<number | null>(null);
  /* Starts false (matches the server-rendered PNG, avoiding a hydration
     mismatch) and flips true once detectAlphaVideoSupport() confirms this
     browser actually composites webm alpha, not just that it can play VP9. */
  const [canShowVideo, setCanShowVideo] = useState(false);
  useEffect(() => {
    let cancelled = false;
    detectAlphaVideoSupport().then((ok) => {
      if (!cancelled) setCanShowVideo(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /* Measures the rendered pixel width of the typed digits (via a hidden
     twin span, since "ch" units don't match a proportional font's actual
     glyph widths) so the input can be sized exactly to its content — that's
     what makes the ₽ sign sit right after the amount instead of the row's edge. */
  useEffect(() => {
    if (amountMeasureRef.current) setAmountWidth(amountMeasureRef.current.offsetWidth);
  }, [amountRaw]);

  const category = CATEGORIES[categoryIdx];
  const prevCategory = CATEGORIES[(categoryIdx + CATEGORIES.length - 1) % CATEGORIES.length];
  const nextCategory = CATEGORIES[(categoryIdx + 1) % CATEGORIES.length];
  const showVideo = !!category.video && canShowVideo;
  const amountNum = Number(amountRaw.replace(/\s/g, "")) || 0;
  /* Amount + savings source are required; target date stays optional
     (defaults to the end of the year — see effectiveTarget below). */
  const canCreate = amountNum > 0 && selectedSources.size > 0;

  /* Some browsers won't honour the `autoPlay` attribute on a freshly (re)mounted
     <video> — e.g. after client-side navigation or a category switch — so we
     also kick playback explicitly and swallow the rejection if autoplay is
     blocked (it'll just show the poster frame instead of erroring). */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play()?.catch(() => {});
  }, [showVideo]);

  const now = new Date();
  const effectiveTarget = targetDate ?? new Date(now.getFullYear(), 11, 31);
  const monthsRemaining = Math.max(1, Math.ceil((effectiveTarget.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
  const perMonth = amountNum / monthsRemaining;
  const dateLabelText = targetDate ? `до ${targetDate.getDate()} ${MONTHS_GEN[targetDate.getMonth()]} ${targetDate.getFullYear()} года` : `до конца ${now.getFullYear()} года`;
  const datePillLabel = targetDate ? `до ${targetDate.getDate()} ${MONTHS_GEN[targetDate.getMonth()]} ${targetDate.getFullYear()}` : "Добавить дату";

  function openSourceSheet() {
    setDraftSources(new Set(selectedSources));
    setSourceSheetOpen(true);
  }
  function toggleDraft(id: SourceId) {
    setDraftSources((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function confirmSources() {
    setSelectedSources(new Set(draftSources));
    setSourceSheetOpen(false);
  }

  /* Swipe left/right over the illustration switches goal category — the
     small dots below are now display-only, mirroring the pattern already
     used for the catalog carousel's manual swipe. */
  function onIllustrationPointerDown(e: PointerEvent<HTMLDivElement>) {
    dragStartX.current = e.clientX;
  }
  function onIllustrationPointerUp(e: PointerEvent<HTMLDivElement>) {
    if (dragStartX.current == null) return;
    const dx = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(dx) < 40) return;
    setCategoryIdx((i) => (dx < 0 ? (i + 1) % CATEGORIES.length : (i + CATEGORIES.length - 1) % CATEGORIES.length));
  }

  function openCalendar() {
    setCalendarMonth(new Date((targetDate ?? now).getFullYear(), (targetDate ?? now).getMonth(), 1));
    setCalendarOpen(true);
  }
  function pickDay(day: number) {
    setTargetDate(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day));
    setCalendarOpen(false);
  }

  function sourceFieldLabel() {
    if (selectedSources.size === 0) return null;
    if (selectedSources.size === 1) return SOURCES.find((s) => s.id === [...selectedSources][0])!.label;
    return `Выбрано ${selectedSources.size} продукта`;
  }

  return (
    <div className="phone-width" style={{ minHeight: "100svh", background: S.bgLower, position: "relative" }}>
      {/* Animated wrapper — kept separate from the fixed sheets below so its
          transform doesn't create a containing block that breaks position:fixed */}
      <div className="page-enter" style={{ minHeight: "100svh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <div className="top-gradient" />

      {/* ── header: back, title + edit, date pill, illustration, category picker ── */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 16 }}>
        <div style={{ display: "flex", width: "100%", padding: "44px 20px 0" }}>
          <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", border: "none", borderRadius: 12, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <img src={asset("/images/icon-back.svg")} alt="" style={{ width: 24, height: 24 }} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center", paddingTop: 12 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <p style={{ fontFamily: "'MTS Wide', sans-serif", fontWeight: 500, fontSize: 24, color: S.textPrimary }}>{category.label}</p>
            <button onClick={() => setCategoryIdx((i) => (i + 1) % CATEGORIES.length)} style={{ background: "none", border: "none", borderRadius: 12, cursor: "pointer", padding: "8px 0", display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Сменить категорию цели">
              <PencilIcon />
            </button>
          </div>
          <button onClick={openCalendar} style={{ display: "flex", gap: 6, alignItems: "center", background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12, padding: "8px 12px", cursor: "pointer" }}>
            <CalendarIcon />
            <span style={{ fontFamily: "'MTS Wide', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.5px", textTransform: "uppercase", color: S.textPrimary }}>{datePillLabel}</span>
          </button>
        </div>

        <div
          onPointerDown={onIllustrationPointerDown}
          onPointerUp={onIllustrationPointerUp}
          style={{ display: "flex", gap: 20, alignItems: "center", justifyContent: "center", width: "100%", padding: "0", touchAction: "pan-y" }}
        >
          <img alt="" src={prevCategory.illustration} style={{ width: 118, height: 118, opacity: 0.3, objectFit: "contain", flexShrink: 0 }} />
          {showVideo ? (
            <video
              key={category.id}
              ref={videoRef}
              autoPlay loop muted playsInline
              poster={category.illustration}
              style={{ width: 260, height: 260, objectFit: "contain", flexShrink: 0 }}
            >
              <source src={category.video} type="video/webm" />
            </video>
          ) : (
            /* Same 260px box as the video so switching categories never changes
               the illustration row's height — that's what was making the bottom
               block and the dots jump up and down. */
            <img alt="" src={category.illustration} style={{ width: 260, height: 260, objectFit: "contain", flexShrink: 0 }} />
          )}
          <img alt="" src={nextCategory.illustration} style={{ width: 104, height: 104, opacity: 0.3, objectFit: "contain", transform: "scaleX(-1)", flexShrink: 0 }} />
        </div>

        {/* Display-only — switching category is done by swiping the illustration above, not by tapping a dot. */}
        <div style={{ display: "flex", gap: 5, alignItems: "center", marginTop: -38, paddingBottom: 4 }}>
          {CATEGORIES.map((c, i) => {
            const isSelected = i === categoryIdx;
            const size = isSelected ? 22 : 14;
            return (
              <div key={c.id} style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", opacity: isSelected ? 1 : 0.7, flexShrink: 0, transition: "width 0.2s, height 0.2s" }}>
                <img alt="" src={c.icon} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── card content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", background: S.bgPrimary, borderRadius: "32px 32px 0 0", position: "relative", zIndex: 1, padding: "20px 0 calc(20px + env(safe-area-inset-bottom))" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* amount field */}
          <div style={{ padding: "0 20px" }}>
            <div style={{ background: S.fieldBg, border: `1px solid ${amountFocused ? S.accentActive : S.fieldBorder}`, borderRadius: 16, height: 64, boxSizing: "border-box", padding: "0 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 2, transition: "border-color 0.15s ease" }}>
              {amountRaw && <label htmlFor="goal-amount" style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, color: S.textSecondary }}>Сколько нужно накопить?</label>}
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <input
                  id="goal-amount"
                  className="goal-amount-input"
                  value={amountRaw}
                  onChange={(e) => setAmountRaw(formatAmountInput(e.target.value))}
                  onFocus={() => setAmountFocused(true)}
                  onBlur={() => setAmountFocused(false)}
                  placeholder="Сколько нужно накопить?"
                  inputMode="numeric"
                  style={{
                    background: "transparent", border: "none", outline: "none", color: S.textPrimary,
                    fontFamily: "'MTS Compact', sans-serif", fontSize: 17, lineHeight: "24px", padding: 0,
                    /* Sized to the digits themselves (not the full row) so the ₽ sign
                       sticks right after the amount instead of floating at the row's edge. */
                    width: amountRaw ? amountWidth : "100%",
                    flexShrink: 0,
                  }}
                />
                {/* Hidden twin of the input's text, used only to measure its exact rendered width */}
                <span ref={amountMeasureRef} aria-hidden style={{ position: "absolute", visibility: "hidden", whiteSpace: "pre", fontFamily: "'MTS Compact', sans-serif", fontSize: 17, lineHeight: "24px" }}>
                  {amountRaw}
                </span>
                {amountRaw && <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 17, color: S.textPrimary, flexShrink: 0 }}>₽</span>}
              </div>
            </div>
          </div>

          {/* source field */}
          <div style={{ padding: "0 20px" }}>
            <button onClick={openSourceSheet} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: S.fieldBg, border: `1px solid ${S.fieldBorder}`, borderRadius: 16, padding: "10px 12px", cursor: "pointer" }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(98,108,119,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <img alt="" src={asset("/images/savings2/goal.svg")} style={{ width: 24, height: 24, opacity: 0.7 }} />
              </div>
              <span style={{ flex: 1, textAlign: "left", fontFamily: "'MTS Compact', sans-serif", fontSize: 17, color: sourceFieldLabel() ? S.textPrimary : S.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {sourceFieldLabel() ?? "Где будете копить?"}
              </span>
              <img src={asset("/images/icon-chevron-down.svg")} alt="" style={{ width: 24, height: 24, flexShrink: 0 }} />
            </button>
          </div>

          {/* status banner */}
          {amountNum > 0 && (
            <div style={{ margin: "0 20px", background: "rgba(127,140,153,0.35)", borderRadius: 16, padding: 12, display: "flex", gap: 8 }}>
              <div style={{ flexShrink: 0 }}><InfoIcon /></div>
              <p style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 14, color: S.textPrimary, lineHeight: "20px" }}>
                Пополняйте на <span style={{ color: S.green }}>{formatAmount(perMonth)} ₽</span> в месяц, чтобы закрыть цель {dateLabelText}
              </p>
            </div>
          )}
        </div>

        {/* CTA — прижата к низу карточки; активна только когда указаны сумма и источник */}
        <div style={{ padding: "12px 20px 0" }}>
          <button
            onClick={() => canCreate && setCreated(true)}
            disabled={!canCreate}
            style={{ width: "100%", height: 52, background: S.purple, opacity: canCreate ? 1 : 0.4, border: "none", borderRadius: 16, cursor: canCreate ? "pointer" : "default" }}
          >
            <span style={{ fontFamily: "'MTS Wide', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.6px", textTransform: "uppercase", color: "#fff" }}>Создать цель</span>
          </button>
        </div>
      </div>
      </div>

      {sourceSheetOpen && (
        <SourceSheet draft={draftSources} onToggle={toggleDraft} onConfirm={confirmSources} onClose={() => setSourceSheetOpen(false)} />
      )}
      {calendarOpen && (
        <CalendarSheet
          month={calendarMonth}
          selected={targetDate}
          onPrevMonth={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
          onNextMonth={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
          onPickDay={pickDay}
          onClose={() => setCalendarOpen(false)}
        />
      )}
      {created && (
        <SuccessCard onTopUp={() => router.push("/my-savings")} onGoToSavings={() => router.push("/my-savings")} />
      )}
    </div>
  );
}
