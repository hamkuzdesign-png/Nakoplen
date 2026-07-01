"use client";

import { useState, useEffect, useRef, Suspense, type PointerEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { asset } from "@/lib/asset";

/* ── TYPES ── */
type Period = "all" | "no-term" | "3m" | "12m";

type CardData = {
  id: string;
  title: string;
  desc: string;
  badge: string;
  img: string;
  wide?: boolean;
};

/* ── DATA ── */
const BEST: CardData[] = [
  { id: "b1", title: "МТС Счёт", desc: "На ежедневный остаток", badge: "До 15,5%", img: asset("/images/prod-ejednevny.png") },
  { id: "b2", title: "Счёт «Кешбокс»", desc: "Выплачиваем доход на карту ежедневно", badge: "До 15%", img: asset("/images/prod-keshboks.png") },
];

const ACCOUNTS: CardData[] = [
  { id: "a1", title: "МТС Счёт", desc: "На ежедневный остаток", badge: "До 15,5%", img: asset("/images/prod-ejednevny.png") },
  { id: "a2", title: "Счёт «Кешбокс»", desc: "Выплачиваем доход на карту ежедневно", badge: "До 15%", img: asset("/images/prod-keshboks.png") },
  { id: "a3", title: "МТС Счёт", desc: "На минимальный остаток", badge: "До 12,5%", img: asset("/images/prod-minimalny.png") },
  { id: "a4", title: "Бонусы за накопления", desc: "Получайте бонусы за деньги на счёте", badge: "", img: asset("/images/prod-bonusy.png") },
];

const DEPOSITS: CardData[] = [
  { id: "d1", title: "Вклад Плюс", desc: "В рублях, юанях или дирхамах", badge: "До 14,7%", img: asset("/images/prod-vklad-plus.png") },
  { id: "d2", title: "Вклад МТС Деньги", desc: "В рублях. Без снятия и пополнения", badge: "До 14,5%", img: asset("/images/prod-mts-dengi.png") },
  { id: "d3", title: "Вклад МТС Максимум", desc: "Динамическая доходность в рублях", badge: "До 14,5%", img: asset("/images/prod-mts-maksimum.png"), wide: true },
];

/* УПРИД: уже доступные продукты, не требующие полной идентификации */
const AVAILABLE_NOW: CardData[] = [
  { id: "a4", title: "Бонусы за накопления", desc: "Получайте бонусы за деньги на счёте", badge: "", img: asset("/images/prod-bonusy.png") },
  { id: "m1", title: "МТС Накопления", desc: "Проценты начисляются ежедневно", badge: "До 15,5%", img: asset("/images/prod-mts-nakopleniya.png") },
];

const ALTERNATIVE: CardData[] = [
  { id: "m1", title: "МТС Накопления", desc: "Проценты начисляются ежедневно", badge: "До 15,5%", img: asset("/images/prod-mts-nakopleniya.png") },
  { id: "m2", title: "Цифровые активы", desc: "Инвестируйте в активы новым способом", badge: "До 21%", img: asset("/images/prod-tsifrovye.png") },
  { id: "m3", title: "Металлы", desc: "Сделки с золотом, серебром, платиной и палладием 24/7", badge: "До 20%", img: asset("/images/prod-metally.png"), wide: true },
];

const FAQ_ITEMS = [
  { id: 1, title: "Накопительные счета", answer: "Накопительный счёт — способ хранить деньги с начислением процентов. Деньги можно снимать и пополнять в любое время." },
  { id: 2, title: "Вклады", answer: "Вклад — продукт для хранения средств под фиксированный процент на определённый срок. Досрочное снятие влечёт потерю процентов." },
  { id: 3, title: "МТС Накопления", answer: "МТС Накопления — рыночный инструмент с динамической доходностью. Средства инвестируются в диверсифицированный портфель активов." },
  { id: 4, title: "Цифровые финансовые активы", answer: "ЦФА — цифровые права на блокчейне. Работают как облигации: фиксированный доход по истечении срока." },
  { id: 5, title: "Металлы", answer: "ОМС позволяют покупать золото, серебро, платину и палладий без хранения физического металла." },
  { id: 6, title: "Бонусы за накопления", answer: "Начисляем кешбэк за среднемесячный остаток на накопительных счетах. Бонусы тратятся на услуги МТС и партнёров." },
];

/* ── PERIOD TABS CONFIG ── */
const PERIOD_TABS: { key: Period; label: string }[] = [
  { key: "all",     label: "ВСЕ" },
  { key: "no-term", label: "БЕЗ СРОКА" },
  { key: "3m",      label: "3 МЕС" },
  { key: "12m",     label: "12 МЕС" },
];

/* ── FILTER CHIPS ── */
const FILTER_CHIPS = [
  { key: "daily",    label: "Выплаты ежедневно",         icon: asset("/images/chip-percent.png") },
  { key: "withdraw", label: "С выводом средств",          icon: asset("/images/chip-lock.png")   },
  { key: "nomin",    label: "Без минимальной суммы",      icon: asset("/images/chip-card.png")   },
  { key: "insured",  label: "Застрахованы государством",  icon: asset("/images/chip-shield.png") },
  { key: "refill",   label: "Можно пополнять",            icon: asset("/images/chip-coins.png")  },
];

/*
 * Продукты, удовлетворяющие каждому фильтру (по таблице требований).
 * b1/b2 — BEST-копии a1/a2 (НС ЕД и Кешбокс).
 */
const CHIP_FILTER_MAP: Record<string, Set<string>> = {
  daily:    new Set(["b2", "a2", "m1"]),
  withdraw: new Set(["b1", "b2", "a1", "a2", "a3", "a4", "d1", "m3"]),
  refill:   new Set(["b1", "b2", "a1", "a2", "a3", "a4", "d1", "m1", "m2", "m3"]),
  nomin:    new Set(["b1", "b2", "a1", "a2", "a3"]),
  insured:  new Set(["b1", "b2", "a1", "a2", "a3", "d1", "d2", "d3"]),
};

/* Чипы, видимые при каждом периоде */
const CHIP_VISIBLE_PERIODS: Record<string, Period[]> = {
  daily:    ["all", "no-term"],
  withdraw: ["all", "no-term", "3m", "12m"],
  refill:   ["all", "no-term", "3m", "12m"],
  nomin:    ["all", "no-term"],
  insured:  ["all", "no-term", "3m", "12m"],
};

/* Возвращает карточки, прошедшие все активные фильтры (AND-логика) */
function filterByChips(cards: CardData[], chips: Set<string>): CardData[] {
  if (chips.size === 0) return cards;
  return cards.filter(card =>
    [...chips].every(chip => CHIP_FILTER_MAP[chip]?.has(card.id))
  );
}

/* ── SKELETON ── */
function SkelBar({ h, w, mx }: { h: number; w: number; mx?: boolean }) {
  return <div className="sk-bar" style={{ height: h, width: w, ...(mx ? { margin: "0 20px" } : {}) }} />;
}

function SkelCard({ wide }: { wide?: boolean }) {
  return (
    <div className={`sk-card${wide ? " sk-card-wide" : ""}`}>
      <div className="sk-card-shimmer" />
      <SkelBar h={20} w={104} />
      <div className="sk-card-text">
        <SkelBar h={16} w={94} />
        <SkelBar h={12} w={122} />
      </div>
    </div>
  );
}

function SkeletonGrid({ sections }: { sections: CardData[][] }) {
  const visible = sections.filter(s => s.length > 0);
  return (
    <div className="sk-overlay">
      <div className="sk-wrap">
        {visible.map((cards, i) => {
          const lastAlone = cards.length % 2 === 1;
          return (
            <div key={i} className={`sk-section${i === 0 ? " sk-section-first" : ""}`}>
              <SkelBar h={12} w={142} mx />
              <div className="sk-row">
                {cards.map((_, j) => (
                  <SkelCard key={j} wide={lastAlone && j === cards.length - 1} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── CARD ── */
function Card({ card, wide, onClick }: { card: CardData; wide?: boolean; onClick?: () => void }) {
  return (
    <div className={`cat-card${wide ? " cat-card-wide" : ""}`} onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="cat-card-text">
        <p className="cat-card-title">{card.title}</p>
        <p className="cat-card-desc">{card.desc}</p>
      </div>
      <img className="cat-card-img" src={card.img} alt="" />
      {card.badge && <span className="cat-card-badge">{card.badge}</span>}
    </div>
  );
}

/* ── SECTION ── */
function Section({ label, star, icon, cards, first, onCardClick }: {
  label: string; star?: boolean; icon?: string; cards: CardData[]; first?: boolean;
  onCardClick: (id: string) => void;
}) {
  if (!cards.length) return null;
  const lastIsAlone = cards.length % 2 === 1;
  return (
    <div className="cat-section">
      <div className={`cat-section-label${first ? " first" : ""}`}>
        {star && <img src={asset("/images/icon-spark.svg")} alt="" style={{ width: 16, height: 16 }} />}
        {icon && <img src={icon} alt="" style={{ width: 16, height: 16 }} />}
        {label}
      </div>
      <div className="cat-cards-grid">
        {cards.map((c, i) => (
          <Card key={c.id} card={c} wide={lastIsAlone && i === cards.length - 1} onClick={() => onCardClick(c.id)} />
        ))}
      </div>
    </div>
  );
}

/* Carousel pagination — exactly one dot per slide, always symmetric.
   The active dot fills up live (fillProgress 0–100) and the slide
   switches the instant it completes. */
function SlideDots({ fillProgress, disabled }: { fillProgress: number; disabled?: boolean }) {
  return (
    <div className={`slide-dots${disabled ? " slide-dots-disabled" : ""}`} style={{ paddingTop: 0 }}>
      <div className="dot dot-sm" />
      <div className="dot dot-md" />
      <div className="dot-active">
        <div className="dot-active-bg" />
        <div className="dot-active-fill" style={{ width: `${fillProgress}%` }} />
      </div>
      <div className="dot dot-md" />
      <div className="dot dot-sm" />
    </div>
  );
}

/* ── PAGE ── */
export default function Page() {
  return (
    <Suspense>
      <PageInner />
    </Suspense>
  );
}

function PageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenario = searchParams.get("scenario");
  const isUprid = scenario === "uprid" || scenario === "anon";
  const scenarioQuery = scenario ? `?scenario=${scenario}` : "";
  const [period, setPeriod] = useState<Period>("all");
  const [activeChips, setActiveChips] = useState<Set<string>>(new Set());
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [fillProgress, setFillProgress] = useState(0); // 0–100, drives the active dot's fill
  const [showSkeleton, setShowSkeleton] = useState(false);
  const skeletonTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStartX = useRef<number | null>(null);

  const SLIDE_DURATION_MS = 10000;
  const TICK_MS = 100;

  /* Carousel autoplay is disabled by ANY filter touch, and only re-enabled
     once filters are back at their base state (period "all", no chips) —
     or on a fresh page load, which starts there already. */
  useEffect(() => {
    const isDefault = period === "all" && activeChips.size === 0;
    setAutoPlay(isDefault);
    if (isDefault) setFillProgress(0);
  }, [period, activeChips]);

  /* Ticks the active dot's fill while autoplay is on. Paused (frozen, not
     reset) the moment a filter is touched — see selectPeriod/toggleChip. */
  useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(() => {
      setFillProgress(p => Math.min(p + (100 * TICK_MS) / SLIDE_DURATION_MS, 100));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [autoPlay]);

  /* Slide switches exactly when the fill completes. */
  useEffect(() => {
    if (fillProgress < 100) return;
    setSlide(s => (s + 1) % 2);
    setFillProgress(0);
  }, [fillProgress]);

  const triggerSkeleton = () => {
    if (skeletonTimer.current) clearTimeout(skeletonTimer.current);
    setShowSkeleton(true);
    skeletonTimer.current = setTimeout(() => setShowSkeleton(false), 500);
  };

  /* Manual swipe */
  const onCarouselPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragStartX.current = e.clientX;
  };
  const onCarouselPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current == null) return;
    const dx = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(dx) < 40) return;
    setFillProgress(0);
    setSlide(s => (dx < 0 ? Math.min(s + 1, 1) : Math.max(s - 1, 0)));
  };

  /* Period selection — deactivate chips hidden for new period */
  const selectPeriod = (key: Period) => {
    triggerSkeleton();
    setPeriod(key);
    setActiveChips(prev => {
      const next = new Set(prev);
      for (const chip of prev) {
        if (!CHIP_VISIBLE_PERIODS[chip]?.includes(key)) next.delete(chip);
      }
      return next;
    });
  };

  const toggleChip = (key: string) => {
    triggerSkeleton();
    setActiveChips(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  /* Visible chips depend on current period */
  const visibleChips = FILTER_CHIPS.filter(c =>
    CHIP_VISIBLE_PERIODS[c.key]?.includes(period)
  );

  /* Period-based visibility */
  const showAll     = period === "all";
  const showNoTerm  = period === "no-term";
  const showDeposits = period === "3m" || period === "12m";

  /* Apply chip filtering (AND) on top of period filtering */
  const chips = activeChips;
  const visibleAccounts = filterByChips(showAll || showNoTerm ? ACCOUNTS : [], chips);
  const visibleDeposits = filterByChips(showAll || showDeposits ? DEPOSITS : [], chips);
  const visibleAlt      = filterByChips(
    showAll || showNoTerm ? ALTERNATIVE : showDeposits ? ALTERNATIVE.filter(c => c.id === "m1") : ALTERNATIVE,
    chips
  );

  /* BEST only shown in the default state (no period, no chips) */
  const visibleBest = chips.size === 0 && period === "all" ? BEST : [];

  /* УПРИД: «Доступно прямо сейчас» — только для сценария УПРИД, в дефолтном состоянии */
  const visibleAvailableNow = isUprid && chips.size === 0 && period === "all" ? AVAILABLE_NOW : [];

  return (
    <div className="screen page-enter" id="top">
      <div className="top-gradient" />

      {/* Navbar */}
      <div className="navbar">
        <div className="navbar-content">
          <div className="navbar-inner">
            <button className="icon-button" aria-label="Назад" onClick={() => router.back()}>
              <img src={asset("/images/icon-back.svg")} alt="" />
            </button>
            <div className="icon-button" style={{ opacity: 0, pointerEvents: "none" }}>
              <img src={asset("/images/icon-back.svg")} alt="" />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Carousel */}
      <div
        className="cat-carousel-wrap"
        onPointerDown={onCarouselPointerDown}
        onPointerUp={onCarouselPointerUp}
        style={{ touchAction: "pan-y" }}
      >
        <div className="cat-carousel-track" style={{ transform: `translateX(${-slide * 100}%)` }}>

          {/* Slide 1 — Накопления */}
          <div className="cat-carousel-slide">
            <div className="cat-hero">
              <img src={asset("/images/hero-bg.png")} alt="" className="cat-hero-bg" aria-hidden />
              <div className="cat-hero-header">
                <p className="cat-title">Накопления</p>
                <p className="cat-subtitle">Укажите критерии — покажем варианты</p>
              </div>
              <div className="cat-hero-content">
                <div className="cat-pct-row">
                  <span className="cat-pct-prefix">до</span>
                  <img src={asset("/images/hero-21.png")} alt="21%" className="cat-pct-img" />
                </div>
                <div className="cat-period-tabs">
                  {PERIOD_TABS.map(tab => (
                    <button
                      key={tab.key}
                      className={`cat-tab${period === tab.key ? " active" : ""}`}
                      onClick={() => selectPeriod(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="cat-chips-scroll">
                  {visibleChips.map(chip => (
                    <button
                      key={chip.key}
                      className={`cat-chip${activeChips.has(chip.key) ? " active" : ""}`}
                      onClick={() => toggleChip(chip.key)}
                    >
                      <div className="cat-chip-icon-wrap">
                        <img src={chip.icon} alt="" className="cat-chip-icon-img" />
                      </div>
                      {chip.label}
                    </button>
                  ))}
                </div>
                <SlideDots fillProgress={fillProgress} disabled={!autoPlay} />
              </div>
            </div>
          </div>

          {/* Slide 2 — Кешбокс */}
          <div className="cat-carousel-slide">
            <div className="cat-hero cat-hero-slide2">
              <div className="cat-hero-slide2-bg" />
              <div className="cat-hero-header">
                <p className="cat-title">Кешбокс до 14%</p>
                <p className="cat-subtitle">Накопительный счёт с повышением ставки</p>
              </div>
              <div className="cat-hero-content cat-hero-content-slide2">
                <img src={asset("/images/prod-keshboks.png")} alt="Кешбокс" className="cat-slide2-img" />
                <button className="cat-slide2-btn">Открыть счёт</button>
                <SlideDots fillProgress={fillProgress} disabled={!autoPlay} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Product sections */}
      <div className="lower-panel cat-lower">
        {/* Always rendered — controls panel height, invisible under skeleton */}
        <div style={{ visibility: showSkeleton ? "hidden" : "visible", width: "100%" }}>
          <Section label="Лучшие предложения" star cards={visibleBest} first={visibleBest.length > 0} onCardClick={id => router.push(`/product/${id}${scenarioQuery}`)} />
          <Section label="Доступно прямо сейчас" icon={asset("/images/icon-device-reservation.svg")} cards={visibleAvailableNow} first={visibleBest.length === 0 && visibleAvailableNow.length > 0} onCardClick={id => router.push(`/product/${id}${scenarioQuery}`)} />
          <Section label="Накопительные счета" cards={visibleAccounts} first={visibleBest.length === 0 && visibleAvailableNow.length === 0 && visibleAccounts.length > 0} onCardClick={id => router.push(`/product/${id}${scenarioQuery}`)} />
          <Section label="Вклады" cards={visibleDeposits} first={visibleBest.length === 0 && visibleAvailableNow.length === 0 && visibleAccounts.length === 0 && visibleDeposits.length > 0} onCardClick={id => router.push(`/product/${id}${scenarioQuery}`)} />
          <Section label="Альтернативные продукты" cards={visibleAlt} first={visibleBest.length === 0 && visibleAvailableNow.length === 0 && visibleAccounts.length === 0 && visibleDeposits.length === 0} onCardClick={id => router.push(`/product/${id}${scenarioQuery}`)} />
        </div>
        {showSkeleton && <SkeletonGrid sections={[visibleBest, visibleAvailableNow, visibleAccounts, visibleDeposits, visibleAlt]} />}
      </div>

      {/* FAQ */}
      <div className="faq-panel">
        <div className="faq-title-row">
          <span className="faq-title">Будет полезно</span>
        </div>
        <div className="faq-list">
          {FAQ_ITEMS.map(item => (
            <div
              key={item.id}
              className="accordion-item"
              onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}
            >
              <div className="accordion-header">
                <p className="accordion-title">{item.title}</p>
                <span className={`accordion-chevron${openFaq === item.id ? " open" : ""}`}>
                  <img src={asset("/images/icon-chevron-down.svg")} alt="" />
                </span>
              </div>
              <div className={`accordion-body${openFaq === item.id ? " open" : ""}`}>
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* End panel */}
      <div className="end-panel">
        <div className="end-content">
          <div className="end-illustration">
            <video
              src={asset("/images/catalog-end.mov")}
              autoPlay loop muted playsInline
              style={{
                position: "absolute",
                width: 375,
                height: "auto",
                left: "50%",
                transform: "translateX(-50%)",
                top: 0,
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", padding: "0 24px" }}>
            <p className="end-title">Конец каталога</p>
            <p className="end-subtitle">Показали все накопительные продукты</p>
          </div>
        </div>
        <div className="btn-container">
          <button className="btn-up" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <span className="btn-up-label">Наверх</span>
          </button>
        </div>
      </div>
    </div>
  );
}
