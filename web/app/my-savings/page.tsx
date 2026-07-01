"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { asset } from "@/lib/asset";

/* ── assets ── */
const A = {
  gradient:  asset("/images/savings2/gradient.png"),
  back:      asset("/images/savings2/back.svg"),
  hide:      asset("/images/savings2/hide.svg"),
  sort:      asset("/images/savings2/sort.svg"),
  plus:      asset("/images/savings2/plus.svg"),
  arrowUp:   asset("/images/savings2/arrow-up.svg"),
  analytics: asset("/images/savings2/analytics.svg"),
  goal:      asset("/images/savings2/goal.svg"),
  open:      asset("/images/savings2/open.svg"),
  discount:  asset("/images/savings2/discount.svg"),
  add:       asset("/images/savings2/add.svg"),
  spark:     asset("/images/savings2/spark.svg"),
  money:     asset("/images/savings2/money.svg"),
  wifi:      asset("/images/icon-wifi.svg"),
  cell:      asset("/images/icon-cell.svg"),
  battery:   asset("/images/icon-battery.svg"),
};

/* ── small helpers ── */
function Img({ src, size = 24, opacity }: { src: string; size?: number; opacity?: number }) {
  return (
    <div style={{ position: "relative", flexShrink: 0, width: size, height: size, opacity }}>
      <img alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", maxWidth: "none" }} src={src} />
    </div>
  );
}

/* percent icon with gradient background — used for МТС Счёт rows (gray, per Figma) */
const ICON_BG = "linear-gradient(135deg, rgba(186,224,255,0.05) 0.96154%, rgba(40,49,72,0.5) 100%)";
const COIN_OUTER = `url("data:image/svg+xml;utf8,<svg viewBox='0 0 52 52' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23g)' opacity='1'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(5.2 5.2 -5.2 10.849 0 0)'><stop stop-color='rgba(186,224,255,0.24)' offset='0'/><stop stop-color='rgba(113,137,164,0.62)' offset='0.42067'/><stop stop-color='rgba(77,93,118,0.81)' offset='0.63101'/><stop stop-color='rgba(58,71,95,0.905)' offset='0.73618'/><stop stop-color='rgba(40,49,72,1)' offset='0.84135'/></radialGradient></defs></svg>")`;
const COIN_INNER = `url("data:image/svg+xml;utf8,<svg viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23g)' opacity='1'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(4.8 4.8 -4.8 10.015 0 0)'><stop stop-color='rgba(186,224,255,0.24)' offset='0'/><stop stop-color='rgba(113,137,164,0.62)' offset='0.42067'/><stop stop-color='rgba(77,93,118,0.81)' offset='0.63101'/><stop stop-color='rgba(58,71,95,0.905)' offset='0.73618'/><stop stop-color='rgba(40,49,72,1)' offset='0.84135'/></radialGradient></defs></svg>")`;

function DiscountIcon() {
  return (
    <div style={{ flexShrink: 0, width: 52, height: 52 }}>
      {/* position:relative here makes absolute children clip to overflow:hidden */}
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 16, width: 52, height: 52, backgroundImage: ICON_BG }}>
        <div style={{ position: "absolute", left: 10, top: 12, width: 52, height: 52 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 9999, backgroundImage: COIN_OUTER, opacity: 0.72 }} />
          <div style={{ position: "absolute", top: 2, left: 2, width: 48, height: 48, borderRadius: 9999, backgroundImage: COIN_INNER }} />
          <div style={{ position: "absolute", top: 11, left: 13, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <Img src={A.discount} size={24} />
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
          <img alt="" src={A.money} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", maxWidth: "none" }} />
        </div>
      </div>
    </div>
  );
}

/* action button (top row) */
function BigBtn({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="glass-chip" style={{ flex: 1, borderRadius: 20, padding: "10px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 0, boxSizing: "border-box" }}>
      <Img src={icon} size={24} opacity={0.7} />
      <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 12, color: "#fafafa", lineHeight: "16px", textAlign: "center", whiteSpace: "nowrap", width: "100%", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</p>
    </div>
  );
}

/* chip button (second row) */
function ChipBtn({ icon, label, onClick }: { icon: string; label: string; onClick?: () => void }) {
  return (
    <div className="glass-chip" onClick={onClick} style={{ flex: 1, borderRadius: 16, height: 44, display: "flex", gap: 4, alignItems: "center", justifyContent: "center", padding: "10px 12px", minWidth: 0, boxSizing: "border-box", cursor: onClick ? "pointer" : "default" }}>
      <Img src={icon} size={20} opacity={0.7} />
      <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 12, color: "#fafafa", lineHeight: "16px", whiteSpace: "nowrap" }}>{label}</p>
    </div>
  );
}

/* product row — links to its owned-product detail card (balance, расчётный доход, mini-analytics) */
function ProductRow({ href, icon, name, amount, subtitle, income }: {
  href: string; icon: React.ReactNode; name: string; amount: string; subtitle: string; income?: string;
}) {
  return (
    <Link href={href} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 20px", overflow: "hidden", textDecoration: "none", cursor: "pointer" }}>
      {icon}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0, whiteSpace: "nowrap" }}>
        <p style={{ fontFamily: "'MTS Compact'", fontWeight: 400, fontSize: 14, color: "#969fa8", lineHeight: "18px" }}>{name}</p>
        <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 17, color: "#fafafa", lineHeight: "20px" }}>{amount}</p>
        <p style={{ fontFamily: "'MTS Compact'", fontWeight: 400, fontSize: 14, color: "#969fa8", lineHeight: "18px", overflow: "hidden", textOverflow: "ellipsis" }}>{subtitle}</p>
      </div>
      {income && (
        <p style={{ fontFamily: "'MTS Compact'", fontWeight: 400, fontSize: 14, color: "#74df8b", lineHeight: "20px", whiteSpace: "nowrap", flexShrink: 0 }}>{income}</p>
      )}
    </Link>
  );
}

/* section label — same font as catalog's .cat-section-label, but with the
   Figma-accurate gap (Card Content py-12 + Secondary Title's own 12px) */
function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ padding: "0 20px 8px" }}>
      <p style={{ paddingTop: 12, fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 14, color: "#969fa8", lineHeight: "20px", textTransform: "uppercase" }}>{label}</p>
    </div>
  );
}

export default function MySavingsPage() {
  const router = useRouter();

  return (
    <div className="screen page-enter" style={{ gap: 12, paddingBottom: 32 }}>

      {/* Gradient — same asset as the catalog page header */}
      <div className="top-gradient" />

      {/* ── NAVBAR ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden", borderRadius: "0 0 32px 32px", flexShrink: 0, position: "relative", zIndex: 1 }}>
          {/* Navbar row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 0 16px", width: "100%" }}>
            <div style={{ flex: 1, height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
              {/* Back button */}
              <button onClick={() => router.push("/home")} style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", borderRadius: 12, padding: 4, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
                <div style={{ opacity: 0.7, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  <Img src={A.back} size={24} />
                </div>
              </button>
              {/* Hide button */}
              <button style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", borderRadius: 12, padding: 4, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
                <div style={{ opacity: 0.7, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  <Img src={A.hide} size={24} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ── HERO ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40, height: 284, alignItems: "center", justifyContent: "center", padding: "0 0 20px", flexShrink: 0, position: "relative", zIndex: 1 }}>
          {/* Balance text */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 20px", width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start", width: "100%" }}>
              {/* Title */}
              <p style={{ fontFamily: "'MTS Wide'", fontWeight: 500, fontSize: 20, color: "white", lineHeight: "24px", opacity: 0.56, textAlign: "center", width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Мои накопления</p>
              {/* Balance */}
              <p style={{ fontFamily: "'MTS Wide'", fontWeight: 500, fontSize: 32, color: "#fafafa", lineHeight: "36px", textAlign: "center", width: "100%" }}>
                652 000,32 ₽
              </p>
              {/* Income badge + label */}
              <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center", width: "100%" }}>
                <div style={{ background: "rgba(38,205,88,0.12)", borderRadius: 8, padding: "2px 6px", display: "flex", gap: 4, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 14, color: "#26cd58", lineHeight: "20px", whiteSpace: "nowrap" }}>+12 719 ₽</p>
                </div>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 14, color: "#fafafa", lineHeight: "18px", opacity: 0.72, whiteSpace: "nowrap" }}>за всё время</p>
                  <Img src={A.sort} size={16} opacity={0.7} />
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center", padding: "0 20px", width: "100%" }}>
            {/* Row 1: Пополнить / Перевести */}
            <div style={{ display: "flex", gap: 4, width: "100%" }}>
              <BigBtn icon={A.plus}    label="Пополнить" />
              <BigBtn icon={A.arrowUp} label="Перевести" />
            </div>
            {/* Row 2: chips */}
            <div style={{ display: "flex", gap: 4, width: "100%" }}>
              <ChipBtn icon={A.analytics} label="Аналитика" onClick={() => router.push("/analytics")} />
              <ChipBtn icon={A.goal}      label="Цель" onClick={() => router.push("/goal/new")} />
              <ChipBtn icon={A.open}      label="Открыть" onClick={() => router.push("/catalog")} />
            </div>
          </div>
        </div>

        {/* ── СЧЕТА И БОНУСЫ ── */}
        <div style={{ background: "#1d2023", borderRadius: 32, overflow: "hidden", flexShrink: 0, position: "relative", paddingTop: 12, zIndex: 1 }}>
          <SectionLabel label="Накопительные счета" />
          <ProductRow
            href="/my-product/os1"
            icon={<DiscountIcon />}
            name="МТС Счёт"
            amount="467 100 ₽"
            subtitle="15,5% на ежедневный остаток"
            income="+10 032 ₽"
          />
          <ProductRow
            href="/my-product/os2"
            icon={<DiscountIcon />}
            name="МТС Счёт"
            amount="30 000,32 ₽"
            subtitle="12,5% на минимальный остаток"
            income="+641 ₽"
          />
          {/* Add product row */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 20px" }}>
            <div style={{ background: "rgba(98,108,119,0.25)", borderRadius: 16, width: 52, height: 52, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <Img src={A.add} size={24} />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
              <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 14, color: "#fafafa", lineHeight: "18px" }}>Накопительный счёт «Кешбокс»</p>
              <p style={{ fontFamily: "'MTS Compact'", fontWeight: 400, fontSize: 14, color: "#969fa8", lineHeight: "18px" }}>до 15% с ежедневной выплатой</p>
            </div>
          </div>
          <div style={{ height: 4 }} />
        </div>

        {/* ── ВКЛАДЫ ── */}
        <div style={{ background: "#1d2023", borderRadius: 32, overflow: "hidden", flexShrink: 0, position: "relative", paddingTop: 12, zIndex: 1 }}>
          <SectionLabel label="Вклады" />
          <ProductRow
            href="/my-product/dep1"
            icon={<MoneyIcon />}
            name="Вклад МТС Плюс"
            amount="0 ₽"
            subtitle="Пополните до 25 августа 2026"
          />
          <ProductRow
            href="/my-product/dep2"
            icon={<MoneyIcon />}
            name="Вклад МТС Максимум"
            amount="154 900 ₽"
            subtitle="18,3%, потратьте до 15.02 ещё 38 000 ₽"
            income="+2 046 ₽"
          />
          {/* Вклад «Плюс» — generic icon, no amount */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 20px" }}>
            <div style={{ background: "rgba(98,108,119,0.25)", borderRadius: 16, width: 52, height: 52, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <Img src={A.add} size={24} />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
              <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 14, color: "#fafafa", lineHeight: "18px" }}>Вклад «Плюс»</p>
              <p style={{ fontFamily: "'MTS Compact'", fontWeight: 400, fontSize: 14, color: "#969fa8", lineHeight: "18px" }}>до 14,7% в рублях, юанях или дирхамах</p>
            </div>
          </div>
          <div style={{ height: 4 }} />
        </div>

      {/* ── CTA ── */}
      <div style={{ padding: "0 20px", flexShrink: 0, position: "relative", zIndex: 1 }}>
        <Link
          href="/catalog"
          style={{
            display: "flex",
            textDecoration: "none",
            borderRadius: 24,
            overflow: "hidden",
            padding: 16,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
            background: "#1d2023",
          }}
        >
          {/* Same gradient image as the page/catalog header, behind the content */}
          <img alt="" src={asset("/images/hero-gradient.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <p style={{ position: "relative", fontFamily: "'MTS Wide'", fontWeight: 500, fontSize: 16, color: "#fafafa", lineHeight: "24px", textAlign: "center", width: "100%" }}>Подобрать продукт</p>
          <div style={{ position: "relative", display: "flex", gap: 4, alignItems: "center", justifyContent: "center", width: "100%" }}>
            <div style={{ opacity: 0.72, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <Img src={A.spark} size={16} />
            </div>
            <p style={{ fontFamily: "'MTS Compact'", fontWeight: 400, fontSize: 12, color: "#fafafa", lineHeight: "16px", opacity: 0.72, whiteSpace: "nowrap" }}>С умным поиском</p>
          </div>
        </Link>
      </div>

    </div>
  );
}
