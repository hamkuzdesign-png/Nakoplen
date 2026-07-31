"use client";

import { useState, useRef, useEffect, Suspense, type PointerEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { asset } from "@/lib/asset";

/* ── TYPES ── */
type Period = "all" | "no-term" | "3m" | "6m" | "12m";

type CardData = {
  id: string;
  title: string;
  desc: string;
  badge: string;
  img: string;
};

/* ── DATA ── */
const BEST: CardData[] = [
  { id: "b1", title: "МТС Счёт", desc: "На ежедневный остаток", badge: "До 15,2%", img: asset("/images/prod-ejednevny.png") },
  { id: "b2", title: "Счёт «Кешбокс»", desc: "Выплачиваем доход на карту ежедневно", badge: "До 14%", img: asset("/images/prod-keshboks.png") },
];

const ACCOUNTS: CardData[] = [
  { id: "a1", title: "МТС Счёт", desc: "На ежедневный остаток", badge: "До 15,2%", img: asset("/images/prod-ejednevny.png") },
  { id: "a2", title: "Счёт «Кешбокс»", desc: "Выплачиваем доход на карту ежедневно", badge: "До 14%", img: asset("/images/prod-keshboks.png") },
  { id: "a3", title: "МТС Счёт", desc: "На минимальный остаток", badge: "До 13%", img: asset("/images/prod-minimalny.png") },
  { id: "a4", title: "Бонусы за накопления", desc: "Получайте бонусы за деньги на счёте", badge: "", img: asset("/images/prod-bonusy.png") },
];

const DEPOSITS: CardData[] = [
  { id: "d1", title: "Вклад Плюс", desc: "В рублях, юанях или дирхамах", badge: "До 14%", img: asset("/images/prod-vklad-plus.png") },
  { id: "d2", title: "Вклад МТС Деньги", desc: "В рублях. Без снятия и пополнения", badge: "До 13,5%", img: asset("/images/prod-mts-dengi.png") },
  { id: "d3", title: "Вклад МТС Максимум", desc: "Динамическая доходность в рублях", badge: "До 14,2%", img: asset("/images/prod-mts-maksimum.png") },
];

/* УПРИД: уже доступные продукты, не требующие полной идентификации */
const AVAILABLE_NOW: CardData[] = [
  { id: "a4", title: "Бонусы за накопления", desc: "Получайте бонусы за деньги на счёте", badge: "", img: asset("/images/prod-bonusy.png") },
  { id: "m1", title: "МТС Накопления", desc: "Проценты начисляются ежедневно", badge: "До 15%", img: asset("/images/prod-mts-nakopleniya.png") },
];

const ALTERNATIVE: CardData[] = [
  { id: "m1", title: "МТС Накопления", desc: "Проценты начисляются ежедневно", badge: "До 15%", img: asset("/images/prod-mts-nakopleniya.png") },
  { id: "m2", title: "Цифровые активы", desc: "Инвестируйте в активы новым способом", badge: "До 20%", img: asset("/images/prod-tsifrovye.png") },
  { id: "m3", title: "Металлы", desc: "Сделки с золотом, серебром, платиной и палладием 24/7", badge: "", img: asset("/images/prod-metally.png") },
];

const FAQ_ITEMS = [
  { id: 1, title: "Накопительные счета", answer: "Накопительный счёт — способ хранить деньги с начислением процентов. Деньги можно снимать и пополнять в любое время." },
  { id: 2, title: "Вклады", answer: "Вклад — продукт для хранения средств под фиксированный процент на определённый срок. Досрочное снятие влечёт потерю процентов." },
  { id: 3, title: "МТС Накопления", answer: "МТС Накопления — рыночный инструмент с динамической доходностью. Средства инвестируются в диверсифицированный портфель активов." },
  { id: 4, title: "Цифровые финансовые активы", answer: "ЦФА — цифровые права на блокчейне. Работают как облигации: фиксированный доход по истечении срока." },
  { id: 5, title: "Металлы", answer: "ОМС позволяют покупать золото, серебро, платину и палладий без хранения физического металла." },
  { id: 6, title: "Бонусы за накопления", answer: "Начисляем кешбэк за среднемесячный остаток на накопительных счетах. Бонусы тратятся на услуги МТС и партнёров." },
];

/* ── ФИЛЬТРЫ (Figma: «Работа фильтров», node 6469-118554) ──
 *
 * Единственный источник правды — матрицы «Принадлежность продуктов фильтрам».
 * Срок и чипы пересекаются по AND; таблица «Показ нижних фильтров зависит от
 * срока» из макета не хардкодится — она полностью выводится из этих множеств
 * (проверено: для каждого срока набор непустых пересечений совпадает с макетом).
 */
type ChipKey = "withdraw" | "uncond" | "daily";

/* ── PERIOD TABS ── */
const PERIOD_TABS: { key: Period; label: string }[] = [
  { key: "all",     label: "ВСЕ" },
  { key: "no-term", label: "БЕЗ СРОКА" },
  { key: "3m",      label: "3 МЕС" },
  { key: "6m",      label: "6 МЕС" },
  { key: "12m",     label: "12 МЕС" },
];

const FILTER_CHIPS: { key: ChipKey; label: string; icon: string }[] = [
  { key: "withdraw", label: "С выводом средств",  icon: asset("/images/chip-coins.png")    },
  { key: "uncond",   label: "Ставка без условий", icon: asset("/images/chip-percent.png")  },
  { key: "daily",    label: "Ежедневные выплаты", icon: asset("/images/chip-calendar.png") },
];

/* Принадлежность продуктов чипам. b1/b2 — BEST-копии a1/a2 (НС ЕД и Кешбокс). */
const CHIP_PRODUCTS: Record<ChipKey, Set<string>> = {
  /* НС мин. остаток, НС ежедн. остаток, НС Кешбокс, Бонусы, Вклад Плюс, Металлы, МТС Накопления */
  withdraw: new Set(["a3", "a1", "b1", "a2", "b2", "a4", "d1", "m3", "m1"]),
  /* НС мин. остаток, Вклад Плюс, Вклад МТС Деньги, ЦФА, Металлы, МТС Накопления */
  uncond:   new Set(["a3", "d1", "d2", "m2", "m3", "m1"]),
  /* НС Кешбокс */
  daily:    new Set(["a2", "b2"]),
};

/* Принадлежность продуктов срокам. "all" — без ограничения. */
const PERIOD_PRODUCTS: Record<Exclude<Period, "all">, Set<string>> = {
  /* НС мин. остаток, НС ежедн. остаток, НС Кешбокс, Металлы */
  "no-term": new Set(["a3", "a1", "b1", "a2", "b2", "m3"]),
  /* Бонусы, Вклад Максимум, Вклад Плюс, ЦФА, МТС Накопления */
  "3m":      new Set(["a4", "d3", "d1", "m2", "m1"]),
  /* Вклад Максимум, ЦФА */
  "6m":      new Set(["d3", "m2"]),
  /* Вклад МТС Деньги, ЦФА */
  "12m":     new Set(["d2", "m2"]),
};

const matchesPeriod = (id: string, period: Period) => period === "all" || PERIOD_PRODUCTS[period].has(id);

const matchesFilters = (id: string, period: Period, chips: ChipKey[]) =>
  matchesPeriod(id, period) && chips.every(c => CHIP_PRODUCTS[c].has(id));

/* Весь каталог — база для расчёта доступности чипов. */
const ALL_IDS = [...ACCOUNTS, ...DEPOSITS, ...ALTERNATIVE].map(c => c.id);

/* Сколько продуктов каталога прошли бы такой набор фильтров */
const countMatching = (period: Period, chips: ChipKey[]) =>
  ALL_IDS.filter(id => matchesFilters(id, period, chips)).length;

const withToggled = (chips: ChipKey[], key: ChipKey): ChipKey[] =>
  chips.includes(key) ? chips.filter(k => k !== key) : [...chips, key];

function filterCards(cards: CardData[], period: Period, chips: ChipKey[]): CardData[] {
  return cards.filter(card => matchesFilters(card.id, period, chips));
}

/* ── ДИНАМИЧЕСКАЯ 3D-СТАВКА В ШАПКЕ ── */
/* 3D-рендеры конкретных чисел — под каждую ставку, которая встречается в карточках ниже. */
const RATE_HERO_IMAGES: Record<string, string> = {
  "13":   asset("/images/rates/rate-13.png"),
  "13,5": asset("/images/rates/rate-13,5.png"),
  "14":   asset("/images/rates/rate-14.png"),
  "14,2": asset("/images/rates/rate-14,2.png"),
  "15":   asset("/images/rates/rate-15.png"),
  "15,2": asset("/images/rates/rate-15,2.png"),
  "11,7": asset("/images/rates/rate-11,7.png"),
  "20":   asset("/images/rates/rate-20.png"),
};
const DEFAULT_HERO_RATE = "20";

function parseRate(badge: string): number | null {
  const match = badge.match(/[\d]+(?:,\d+)?/);
  if (!match) return null;
  return parseFloat(match[0].replace(",", "."));
}

/* Максимальная ставка среди видимых карточек — определяет, какую 3D-картинку показать сверху */
function maxVisibleRateKey(cards: CardData[]): string {
  let bestValue = -Infinity;
  let bestKey = DEFAULT_HERO_RATE;
  for (const card of cards) {
    const value = parseRate(card.badge);
    if (value !== null && value > bestValue) {
      bestValue = value;
      bestKey = card.badge.match(/[\d]+(?:,\d+)?/)![0];
    }
  }
  return bestValue === -Infinity ? DEFAULT_HERO_RATE : bestKey;
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
          /* та же раскладка, что и у настоящих карточек — иначе высота панели
             прыгает на входе/выходе из скелетона */
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

/* ── CARD ──
   Figma «Card Prop» (6479-164519) — два типа: Small 164×192 (половина ряда) и
   Medium 332×136 (во всю ширину). Medium получает карточка, оставшаяся в ряду
   одна: при нечётном числе продуктов в категории — последняя, а значит и
   единственный продукт категории. */
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

/* Carousel pagination — static indicator for the active slide. No more
   auto-advance, so the active dot is just shown fully filled rather than
   animating a countdown. */
function SlideDots() {
  return (
    <div className="slide-dots" style={{ paddingTop: 0 }}>
      <div className="dot dot-sm" />
      <div className="dot dot-md" />
      <div className="dot-active">
        <div className="dot-active-bg" />
        <div className="dot-active-fill" />
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
  const isOwned = scenario === "owned";
  const scenarioQuery = scenario ? `?scenario=${scenario}` : "";
  const [period, setPeriod] = useState<Period>("all");
  const [activeChips, setActiveChips] = useState<ChipKey[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const skeletonTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStartX = useRef<number | null>(null);
  const chipsRowRef = useRef<HTMLDivElement>(null);

  /* While any filter is non-default (a period other than "all", or any chip
     active), the banner carousel stops entirely — no more swipe. Returning
     every filter back to default re-activates it. */
  const controlsUsed = period !== "all" || activeChips.length > 0;

  const triggerSkeleton = () => {
    if (skeletonTimer.current) clearTimeout(skeletonTimer.current);
    setShowSkeleton(true);
    skeletonTimer.current = setTimeout(() => setShowSkeleton(false), 500);
  };

  /* Manual swipe — ignored anywhere inside the full-width filters rectangle
     (chips row), so scrolling filters never also flips the hero banner
     underneath. Disabled for good once a control has been used. No more
     auto-advance — the banner only changes on a manual swipe. */
  const onCarouselPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (controlsUsed) return;
    if ((e.target as HTMLElement).closest(".cat-filters-block")) return;
    dragStartX.current = e.clientX;
  };
  const onCarouselPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (controlsUsed || dragStartX.current == null) return;
    const dx = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(dx) < 40) return;
    setSlide(s => (dx < 0 ? Math.min(s + 1, 1) : Math.max(s - 1, 0)));
  };

  /* Смена срока: сохраняем те чипы, что остаются доступны в новом сроке
     («Сохранились фильтры которые доступны в этом сроке», Figma). */
  const selectPeriod = (key: Period) => {
    triggerSkeleton();
    setPeriod(key);
    setActiveChips(prev => prev.filter(c => countMatching(key, [c]) > 0));
  };

  /* Задизэйбленный чип не нажимается вовсе (onClick на него не вешается),
     поэтому здесь достаточно переключить набор без перепроверки. */
  const toggleChip = (key: ChipKey) => {
    triggerSkeleton();
    setActiveChips(prev => withToggled(prev, key));
  };

  /* Выбранный чип уезжает в начало ряда, поэтому нажатый из-под скролла он
     оказался бы за левым краем. Возвращаем ряд в базовую позицию — на
     следующем кадре после коммита: перестановка чипов внутри скроллера
     отменяет плавную прокрутку, запущенную в том же кадре. */
  useEffect(() => {
    const id = requestAnimationFrame(() =>
      chipsRowRef.current?.scrollTo({ left: 0, behavior: "smooth" })
    );
    return () => cancelAnimationFrame(id);
  }, [activeChips]);

  /* Дизэйбл чипа (Figma, «Обрати внимание»): происходит при выборе срока и
     когда чип не совместим с уже выбранной комбинацией — то есть всегда, когда
     пересечение по продуктам пусто. Чипы не скрываются: выбранные уезжают в
     начало ряда, задизэйбленные — в конец, ряд остаётся скроллируемым. */
  const chips = FILTER_CHIPS
    .map(c => {
      const on = activeChips.includes(c.key);
      const disabled = !on && countMatching(period, withToggled(activeChips, c.key)) === 0;
      return { ...c, on, disabled };
    })
    .sort((a, b) => {
      if (a.on !== b.on) return a.on ? -1 : 1;
      if (a.on) return activeChips.indexOf(a.key) - activeChips.indexOf(b.key);
      if (a.disabled !== b.disabled) return a.disabled ? 1 : -1;
      return FILTER_CHIPS.findIndex(f => f.key === a.key) - FILTER_CHIPS.findIndex(f => f.key === b.key);
    });

  /* Apply period + chip filtering (AND) */
  const visibleAccounts = filterCards(ACCOUNTS, period, activeChips);
  const visibleDeposits = filterCards(DEPOSITS, period, activeChips);
  const visibleAlt      = filterCards(ALTERNATIVE, period, activeChips);

  /* BEST only shown in the default state (no period, no chips) */
  const isDefaultState = period === "all" && activeChips.length === 0;
  const visibleBest = isDefaultState ? BEST : [];

  /* УПРИД: «Доступно прямо сейчас» — только для сценария УПРИД, в дефолтном состоянии */
  const visibleAvailableNow = isUprid && isDefaultState ? AVAILABLE_NOW : [];

  /* Карточки "МТС Счёт" (ежедневный остаток, b1/a1) в сценарии "созданные продукты"
     показывают уже открытую пользователю ставку 11,7% вместо маркетинговых 15,2%. */
  const applyOwnedRate = (cards: CardData[]) =>
    isOwned
      ? cards.map(c => (c.id === "b1" || c.id === "a1") ? { ...c, badge: "До 11,7%" } : c)
      : cards;
  const displayBest     = applyOwnedRate(visibleBest);
  const displayAccounts = applyOwnedRate(visibleAccounts);

  /* 3D-ставка в шапке = максимальная ставка среди карточек, показанных ниже прямо сейчас.
     Считаем по тем же (уже подменённым для "созданных продуктов") ставкам, что и в
     карточках, иначе при фильтрации шапка и карточки могут разойтись. */
  const heroRateKey = maxVisibleRateKey([
    ...displayBest,
    ...visibleAvailableNow,
    ...displayAccounts,
    ...visibleDeposits,
    ...visibleAlt,
  ]);
  const heroRateImg = RATE_HERO_IMAGES[heroRateKey];

  return (
    <div className="screen page-enter nc-catalog" id="top">
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
                  <img src={heroRateImg} alt={`${heroRateKey}%`} className="cat-pct-img" />
                </div>
                {/* Full-width block spanning both filter rows — a single hit
                    region so the banner-swipe exclusion below covers the
                    whole rectangle, not just the two rows' own narrower
                    hitboxes (see onCarouselPointerDown). */}
                <div className="cat-filters-block">
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
                  <div className="cat-chips-scroll" ref={chipsRowRef}>
                    {chips.map(chip => (
                      <button
                        key={chip.key}
                        className={`cat-chip${chip.on ? " active" : ""}${chip.disabled ? " disabled" : ""}`}
                        onClick={chip.disabled ? undefined : () => toggleChip(chip.key)}
                      >
                        <div className="cat-chip-icon-wrap">
                          <img src={chip.icon} alt="" className="cat-chip-icon-img" />
                        </div>
                        {chip.label}
                        {chip.on && (
                          <img src={asset("/images/icon-chip-cross.svg")} alt="" className="cat-chip-cross" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <SlideDots />
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
                <img src={asset("/images/prod-keshboks-dial.png")} alt="Кешбокс" className="cat-slide2-img" />
                <button className="cat-slide2-btn" onClick={() => router.push(`/product/a2${scenarioQuery}`)}>Открыть счёт</button>
                <SlideDots />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Product sections */}
      <div className="lower-panel cat-lower">
        {/* Always rendered — controls panel height, invisible under skeleton */}
        <div style={{ visibility: showSkeleton ? "hidden" : "visible", width: "100%" }}>
          <Section label="Лучшие предложения" star cards={displayBest} first={visibleBest.length > 0} onCardClick={id => router.push(`/product/${id}${scenarioQuery}`)} />
          <Section label="Доступно прямо сейчас" icon={asset("/images/icon-device-reservation.svg")} cards={visibleAvailableNow} first={visibleBest.length === 0 && visibleAvailableNow.length > 0} onCardClick={id => router.push(`/product/${id}${scenarioQuery}`)} />
          <Section label="Накопительные счета" cards={displayAccounts} first={visibleBest.length === 0 && visibleAvailableNow.length === 0 && visibleAccounts.length > 0} onCardClick={id => router.push(`/product/${id}${scenarioQuery}`)} />
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
