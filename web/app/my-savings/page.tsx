"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  metalGold: asset("/images/savings2/metal-gold.svg"),
  metalSilver: asset("/images/savings2/metal-silver.svg"),
  metalPlatinum: asset("/images/savings2/metal-platinum.svg"),
  metalPalladium: asset("/images/savings2/metal-palladium.svg"),
  skinsSchet: asset("/images/savings2/skins-schet.svg"),
  skinsVklad: asset("/images/savings2/skins-vklad.svg"),
  cfaGlorinkor: asset("/images/savings2/cfa-glorinkor.svg"),
  licevoy: asset("/images/savings2/licevoy.svg"),
  ghost: asset("/images/savings2/ghost.svg"),
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

const METAL_ICON = {
  gold: { image: A.metalGold, bg: "linear-gradient(135deg, rgba(255,235,147,0) 0.96%, rgba(255,251,147,.5) 100%)" },
  silver: { image: A.metalSilver, bg: "linear-gradient(135deg, rgba(255,255,255,0) 0.96%, rgba(255,255,255,.5) 100%)" },
  platinum: { image: A.metalPlatinum, bg: "linear-gradient(135deg, rgba(255,255,255,0) 0.96%, rgba(255,255,255,.5) 100%)" },
  palladium: { image: A.metalPalladium, bg: "rgba(98,108,119,.25)" },
} as const;

function MetalIcon({ type }: { type: keyof typeof METAL_ICON }) {
  const metal = METAL_ICON[type];
  return (
    <div style={{ flexShrink: 0, width: 52, height: 52, borderRadius: 16, overflow: "hidden", background: metal.bg }} aria-hidden>
      <div style={{ position: "relative", left: 0, top: 0, width: 52, height: 52 }}>
        <Img src={metal.image} size={52} />
      </div>
    </div>
  );
}

function ProductAssetIcon({ src }: { src: string }) {
  return <Img src={src} size={52} />;
}

/* action button (top row) */
function BigBtn({ icon, label, onClick }: { icon: string; label: string; onClick?: () => void }) {
  return (
    <div className="glass-chip" onClick={onClick} style={{ flex: 1, borderRadius: 20, padding: "10px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 0, boxSizing: "border-box", cursor: onClick ? "pointer" : "default" }}>
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

/* product row — owned product, доступ к своему детальному экрану заблокирован */
function ProductRow({ icon, name, amount, subtitle, income }: {
  icon: React.ReactNode; name: string; amount: string; subtitle: string; income?: string;
}) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 20px", overflow: "hidden" }}>
      {icon}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0, whiteSpace: "nowrap" }}>
        <p style={{ fontFamily: "'MTS Compact'", fontWeight: 400, fontSize: 14, color: "#969fa8", lineHeight: "18px" }}>{name}</p>
        <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 17, color: "#fafafa", lineHeight: "20px" }}>{amount}</p>
        <p style={{ fontFamily: "'MTS Compact'", fontWeight: 400, fontSize: 14, color: "#969fa8", lineHeight: "18px", overflow: "hidden", textOverflow: "ellipsis" }}>{subtitle}</p>
      </div>
      {income && (
        <p style={{ fontFamily: "'MTS Compact'", fontWeight: 400, fontSize: 14, color: "#74df8b", lineHeight: "20px", whiteSpace: "nowrap", flexShrink: 0 }}>{income}</p>
      )}
    </div>
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

function ReviewProductRow({ icon, name, amount, subtitle, income }: {
  icon: React.ReactNode; name: string; amount: string; subtitle: string; income?: string;
}) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 20px", minHeight: 72 }}>
      {icon}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        <p style={{ fontFamily: "'MTS Compact'", fontSize: 14, color: "#626c77", lineHeight: "18px" }}>{name}</p>
        <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 17, color: "#1d2023", lineHeight: "20px" }}>{amount}</p>
        <p style={{ fontFamily: "'MTS Compact'", fontSize: 14, color: "#626c77", lineHeight: "18px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subtitle}</p>
      </div>
      {income && <p style={{ fontFamily: "'MTS Compact'", fontSize: 14, color: "#00a832", lineHeight: "20px", whiteSpace: "nowrap" }}>{income}</p>}
    </div>
  );
}

function ReviewSection({ title, children, sectionRef }: { title: string; children: React.ReactNode; sectionRef?: React.Ref<HTMLElement> }) {
  return (
    <section ref={sectionRef} style={{ background: "#fff", borderRadius: 32, overflow: "hidden", padding: "12px 0 16px", position: "relative", zIndex: 2 }}>
      <div style={{ padding: "12px 20px 8px", fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 14, color: "#626c77", lineHeight: "20px", textTransform: "uppercase" }}>{title}</div>
      {children}
    </section>
  );
}

function ReviewOffer({ title, subtitle, href }: { title: string; subtitle: string; href: string }) {
  return (
    <Link href={href} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 20px", textDecoration: "none" }}>
      <div style={{ background: "#f2f3f7", borderRadius: 16, width: 52, height: 52, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><Img src={A.add} size={24} /></div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 14, color: "#1d2023", lineHeight: "18px" }}>{title}</p>
        <p style={{ fontFamily: "'MTS Compact'", fontSize: 14, color: "#626c77", lineHeight: "18px" }}>{subtitle}</p>
      </div>
    </Link>
  );
}

function ReviewSavingsScreen({ router, homeHref, catalogHref }: { router: ReturnType<typeof useRouter>; homeHref: string; catalogHref: string }) {
  // Одна непрерывная траектория как в Telegram: главный элемент начинает
  // движение до шторки, постепенно уменьшается и становится заголовком навбара.
  const HEADER_COLLAPSE_START = 0;
  // The Telegram reference completes the collapse before the first content
  // card reaches the header, so the transition feels tied to the gesture.
  const HEADER_COLLAPSE_DISTANCE = 180;
  const [headerCollapseProgress, setHeaderCollapseProgress] = useState(0);
  const [navProgress, setNavProgress] = useState(0);
  const [ctaProgress, setCtaProgress] = useState(0);
  const scrollFrameRef = useRef<number | null>(null);
  const lastSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateEndState = () => {
      if (scrollFrameRef.current !== null) return;

      scrollFrameRef.current = window.requestAnimationFrame(() => {
        scrollFrameRef.current = null;
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        // Шапка остаётся неподвижной, пока пользователь видит весь верхний
        // блок. Затем навбар проявляется чуть раньше суммы: у неё всегда есть
        // подложка, и она не пересекается с карточками контента.
        const rawHeaderProgress = Math.min(1, Math.max(0, (window.scrollY - HEADER_COLLAPSE_START) / HEADER_COLLAPSE_DISTANCE));
        // Подложка появляется чуть позже движения суммы — только когда под ней
        // начинает проходить контент.
        const rawNavProgress = Math.min(1, Math.max(0, (window.scrollY - 150) / 150));
        // Smoothstep даёт мягкое начало и окончание перехода, сохраняя
        // непосредственную связь навбара с движением пальца.
        const nextHeaderProgress = reduceMotion ? (rawHeaderProgress > 0 ? 1 : 0) : rawHeaderProgress * rawHeaderProgress * (3 - 2 * rawHeaderProgress);
        const nextNavProgress = reduceMotion ? (rawNavProgress >= 1 ? 1 : 0) : rawNavProgress * rawNavProgress * (3 - 2 * rawNavProgress);
        const lastSectionBottom = lastSectionRef.current?.getBoundingClientRect().bottom ?? window.innerHeight;
        // Start 100px before the CTA's final point and clamp the progress so
        // further scrolling cannot move it below the card's 12px gap.
        const rawCtaProgress = Math.min(1, Math.max(0, (window.innerHeight - 96 - lastSectionBottom + 100) / 100));

        setHeaderCollapseProgress((current) => Math.abs(current - nextHeaderProgress) > 0.01 ? nextHeaderProgress : current);
        setNavProgress((current) => Math.abs(current - nextNavProgress) > 0.01 ? nextNavProgress : current);
        setCtaProgress((current) => Math.abs(current - rawCtaProgress) > 0.01 ? rawCtaProgress : current);
      });
    };

    updateEndState();
    window.addEventListener("scroll", updateEndState, { passive: true });
    window.addEventListener("resize", updateEndState);
    return () => {
      window.removeEventListener("scroll", updateEndState);
      window.removeEventListener("resize", updateEndState);
      if (scrollFrameRef.current !== null) window.cancelAnimationFrame(scrollFrameRef.current);
    };
  }, []);

  // The collapsed navbar uses the compact 14/20 bold P4 amount style.
  const balanceScale = 1;
  const balanceFontSize = 32 - headerCollapseProgress * 18;
  const balanceLineHeight = 36 - headerCollapseProgress * 16;
  const balanceFontWeight = headerCollapseProgress > 0.65 ? 700 : 500;
  const balanceColor = `rgb(${Math.round(250 - navProgress * 221)}, ${Math.round(250 - navProgress * 218)}, ${Math.round(250 - navProgress * 215)})`;
  // Все второстепенные элементы повторяют движение Telegram: с первого пикселя
  // скролла одновременно уменьшаются, поднимаются и растворяются.
  const headerContentOpacity = 1 - headerCollapseProgress;
  const headerControlScale = 1 - headerCollapseProgress * 0.18;
  const headerTextScale = 1 - headerCollapseProgress * 0.16;
  const headerActionsScale = 1 - headerCollapseProgress * 0.14;
  const ctaWidth = 173 + 162 * ctaProgress;
  const ctaHeight = 44 + 8 * ctaProgress;
  const ctaBottom = 40 - 8 * ctaProgress;

  return (
    <div className="screen" style={{ background: "#f2f3f7", gap: 12, paddingBottom: 0, overflowX: "clip", overscrollBehaviorY: "none" }}>
      <div className="top-gradient" />

      {/* Одна и та же сумма морфится из крупного заголовка в центр навбара. */}
      <p
        style={{
          position: "fixed",
          zIndex: 22,
          top: "calc(130px + env(safe-area-inset-top))",
          left: "50%",
          width: "min(calc(100% - 40px), 335px)",
          transform: `translate(-50%, ${-106 * headerCollapseProgress}px) scale(${balanceScale})`,
          transformOrigin: "top center",
          fontFamily: "'MTS Wide'",
          fontWeight: balanceFontWeight,
          fontSize: balanceFontSize,
          lineHeight: `${balanceLineHeight}px`,
          letterSpacing: `${0.7 * headerCollapseProgress}px`,
          color: balanceColor,
          textAlign: "center",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          willChange: "transform, color",
        }}
      >652 000,32 ₽</p>

      {/* Светлый навбар появляется после схлопывания большого хедера. */}
      <div
        aria-hidden={navProgress === 0}
        style={{
          position: "fixed",
          zIndex: 20,
          top: 0,
          left: 0,
          transform: `translateY(${-12 * (1 - navProgress)}px)`,
          width: "100vw",
          maxWidth: "none",
          height: "calc(136px + env(safe-area-inset-top))",
          paddingTop: "env(safe-area-inset-top)",
          display: "flex",
          alignItems: "flex-start",
          opacity: navProgress,
          pointerEvents: navProgress > 0.98 ? "auto" : "none",
          overflow: "hidden",
          willChange: "transform, opacity",
        }}
      >
        {/* Непрозрачность подложки не даёт контенту пересекаться с суммой. */}
        <div
          style={{
            position: "absolute",
            zIndex: 0,
            inset: 0,
            pointerEvents: "none",
            background: "linear-gradient(to bottom, rgba(242,243,247,.98) 0%, rgba(242,243,247,.92) 58%, rgba(242,243,247,0) 100%)",
          }}
        />
        {/* Blur плавно убывает от 8px сверху до 0px снизу — без стыка-полоски. */}
        <div
          style={{
            position: "absolute",
            zIndex: 1,
            inset: 0,
            pointerEvents: "none",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            maskImage: "linear-gradient(to top, transparent 0%, #000 100%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 0%, #000 100%)",
          }}
        />
        <div style={{ position: "relative", zIndex: 2, width: "100%", height: 44, marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
          <button
            onClick={() => router.push(homeHref)}
            aria-label="Назад"
            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", padding: 4, borderRadius: 12, border: "1px solid #fff", background: "rgba(255,255,255,.56)", boxShadow: "0 0 20px rgba(97,114,137,.12)", backdropFilter: "blur(20px)", cursor: "pointer" }}
          >
            <div style={{ filter: "brightness(0) saturate(100%) invert(10%) sepia(8%) saturate(727%) hue-rotate(169deg) brightness(92%) contrast(91%)" }}><Img src={A.back} size={24} /></div>
          </button>
          <button
            aria-label="Скрыть баланс"
            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", padding: 4, borderRadius: 12, border: "1px solid #fff", background: "rgba(255,255,255,.56)", boxShadow: "0 0 20px rgba(97,114,137,.12)", backdropFilter: "blur(20px)", cursor: "pointer" }}
          >
            <div style={{ filter: "brightness(0) saturate(100%) invert(10%) sepia(8%) saturate(727%) hue-rotate(169deg) brightness(92%) contrast(91%)" }}><Img src={A.hide} size={24} /></div>
          </button>
        </div>
      </div>

      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 3,
          paddingBottom: 12,
          pointerEvents: "auto",
        }}
      >
        <div style={{ height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px 16px", opacity: headerContentOpacity, transform: `translateY(${-16 * headerCollapseProgress}px) scale(${headerControlScale})`, transformOrigin: "top center", pointerEvents: headerContentOpacity > 0.5 ? "auto" : "none", willChange: "transform, opacity" }}>
          <button onClick={() => router.push(homeHref)} style={{ background: "rgba(255,255,255,.08)", backdropFilter: "blur(20px)", borderRadius: 12, padding: 4, border: 0 }}><Img src={A.back} /></button>
          <button style={{ background: "rgba(255,255,255,.08)", backdropFilter: "blur(20px)", borderRadius: 12, padding: 4, border: 0 }}><Img src={A.hide} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "22px 20px 0", transform: `translateY(${-106 * headerCollapseProgress}px) scale(${headerTextScale})`, transformOrigin: "top center", opacity: headerContentOpacity, willChange: "transform, opacity" }}>
          <p style={{ fontFamily: "'MTS Wide'", fontWeight: 500, fontSize: 20, color: "rgba(255,255,255,.56)", lineHeight: "24px" }}>Мои накопления</p>
          {/* Reserve the full compact amount line so the amount stays between
              the title and income badge throughout the collapse. */}
          <div aria-hidden style={{ width: "100%", height: 36 }} />
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ background: "rgba(38,205,88,.12)", borderRadius: 8, padding: "2px 6px", fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 14, color: "#26cd58" }}>+8 546 ₽</span>
            <span style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 14, color: "rgba(250,250,250,.72)" }}>за всё время</span><Img src={A.sort} size={16} opacity={0.7} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, padding: "40px 20px 0", opacity: headerContentOpacity, transform: `translateY(${-106 * headerCollapseProgress}px) scale(${headerActionsScale})`, transformOrigin: "top center", pointerEvents: headerContentOpacity > 0.5 ? "auto" : "none", willChange: "transform, opacity" }}>
          <BigBtn icon={A.plus} label="Пополнить" onClick={() => router.push("/topup")} />
          <BigBtn icon={A.arrowUp} label="Перевести" onClick={() => router.push("/transfer")} />
          <BigBtn icon={A.analytics} label="Аналитика" onClick={() => router.push("/analytics")} />
        </div>
      </div>

      <ReviewSection title="Накопительные счета">
        <ReviewProductRow icon={<ProductAssetIcon src={A.skinsSchet} />} name="МТС Счёт" amount="467 100 ₽" subtitle="15,5% на ежедневный остаток" income="+2 848 ₽" />
        <ReviewProductRow icon={<ProductAssetIcon src={A.skinsSchet} />} name="МТС Счёт" amount="30 000,32 ₽" subtitle="13% на минимальный остаток" income="+2 848 ₽" />
        <ReviewProductRow icon={<ProductAssetIcon src={A.skinsSchet} />} name="МТС Счёт" amount="30 000,32 ₽" subtitle="13% на минимальный остаток" income="+2 848 ₽" />
        <ReviewOffer title="Кешбокс" subtitle="До 14% с ежедневной выплатой" href="/product/a2" />
      </ReviewSection>

      <ReviewSection title="Вклады">
        <ReviewProductRow icon={<ProductAssetIcon src={A.skinsVklad} />} name="Вклад МТС Плюс" amount="0 ₽" subtitle="Пополните до 25 августа 2026" />
        <ReviewProductRow icon={<ProductAssetIcon src={A.skinsVklad} />} name="Вклад МТС Максимум" amount="154 900 ₽" subtitle="18,3%, потратьте до 15.02 ещё 38 000 ₽" income="+2 848 ₽" />
        <ReviewOffer title="Вклад «Плюс»" subtitle="Доход с удобными условиями" href="/product/d1" />
      </ReviewSection>

      <ReviewSection title="Цифровые активы">
        <ReviewProductRow icon={<ProductAssetIcon src={A.cfaGlorinkor} />} name="ЦФА Глоринкор" amount="30 000,32 ₽" subtitle="До 8 ноября 2024" />
        <ReviewProductRow icon={<ProductAssetIcon src={A.licevoy} />} name="Лицевой счёт для ЦФА" amount="0 ₽" subtitle="Бессрочный" />
        <ReviewProductRow icon={<ProductAssetIcon src={A.ghost} />} name="ЦФА МТС ФИНТЕХ" amount="30 000 ₽" subtitle="21% на 6 месяцев" />
      </ReviewSection>

      <ReviewSection title="Металлы" sectionRef={lastSectionRef}>
        <ReviewProductRow icon={<MetalIcon type="gold" />} name="Золото" amount="30 г." subtitle="1732,32 ₽ за 1 грамм" />
        <ReviewProductRow icon={<MetalIcon type="silver" />} name="Серебро" amount="30 г." subtitle="1732,32 ₽ за 1 грамм" />
        <ReviewProductRow icon={<MetalIcon type="platinum" />} name="Платина" amount="30 г." subtitle="1732,32 ₽ за 1 грамм" />
        <ReviewProductRow icon={<ProductAssetIcon src={A.ghost} />} name="Палладий" amount="30 г." subtitle="1732,32 ₽ за 1 грамм" />
      </ReviewSection>

      {/* The parent gap provides the 12px below the final card. */}
      <div style={{ height: 84, flexShrink: 0, position: "relative" }}>
        <Link
          href={catalogHref}
          aria-label="Новый продукт"
          style={{
          position: "fixed",
          left: "50%",
          bottom: `calc(${ctaBottom}px + env(safe-area-inset-bottom))`,
          transform: "translateX(-50%)",
          zIndex: 10,
          width: `min(calc(100vw - 40px), ${ctaWidth}px)`,
          height: ctaHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          borderRadius: 16,
          background: "#1d2023",
          color: "#fafafa",
          textDecoration: "none",
          fontFamily: "'MTS Wide'",
          fontWeight: 700,
          fontSize: 12,
          lineHeight: "16px",
          letterSpacing: ".5px",
          whiteSpace: "nowrap",
          boxShadow: "0 8px 24px rgba(29,32,35,.24)",
          willChange: "width, height",
          transition: "width 180ms cubic-bezier(0.22, 1, 0.36, 1), height 180ms cubic-bezier(0.22, 1, 0.36, 1), bottom 180ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >НОВЫЙ ПРОДУКТ</Link>
      </div>
    </div>
  );
}

export default function MySavingsPage() {
  return (
    <Suspense>
      <MySavingsInner />
    </Suspense>
  );
}

function MySavingsInner() {
  const router = useRouter();
  /* Сценарий «новый каталог» приходит сюда с /home?catalog=new — тогда обе
     точки входа в каталог ведут на /new-catalog. Без параметра поведение
     прежнее, общий каталог. */
  const isNewCatalog = useSearchParams().get("catalog") === "new";
  const catalogHref = `${isNewCatalog ? "/new-catalog" : "/catalog"}?scenario=owned`;
  const homeHref = isNewCatalog ? "/home?catalog=new" : "/home";

  if (isNewCatalog) {
    return <ReviewSavingsScreen router={router} homeHref={homeHref} catalogHref={catalogHref} />;
  }

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
              <button onClick={() => router.push(homeHref)} style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", borderRadius: 12, padding: 4, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
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
              <BigBtn icon={A.plus}    label="Пополнить" onClick={() => router.push("/topup")} />
              <BigBtn icon={A.arrowUp} label="Перевести" onClick={() => router.push("/transfer")} />
            </div>
            {/* Row 2: chips */}
            <div style={{ display: "flex", gap: 4, width: "100%" }}>
              <ChipBtn icon={A.analytics} label="Аналитика" onClick={() => router.push("/analytics")} />
              <ChipBtn icon={A.goal}      label="Цель" onClick={() => router.push("/goal/new")} />
              <ChipBtn icon={A.open}      label="Открыть" onClick={() => router.push(catalogHref)} />
            </div>
          </div>
        </div>

        {/* ── СЧЕТА И БОНУСЫ ── */}
        <div style={{ background: "#1d2023", borderRadius: 32, overflow: "hidden", flexShrink: 0, position: "relative", paddingTop: 12, zIndex: 1 }}>
          <SectionLabel label="Накопительные счета" />
          <ProductRow
            icon={<DiscountIcon />}
            name="МТС Счёт"
            amount="467 100 ₽"
            subtitle="11,7% на ежедневный остаток"
            income="+10 032 ₽"
          />
          <ProductRow
            icon={<DiscountIcon />}
            name="МТС Счёт"
            amount="30 000,32 ₽"
            subtitle="13% на минимальный остаток"
            income="+641 ₽"
          />
          {/* Гостоффер — ведёт на детальный экран продукта в каталоге */}
          <Link href="/product/a2" style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 20px 20px", textDecoration: "none", cursor: "pointer" }}>
            <div style={{ background: "rgba(98,108,119,0.25)", borderRadius: 16, width: 52, height: 52, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <Img src={A.add} size={24} />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
              <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 14, color: "#fafafa", lineHeight: "18px" }}>Накопительный счёт «Кешбокс»</p>
              <p style={{ fontFamily: "'MTS Compact'", fontWeight: 400, fontSize: 14, color: "#969fa8", lineHeight: "18px" }}>до 14% с ежедневной выплатой</p>
            </div>
          </Link>
          <div style={{ height: 4 }} />
        </div>

        {/* ── ВКЛАДЫ ── */}
        <div style={{ background: "#1d2023", borderRadius: 32, overflow: "hidden", flexShrink: 0, position: "relative", paddingTop: 12, zIndex: 1 }}>
          <SectionLabel label="Вклады" />
          <ProductRow
            icon={<MoneyIcon />}
            name="Вклад МТС Плюс"
            amount="0 ₽"
            subtitle="Пополните до 25 августа 2026"
          />
          <ProductRow
            icon={<MoneyIcon />}
            name="Вклад МТС Максимум"
            amount="154 900 ₽"
            subtitle="14,2%, потратьте до 15.02 ещё 38 000 ₽"
            income="+2 046 ₽"
          />
          {/* Гостоффер — ведёт на детальный экран продукта в каталоге */}
          <Link href="/product/d1" style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 20px 20px", textDecoration: "none", cursor: "pointer" }}>
            <div style={{ background: "rgba(98,108,119,0.25)", borderRadius: 16, width: 52, height: 52, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <Img src={A.add} size={24} />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
              <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 14, color: "#fafafa", lineHeight: "18px" }}>Вклад «Плюс»</p>
              <p style={{ fontFamily: "'MTS Compact'", fontWeight: 400, fontSize: 14, color: "#969fa8", lineHeight: "18px" }}>до 14% в рублях, юанях или дирхамах</p>
            </div>
          </Link>
          <div style={{ height: 4 }} />
        </div>

      {/* ── CTA ── */}
      <div style={{ padding: "0 20px", flexShrink: 0, position: "relative", zIndex: 1 }}>
        <Link
          href={catalogHref}
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
