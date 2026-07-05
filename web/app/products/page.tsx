"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { asset } from "@/lib/asset";

const S = {
  bgPrimary:   "#1d2023",
  bgLower:     "#000000",
  bgSecondary: "rgba(98,108,119,0.25)",
  textPrimary:   "#fafafa",
  textSecondary: "#969fa8",
  white:    "#ffffff",
  red:      "#ff0032",
  tabInactive: "rgba(255,255,255,0.46)",
};

const img = {
  heroCard:   asset("/images/products/hero-card.png"),
  getMoney:   asset("/images/products/tile-get-money.png"),
  openCard:   asset("/images/products/tile-open-card.png"),
  mortgage:   asset("/images/products/tile-mortgage.png"),
  save:       asset("/images/products/tile-save.png"),
  invest:     asset("/images/products/tile-invest.png"),
  business:   asset("/images/products/tile-business.png"),
  insurance:  asset("/images/products/tile-insurance.png"),
  premium:    asset("/images/products/tile-premium.png"),
  mtsProducts: asset("/images/products/tile-mts-products.png"),
  /* Эти иконки экспортированы конкретно с экрана "Продукты" в Figma — активная
     непрозрачность (100%) зашита в Продукты, а не в Главную, в отличие от
     набора иконок на главных экранах, где активна Главная. */
  tabHome:    asset("/images/products/tabbar/tab-home.svg"),
  tabPay:     asset("/images/products/tabbar/tab-pay.svg"),
  tabHist:    asset("/images/products/tabbar/tab-hist.svg"),
  tabProd:    asset("/images/products/tabbar/tab-prod.svg"),
  tabMore:    asset("/images/products/tabbar/tab-more.svg"),
};

/* Каждый сценарий главной ведёт в каталог со своим query-параметром —
   повторяем то же сопоставление, что и на самих главных экранах. */
const CATALOG_QUERY: Record<string, string> = {
  "home-anon":  "?scenario=anon",
  "home-uprid": "?scenario=uprid",
};

function Icon({ src, size = 24 }: { src: string; size?: number }) {
  return (
    <div style={{ position: "relative", flexShrink: 0, width: size, height: size }}>
      <img alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", maxWidth: "none" }} src={src} />
    </div>
  );
}

/* Тайл товарной сетки — повторяет визуал карточек из блока
   "Открыть продукт" на главной (тёмный фон, иконка в правом нижнем углу). */
function Tile({ title, subtitle, icon, tall, badge, href }: {
  title: React.ReactNode; subtitle?: string; icon?: string; tall?: boolean; badge?: number; href?: string;
}) {
  const inner = (
    <div style={{ background: S.bgSecondary, borderRadius: 20, height: tall ? 120 : 78, overflow: "hidden", position: "relative", padding: 16, boxSizing: "border-box" }}>
      {icon && (
        <div style={{ position: "absolute", bottom: 0, right: 0, width: 80, height: 80, overflow: "hidden" }}>
          <img alt="" src={icon} style={{ position: "absolute", top: "10%", left: 0, right: "-26.67%", bottom: "-36.67%", width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
        </div>
      )}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 17, color: S.textPrimary, lineHeight: "20px" }}>{title}</p>
        {badge != null && (
          <div style={{ background: S.red, borderRadius: 10, padding: "0 5px", height: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 12, color: S.white, lineHeight: "16px" }}>{badge}</p>
          </div>
        )}
      </div>
      {subtitle && <p style={{ fontFamily: "'MTS Compact'", fontWeight: 400, fontSize: 14, color: S.textSecondary, lineHeight: "18px", marginTop: 2 }}>{subtitle}</p>}
    </div>
  );
  return href ? <Link href={href} style={{ display: "block", textDecoration: "none" }}>{inner}</Link> : inner;
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsPageInner />
    </Suspense>
  );
}

function ProductsPageInner() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "home";
  const homeHref = `/${from}`;
  const catalogHref = `/catalog${CATALOG_QUERY[from] ?? ""}`;

  return (
    <div className="page-enter phone-width" style={{ height: "calc(100dvh - env(safe-area-inset-top))", paddingTop: "env(safe-area-inset-top)", display: "flex", flexDirection: "column", background: "#000", overflow: "hidden", position: "relative" }}>

      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", paddingBottom: 68 }}>

        {/* HERO — «Кредитная карта МТС Деньги» */}
        <div style={{ position: "relative", overflow: "hidden", backgroundImage: "linear-gradient(160deg, rgb(60,65,168) 0%, rgb(90,80,220) 55%, rgb(140,120,255) 100%)", padding: "24px 20px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <p style={{ fontFamily: "'MTS Wide'", fontWeight: 500, fontSize: 20, color: S.white, lineHeight: "24px", textAlign: "center", position: "relative", zIndex: 1 }}>
            Кредитная карта МТС Деньги
          </p>
          <div style={{ width: "100%", maxWidth: 260, aspectRatio: "1 / 1", position: "relative", zIndex: 1 }}>
            <img alt="" src={img.heroCard} style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }} />
          </div>
          <div style={{ background: S.white, borderRadius: 16, padding: "14px 24px", position: "relative", zIndex: 1 }}>
            <p style={{ fontFamily: "'MTS Wide'", fontWeight: 700, fontSize: 12, color: "#1d2023", lineHeight: "16px", letterSpacing: "0.6px", textTransform: "uppercase" }}>Оформить карту</p>
          </div>
          <div style={{ display: "flex", gap: 4, alignItems: "center", position: "relative", zIndex: 1 }}>
            <div style={{ width: 4, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.35)" }} />
            <div style={{ width: 6, height: 6, borderRadius: 999, background: "rgba(255,255,255,0.35)" }} />
            <div style={{ width: 32, height: 6, borderRadius: 999, background: "rgba(255,255,255,0.9)" }} />
            <div style={{ width: 6, height: 6, borderRadius: 999, background: "rgba(255,255,255,0.35)" }} />
            <div style={{ width: 4, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.35)" }} />
          </div>
        </div>

        {/* GRID */}
        <div style={{ background: S.bgPrimary, borderRadius: "32px 32px 0 0", marginTop: -20, position: "relative", zIndex: 1, padding: "20px 20px 32px", display: "flex", flexDirection: "column", gap: 12 }}>

          <Tile title="Получить деньги" subtitle={"Выгодные предложения по кредитам и кредитным картам"} icon={img.getMoney} tall badge={2} />

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              <Tile title={<>Оформить<br />карту</>} icon={img.openCard} tall />
              <Tile title="Ипотека" icon={img.mortgage} />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              <Tile title="Накопить" subtitle="до 16.5%" icon={img.save} href={catalogHref} />
              <Tile title="Инвестиции" icon={img.invest} tall />
            </div>
          </div>

          <Tile title="Для бизнеса" subtitle={"Предложения для самозанятых и владельцев бизнеса"} icon={img.business} tall />

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              <Tile title="Страхование" icon={img.insurance} tall />
              <Tile title="Подключить другой банк" />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              <Tile title="Премиум" icon={img.premium} />
              <Tile title={<>Продукты<br />МТС</>} icon={img.mtsProducts} tall />
            </div>
          </div>

        </div>
      </div>

      {/* TAB BAR — zIndex above the grid panel (which sits at zIndex:1 for its rounded-corner overlap with the hero) so it isn't painted underneath it */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2, background: S.bgPrimary, borderTop: "1px solid rgba(255,255,255,0.08)", flexShrink: 0, paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div style={{ display: "flex", alignItems: "center", height: 52, padding: "0 4px" }}>
          {[
            { src: img.tabHome, label: "Главная",  active: false, href: homeHref as string | null },
            { src: img.tabPay,  label: "Платежи",  active: false, href: null as string | null },
            { src: img.tabHist, label: "История",  active: false, href: null as string | null },
            { src: img.tabProd, label: "Продукты", active: true,  href: null as string | null },
            { src: img.tabMore, label: "Ещё",      active: false, href: null as string | null },
          ].map((tab) => {
            const tabStyle: React.CSSProperties = { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 };
            const content = (
              <>
                <Icon src={tab.src} size={24} />
                <p style={{ fontFamily: "'MTS Compact'", fontWeight: 500, fontSize: 12, color: tab.active ? S.white : S.tabInactive, lineHeight: "16px", textAlign: "center" }}>{tab.label}</p>
              </>
            );
            return tab.href
              ? <Link key={tab.label} href={tab.href} style={tabStyle}>{content}</Link>
              : <div key={tab.label} style={tabStyle}>{content}</div>;
          })}
        </div>
      </div>

    </div>
  );
}
