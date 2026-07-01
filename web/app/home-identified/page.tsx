"use client";
import { useState } from "react";
import Link from "next/link";

const S = {
  bgPrimary:   "#1d2023",
  bgLower:     "#000000",
  bgSecondary: "rgba(98,108,119,0.25)",
  textPrimary:   "#fafafa",
  textSecondary: "#969fa8",
  textTertiary:  "#626c77",
  green:    "#26cd58",
  red:      "#ff0032",
  yellow:   "#fad67d",
  white:    "#ffffff",
  tabInactive: "rgba(255,255,255,0.46)",
};

/* ── images ── */
const img = {
  bell:       "/images/home/box0.svg",
  search:     "/images/home/box1.svg",
  star:       "/images/home/box2.svg",
  close:      "/images/home/box3.svg",
  transfer:   "/images/home/box4.svg",
  qr:         "/images/home/box5.svg",
  mirStar:    "/images/home/box6.svg",
  warn:       "/images/home/box7.svg",
  heart:      "/images/home/box8.svg",
  chevron:    "/images/home/box9.svg",
  drop:       "/images/home/box10.svg",
  card:       "/images/home/box12.svg",
  notif:      "/images/home/notification.svg",
  mir:        "/images/home/mir-logo.svg",
  promo:      "/images/home/promo-card.png",
  arrowUp:    "/images/home/box13.svg",
  card3d1:    "/images/home/card3d-1.png",
  card3d2:    "/images/home/card3d-2.png",
  card3d3:    "/images/home/card3d-3.png",
  card3d4:    "/images/home/card3d-4.png",
  usaFlag:    "/images/home/usa-flag.png",
  tabHome:    "/images/home/layout0.svg",
  tabPay:     "/images/home/layout1.svg",
  tabHist:    "/images/home/layout2.svg",
  tabProd:    "/images/home/layout3.svg",
  tabMore:    "/images/home/layout4.svg",
  savingsEmptyBox: "/images/home/tile-savings-empty-box.png",
  flexEmpty:  "/images/home/tile-flex-empty.png",
  loansEmpty: "/images/home/tile-loans-empty.png",
  investEmpty: "/images/home/tile-invest-empty.png",
  plusCircle: "/images/home/icon-plus-circle.svg",
  wifi:       "/images/icon-wifi.svg",
  cell:       "/images/icon-cell.svg",
  battery:    "/images/icon-battery.svg",
  sbp:        "/images/home/icon-sbp.png",
};

/* state: "product" — уже есть продукт (тёмная карточка, без рамки, сумма)
          "cta"     — нет продукта (карточка с рамкой, белый фон иконки, кнопка +, подпись) */
const TILES = [
  { label: "Дебетовые карты", count: "2", amount: "16 106 ₽", subtitle: null,            src: "/images/home/tiles/debit.png",        href: null,        state: "product" },
  { label: "Кредитные карты", count: "1", amount: "532 144 ₽", subtitle: null,            src: "/images/home/tiles/credit-cards.png", href: null,        state: "product" },
  { label: "МТС Флекс",       count: null, amount: null,       subtitle: "оплата частями", src: img.flexEmpty,                         href: null,        state: "cta" },
  { label: "Кредиты и займы", count: null, amount: null,       subtitle: "до 5 000 000 ₽", src: img.loansEmpty,                        href: null,        state: "cta" },
  { label: "Накопления",      count: null, amount: null,       subtitle: "до 21%",         src: img.savingsEmptyBox,                   href: "/catalog", state: "cta" },
  { label: "Инвестиции",      count: null, amount: null,       subtitle: "комиссия от 0,04%", src: img.investEmpty,                    href: null,        state: "cta" },
];

/* ── tiny reusables ── */
function Icon({ src, size = 24 }: { src: string; size?: number }) {
  return (
    <div style={{ position: "relative", flexShrink: 0, width: size, height: size }}>
      <img alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", maxWidth: "none" }} src={src} />
    </div>
  );
}

export default function HomeIdentifiedPage() {
  const [promoClosed, setPromoClosed] = useState(false);

  return (
    <div className="page-enter phone-width" style={{ height: "calc(100svh - env(safe-area-inset-top) - env(safe-area-inset-bottom))", paddingTop: "env(safe-area-inset-top)", display: "flex", flexDirection: "column", background: "#000", overflow: "hidden", position: "relative" }}>

      {/* ─── scrollable area ─── */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", paddingBottom: 86, background: "#000000" }}>

        <div style={{ background: S.bgLower }}>

        {/* NAVBAR */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 20px 8px" }}>
          {/* Bell */}
          <div style={{ background: S.bgPrimary, display: "flex", alignItems: "center", justifyContent: "center", padding: 10, borderRadius: 16, flexShrink: 0, position: "relative" }}>
            <Icon src={img.bell} size={24} />
            <div style={{ position: "absolute", top: 2, right: 2, width: 6, height: 6 }}>
              <img alt="" style={{ width: "100%", height: "100%" }} src={img.notif} />
            </div>
          </div>
          {/* Search */}
          <div style={{ background: S.bgPrimary, display: "flex", alignItems: "center", justifyContent: "center", padding: 10, borderRadius: 16, flexShrink: 0 }}>
            <Icon src={img.search} size={24} />
          </div>
          {/* МТС Premium pill */}
          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
            <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 10px 4px 8px", borderRadius: 16, flexShrink: 0, backgroundImage: "linear-gradient(19.92deg, rgb(155,213,255) 6.25%, rgb(155,147,255) 44.27%, rgb(154,141,255) 58.33%, rgb(124,134,254) 84.9%)" }}>
              <Icon src={img.star} size={24} />
              <span style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 17, color: S.white, lineHeight: "24px", whiteSpace: "nowrap" }}>15 083</span>
            </div>
          </div>
        </div>
        </div>

        {/* PROMO BANNER */}
        {!promoClosed && (
          <div style={{ padding: "8px 20px" }}>
            <div style={{ borderRadius: 20, overflow: "hidden", height: 120, display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", backgroundImage: "linear-gradient(125.29deg, rgb(101,35,223) 0%, rgb(181,160,255) 100%)" }}>
              {/* Close */}
              <div style={{ position: "absolute", top: 12, right: 12, zIndex: 3, width: 24, height: 24, cursor: "pointer" }} onClick={() => setPromoClosed(true)}>
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", backdropFilter: "blur(1.5px)", background: "rgba(187,193,199,0.4)" }} />
                <div style={{ position: "absolute", top: 4, left: 4, width: 16, height: 16 }}>
                  <img alt="" style={{ width: "100%", height: "100%" }} src={img.close} />
                </div>
              </div>
              {/* Text */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, padding: "16px 8px 16px 20px", zIndex: 2, minWidth: 196 }}>
                <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 17, color: S.white, lineHeight: "20px" }}>Кредитная карта МТС Деньги</p>
                <p style={{ fontFamily: "'MTS Compact'", fontWeight: 400, fontSize: 14, color: S.white, lineHeight: "20px" }}>111 дней без процентов</p>
              </div>
              {/* Image */}
              <div style={{ width: 120, height: "100%", flexShrink: 0, position: "relative", marginRight: -1 }}>
                <img alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }} src={img.promo} />
              </div>
            </div>
          </div>
        )}

        {/* QUICK ACTIONS */}
        <div style={{ display: "flex", gap: 4, padding: "8px 20px" }}>
          {[
            { src: img.transfer, label: "Между\nсвоими",       isSbp: false },
            { src: img.sbp,      label: "Оплата мобильного",   isSbp: true  },
            { src: img.qr,       label: "Оплата\nпо QR",       isSbp: false },
          ].map((a) => (
            <div key={a.label} style={{ flex: 1, background: S.bgPrimary, borderRadius: 20, padding: 8, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 0 }}>
              <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                {a.isSbp
                  ? <div style={{ width: 24, height: 24, position: "relative", overflow: "hidden", flexShrink: 0 }}><img alt="" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 15, height: 18 }} src={a.src} /></div>
                  : <Icon src={a.src} size={24} />}
              </div>
              <p style={{ fontFamily: "'MTS Compact'", fontWeight: 400, fontSize: 12, color: S.textPrimary, textAlign: "center", lineHeight: "16px", whiteSpace: "pre-wrap", width: "100%" }}>{a.label}</p>
            </div>
          ))}
        </div>

        {/* ACCOUNT WIDGETS */}
        <div style={{ display: "flex", gap: 4, padding: "0 20px 20px" }}>
          {/* МИР */}
          <div style={{ flex: 1, background: S.bgPrimary, borderRadius: 20, padding: "8px 12px 8px 8px", display: "flex", gap: 8, alignItems: "center", minWidth: 0 }}>
            <div style={{ position: "relative", width: 52, height: 36, flexShrink: 0 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: 10, overflow: "hidden", background: "#8f8fff" }}>
                <div style={{ position: "absolute", bottom: 0, right: 0, width: 30, height: 18 }}>
                  <img alt="" style={{ position: "absolute", inset: "31.25% 20% 35.42% 7.5%", width: "100%", height: "100%" }} src={img.mir} />
                </div>
              </div>
              <div style={{ position: "absolute", top: -8, left: 4, width: 16, height: 16 }}>
                <img alt="" style={{ width: "100%", height: "100%" }} src={img.mirStar} />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 14, color: S.textPrimary, lineHeight: "20px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>16 106 ₽</p>
              <p style={{ fontFamily: "'MTS Compact'", fontWeight: 400, fontSize: 12, color: S.textSecondary, lineHeight: "16px", opacity: 0.6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>·· 4328</p>
            </div>
          </div>
          {/* Штрафы */}
          <div style={{ flex: 1, background: S.bgPrimary, borderRadius: 20, padding: "8px 12px 8px 8px", display: "flex", gap: 8, alignItems: "center", minWidth: 0 }}>
            <div style={{ position: "relative", background: S.yellow, borderRadius: 12, padding: 6, flexShrink: 0 }}>
              <Icon src={img.warn} size={24} />
              <div style={{ position: "absolute", top: -4, right: -4, background: S.red, borderRadius: 10, padding: "0 4px", height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 12, color: S.white, lineHeight: "16px" }}>1</p>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 14, color: S.textPrimary, lineHeight: "20px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>15 423 ₽</p>
              <p style={{ fontFamily: "'MTS Compact'", fontWeight: 400, fontSize: 12, color: S.textSecondary, lineHeight: "16px", opacity: 0.6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>штрафы</p>
            </div>
          </div>
        </div>

        {/* КЕШБЭК В МАРТЕ + МНЕ ОДОБРЕНО stacked cards */}
        <div>
          {/* Кешбэк — gradient card with rounded top */}
          <div style={{ borderRadius: "32px 32px 0 0", overflow: "hidden", backgroundImage: "linear-gradient(133.74deg, rgb(177,153,255) 0%, rgb(152,136,255) 40.41%, rgb(149,142,255) 58.31%, rgb(152,216,255) 100%)" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", minHeight: 52, padding: "10px 20px" }}>
              <Icon src={img.heart} size={24} />
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                <p style={{ fontFamily: "'MTS Compact'", fontWeight: 400, fontSize: 17, color: S.white, lineHeight: "24px", whiteSpace: "nowrap" }}>Кешбэк в марте</p>
                <div style={{ background: S.red, borderRadius: 10, padding: "0 6px", height: 20, display: "flex", alignItems: "center" }}>
                  <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 12, color: S.white, lineHeight: "16px" }}>5</p>
                </div>
              </div>
              <Icon src={img.chevron} size={24} />
            </div>
          </div>
          {/* Мне одобрено — dark card, slightly overlapping */}
          <div style={{ background: S.bgPrimary, borderRadius: "32px 32px 0 0", overflow: "hidden", marginTop: -1 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", minHeight: 52, padding: "10px 20px" }}>
              <Icon src={img.drop} size={24} />
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontFamily: "'MTS Compact'", fontWeight: 400, fontSize: 17, color: S.textPrimary, lineHeight: "24px" }}>Мне одобрено</p>
                <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 17, color: S.textSecondary, lineHeight: "24px", whiteSpace: "nowrap" }}>1 000 000 ₽</p>
              </div>
            </div>
          </div>
        </div>

        {/* МОИ ДЕНЬГИ header — top of the rounded "vertical scroll" sheet */}
        <div style={{ background: S.bgLower, borderRadius: "32px 32px 0 0", overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", minHeight: 52, padding: "10px 20px" }}>
            <Icon src={img.card} size={24} />
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontFamily: "'MTS Compact'", fontWeight: 400, fontSize: 17, color: S.textPrimary, lineHeight: "24px" }}>Мои деньги</p>
              <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 17, color: S.textPrimary, lineHeight: "24px", whiteSpace: "nowrap" }}>1 949 696,88 ₽</p>
            </div>
          </div>
        </div>

        {/* PRODUCT GRID */}
        <div style={{ background: S.bgLower, padding: "8px 20px 20px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {TILES.map((tile) => {
              const isCta = tile.state === "cta";
              const inner = (
                <div style={{
                  background: isCta ? "rgba(255,255,255,0.04)" : S.bgPrimary,
                  border: isCta ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
                  borderRadius: 20, padding: 16, display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", boxSizing: "border-box", overflow: "hidden",
                }}>
                  {/* Top row: image + optional plus button */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div style={{ background: isCta ? S.white : S.bgSecondary, borderRadius: 16, overflow: "hidden", flexShrink: 0, width: 52, height: 52 }}>
                      <img alt="" style={{ width: 52, height: 52, display: "block", objectFit: "contain" }} src={tile.src} />
                    </div>
                    {isCta && (
                      <div style={{ width: 24, height: 24, flexShrink: 0 }}>
                        <img alt="" style={{ width: "100%", height: "100%" }} src={img.plusCircle} />
                      </div>
                    )}
                  </div>
                  {/* Bottom: label + count + amount / subtitle */}
                  <div style={{ height: 40, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <p style={{ fontFamily: "'MTS Compact'", fontWeight: 400, fontSize: 14, color: S.textPrimary, lineHeight: "20px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tile.label}</p>
                      {tile.count && <p style={{ fontFamily: "'MTS Compact'", fontWeight: 400, fontSize: 14, color: S.textTertiary, lineHeight: "20px", flexShrink: 0 }}>{tile.count}</p>}
                    </div>
                    {isCta
                      ? <p style={{ fontFamily: "'MTS Compact'", fontWeight: 400, fontSize: 14, color: S.textSecondary, lineHeight: "20px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tile.subtitle}</p>
                      : <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 17, color: S.textPrimary, lineHeight: "20px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tile.amount}</p>}
                  </div>
                </div>
              );
              const tileStyle: React.CSSProperties = { flex: "1 0 calc(50% - 4px)", minWidth: 148, maxWidth: "calc(50% - 4px)", height: 140, textDecoration: "none", borderRadius: 20, overflow: "hidden" };
              return tile.href
                ? <Link key={tile.label} href={tile.href} style={tileStyle}>{inner}</Link>
                : <div key={tile.label} style={tileStyle}>{inner}</div>;
            })}
          </div>
        </div>

        {/* ── ОТКРЫТЬ ПРОДУКТ ── */}
        <div style={{ background: "#000", padding: "36px 20px 0", flexShrink: 0 }}>
          <p style={{ fontFamily: "'MTS Wide'", fontWeight: 500, fontSize: 20, color: "#fafafa", lineHeight: "24px", marginBottom: 12 }}>Открыть продукт</p>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            {/* Left column */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Кредитные карты — tall */}
              <div style={{ background: "rgba(98,108,119,0.25)", borderRadius: 20, height: 120, overflow: "hidden", position: "relative", padding: 16 }}>
                <div style={{ position: "absolute", bottom: 0, right: 0, width: 80, height: 80, overflow: "hidden" }}>
                  <img alt="" src={img.card3d1} style={{ position: "absolute", top: "10%", left: 0, right: "-26.67%", bottom: "-36.67%", width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
                </div>
                <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 14, color: "#fafafa", lineHeight: "18px" }}>{"Кредитные\nкарты".split("\n").map((l,i) => <span key={i}>{l}{i===0&&<br/>}</span>)}</p>
              </div>
              {/* Вклады — short */}
              <div style={{ background: "rgba(98,108,119,0.25)", borderRadius: 20, height: 78, overflow: "hidden", position: "relative", padding: 16 }}>
                <div style={{ position: "absolute", bottom: 0, right: 0, width: 80, height: 80, overflow: "hidden" }}>
                  <img alt="" src={img.card3d2} style={{ position: "absolute", top: "10%", left: 0, right: "-26.67%", bottom: "-36.67%", width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
                </div>
                <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 14, color: "#fafafa", lineHeight: "20px" }}>Вклады</p>
              </div>
            </div>
            {/* Right column */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Кредиты — short */}
              <div style={{ background: "rgba(98,108,119,0.25)", borderRadius: 20, height: 78, overflow: "hidden", position: "relative", padding: 16 }}>
                <div style={{ position: "absolute", bottom: 0, right: 0, width: 80, height: 80, overflow: "hidden" }}>
                  <img alt="" src={img.card3d3} style={{ position: "absolute", top: "10%", left: 0, right: "-26.67%", bottom: "-36.67%", width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
                </div>
                <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 14, color: "#fafafa", lineHeight: "20px" }}>Кредиты</p>
              </div>
              {/* Дебетовые карты — tall */}
              <div style={{ background: "rgba(98,108,119,0.25)", borderRadius: 20, height: 120, overflow: "hidden", position: "relative", padding: 16 }}>
                <div style={{ position: "absolute", bottom: 0, right: 0, width: 80, height: 80, overflow: "hidden" }}>
                  <img alt="" src={img.card3d4} style={{ position: "absolute", top: "10%", left: 0, right: "-26.67%", bottom: "-36.67%", width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
                </div>
                <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 14, color: "#fafafa", lineHeight: "18px" }}>{"Дебетовые\nкарты".split("\n").map((l,i) => <span key={i}>{l}{i===0&&<br/>}</span>)}</p>
              </div>
            </div>
          </div>
          {/* "Все продукты" button */}
          <div style={{ paddingTop: 12, paddingBottom: 20 }}>
            <div style={{ background: "#8f8fff", borderRadius: 16, height: 52, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ fontFamily: "'MTS Wide'", fontWeight: 700, fontSize: 12, color: "#fff", lineHeight: "16px", letterSpacing: "0.6px", textTransform: "uppercase" }}>Все продукты</p>
            </div>
          </div>
        </div>

        {/* ── КУРСЫ ВАЛЮТ ── */}
        <div style={{ background: "#000", paddingBottom: 20, flexShrink: 0 }}>
          <div style={{ overflowX: "auto", display: "flex", gap: 12, padding: "0 20px" }}>
            {[
              { currency: "USD", buy: "66,59", sell: "72,23" },
              { currency: "EUR", buy: "78,56", sell: "77,31" },
              { currency: "CNY", buy: "12,42", sell: "11,34" },
            ].map((c) => (
              <div key={c.currency} style={{ background: "#1d2023", borderRadius: 20, flexShrink: 0 }}>
                {/* Flag + ticker */}
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end", padding: "16px 16px 12px" }}>
                  <div style={{ width: 24, height: 24, borderRadius: 8, overflow: "hidden", position: "relative", flexShrink: 0 }}>
                    <img alt="" src={img.usaFlag} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", maxWidth: "none" }} />
                  </div>
                  <p style={{ fontFamily: "'MTS Compact'", fontWeight: 400, fontSize: 17, color: "#fafafa", lineHeight: "24px" }}>{c.currency}</p>
                </div>
                {/* Buy / Sell */}
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "0 16px 16px" }}>
                  {[{ label: "Покупка", val: c.buy }, { label: "Продажа", val: c.sell }].map((side) => (
                    <div key={side.label} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                      <p style={{ fontFamily: "'MTS Compact'", fontWeight: 400, fontSize: 12, color: "#969fa8", lineHeight: "16px" }}>{side.label}</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: 70 }}>
                        <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 17, color: "#fafafa", lineHeight: "24px", whiteSpace: "nowrap" }}>{side.val}</p>
                        <div style={{ width: 24, height: 24, position: "relative", flexShrink: 0 }}>
                          <img alt="" src={img.arrowUp} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", maxWidth: "none" }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>{/* end scroll */}

      {/* TAB BAR */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: S.bgPrimary, borderTop: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", height: 52, padding: "0 4px" }}>
          {[
            { src: img.tabHome, label: "Главная",  active: true  },
            { src: img.tabPay,  label: "Платежи",  active: false },
            { src: img.tabHist, label: "История",  active: false },
            { src: img.tabProd, label: "Продукты", active: false },
            { src: img.tabMore, label: "Ещё",      active: false },
          ].map((tab) => (
            <div key={tab.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <Icon src={tab.src} size={24} />
              <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 12, color: tab.active ? S.white : S.tabInactive, lineHeight: "16px", textAlign: "center" }}>{tab.label}</p>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 16px" }}>
          <div style={{ width: 134, height: 5, borderRadius: 999, background: "rgba(255,255,255,0.12)" }} />
        </div>
      </div>

    </div>
  );
}
