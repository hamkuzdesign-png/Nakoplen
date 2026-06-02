"use client";

import { useState, useCallback, useMemo, useRef } from "react";

// ── FEATURE FLAG ─────────────────────────────────────────────────────────────
// Set to false to remove the skeleton loading state entirely.
const ENABLE_LOADING_SKELETON = true;
const SKELETON_DURATION_MS = 450;
// ─────────────────────────────────────────────────────────────────────────────

/* ── CHIP KEYS ── */
type ChipKey = "visok" | "stabil" | "dostup" | "podushka" | "bezmin" | "popol";
const CHIP_KEYS: ChipKey[] = ["visok", "stabil", "dostup", "podushka", "bezmin", "popol"];

/* ── CHIP DATA ── */
const CHIPS = [
  { label: "Высокий процент",       imgSrc: "/images/chip-high-rate.png", imgStyle: { left: "-13.95%", width: "127.15%", height: "127.15%", top: "-14.65%" } },
  { label: "Стабильный доход",      imgSrc: "/images/chip-stable.png",    imgStyle: { left: "-8.14%",  width: "119.3%",  height: "119.3%",  top: "-19.76%" } },
  { label: "Доступ к деньгам",      imgSrc: "/images/chip-access.png",    imgStyle: { inset: "0", width: "100%", height: "100%", objectFit: "cover" as const } },
  { label: "Подушка безопасности",  imgSrc: "/images/chip-pillow.png",    imgStyle: { left: "-3.76%", width: "112.5%",  height: "112.5%",  top: "-6.07%" } },
  { label: "Без минимальной суммы", imgSrc: "/images/chip-nomin.png",     imgStyle: { inset: "0", width: "100%", height: "100%", objectFit: "cover" as const } },
  { label: "Можно пополнять",       imgSrc: "/images/chip-refill.png",    imgStyle: { left: "-6.77%", width: "121.13%", height: "121.13%", top: "-14%" } },
];

/* ── CARD DATA ──
   tags = filters where this card appears (AND logic: card shown only when it
   is present in ALL currently selected filters).
   Source: Figma table node 4695:86710.
*/
type CardData = {
  id: string;
  img: string;
  title: string;
  desc: string;
  badge: string;
  tags: ChipKey[];
};

const ALL: ChipKey[] = ["visok", "stabil", "dostup", "podushka", "bezmin", "popol"];

const SECTION_SAVINGS: CardData[] = [
  { id: "ejednevny",  img: "/images/prod-ejednevny.png",  title: "На ежедневный\nостаток",   desc: "Выгодно, если снимаете деньги",        badge: "До 16%",   tags: ALL },
  { id: "keshboks",   img: "/images/prod-keshboks.png",   title: "Кешбокс",                  desc: "Выплачиваем доход на карту ежедневно", badge: "До 16%",   tags: ALL },
  { id: "minimalny",  img: "/images/prod-minimalny.png",  title: "На минимальный\nостаток",   desc: "Выгодно, если планируете копить",       badge: "До 12,5%", tags: ["stabil", "podushka", "dostup", "popol", "bezmin"] },
  { id: "bonusy",     img: "/images/prod-bonusy.png",     title: "Бонусы\nза накопления",     desc: "Получайте бонусы за деньги на счёте",  badge: "До 30%",   tags: ["podushka", "popol"] },
];

const SECTION_DEPOSITS: CardData[] = [
  { id: "vklad-plus",   img: "/images/prod-vklad-plus.png",   title: "Вклад Плюс",   desc: "В рублях, юанях или дирхамах",       badge: "До 14,7%", tags: ["stabil", "podushka", "visok"] },
  { id: "mts-dengi",    img: "/images/prod-mts-dengi.png",    title: "МТС Деньги",   desc: "В рублях. Без снятия и пополнения",  badge: "До 14,5%", tags: ["stabil", "podushka"] },
  { id: "mts-maksimum", img: "/images/prod-mts-maksimum.png", title: "МТС Максимум", desc: "Динамическая доходность в рублях",   badge: "До 14,5%", tags: ["stabil", "podushka"] },
];

const SECTION_MARKET: CardData[] = [
  { id: "mts-nakopleniya", img: "/images/prod-mts-nakopleniya.png", title: "МТС Накопления",  desc: "Получайте кешбэк за деньги на счету",       badge: "До 16,5%", tags: ["dostup", "popol", "visok"] },
  { id: "tsifrovye",       img: "/images/prod-tsifrovye.png",       title: "Цифровые активы", desc: "Как облигации, только на блокчейне",         badge: "до 21%",   tags: ["dostup", "popol", "visok"] },
  { id: "metally",         img: "/images/prod-metally.png",         title: "Металлы",         desc: "Сделки с золотом, серебром и платиной",      badge: "до 20%",   tags: ["dostup", "popol"] },
];

/* ── FAQ DATA ── */
const FAQ_ITEMS = [
  { id: 1, title: "Накопительные счета",          answer: "Накопительный счёт — способ хранить деньги с начислением процентов. В отличие от вклада, деньги можно снимать и пополнять в любое время." },
  { id: 2, title: "Вклады",                       answer: "Вклад — банковский продукт для хранения средств под фиксированный процент на определённый срок. Досрочное снятие влечёт потерю процентов." },
  { id: 3, title: "МТС Накопления",               answer: "МТС Накопления — рыночный инструмент с динамической доходностью. Средства инвестируются в диверсифицированный портфель активов." },
  { id: 4, title: "Цифровые финансовые активы",   answer: "ЦФА — цифровые права на блокчейне. Работают как облигации: получаете фиксированный доход по истечении срока." },
  { id: 5, title: "Металлы",                      answer: "ОМС позволяют покупать и продавать золото, серебро, платину и палладий в любое время без хранения физического металла." },
  { id: 6, title: "Бонусы за накопления",         answer: "Начисляем кешбэк за среднемесячный остаток на накопительных счетах. Бонусы тратятся на услуги МТС и партнёров." },
];

/* ── SKELETON CARD ── */
function SkeletonCard() {
  return (
    <div className="sk-card">
      <div className="sk-bar" style={{ width: 104, height: 20 }} />
      <div className="sk-text-group">
        <div className="sk-bar" style={{ width: 94, height: 16 }} />
        <div className="sk-bar" style={{ width: 122, height: 12 }} />
      </div>
    </div>
  );
}

/* ── SKELETON PANEL (replaces lower-panel while loading) ── */
function SkeletonPanel() {
  return (
    <div className="lower-panel">
      {/* Section 1 — 4 cards */}
      <div className="sk-section">
        <div className="sk-label">
          <div className="sk-bar" style={{ width: 142, height: 12 }} />
        </div>
        <div className="cards-row">
          {[0,1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
      {/* Section 2 — 3 cards */}
      <div className="sk-section">
        <div className="sk-label">
          <div className="sk-bar" style={{ width: 142, height: 12 }} />
        </div>
        <div className="cards-row">
          {[0,1,2].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
      {/* Section 3 — 3 cards */}
      <div className="sk-section">
        <div className="sk-label">
          <div className="sk-bar" style={{ width: 142, height: 12 }} />
        </div>
        <div className="cards-row">
          {[0,1,2].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    </div>
  );
}

/* ── CARD COMPONENT ── */
function ProductCard({ card }: { card: CardData }) {
  return (
    <div className="product-card">
      <div className="card-text-group">
        <p className="card-title">{card.title}</p>
        <p className="card-desc">{card.desc}</p>
      </div>
      <img className="card-product-img" src={card.img} alt="" />
      <span className="card-badge">{card.badge}</span>
    </div>
  );
}

/* ── PAGE ── */
export default function Page() {
  /* No chips selected = no filter = all products shown */
  const [activeChips, setActiveChips] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading]     = useState(false);
  const [openFaq, setOpenFaq]         = useState<number | null>(null);
  const skTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const toggleChip = useCallback((idx: number) => {
    setActiveChips((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
    if (ENABLE_LOADING_SKELETON) {
      setIsLoading(true);
      clearTimeout(skTimerRef.current);
      skTimerRef.current = setTimeout(() => setIsLoading(false), SKELETON_DURATION_MS);
    }
  }, []);

  /* AND logic: card must have ALL active chip keys in its tags.
     If no chips selected → show all cards. */
  const filterCards = useCallback(
    (cards: CardData[]) => {
      if (activeChips.size === 0) return cards;
      const activeKeys = [...activeChips].map((i) => CHIP_KEYS[i]);
      return cards.filter((c) => activeKeys.every((k) => c.tags.includes(k)));
    },
    [activeChips]
  );

  const filteredSavings  = useMemo(() => filterCards(SECTION_SAVINGS),  [filterCards]);
  const filteredDeposits = useMemo(() => filterCards(SECTION_DEPOSITS), [filterCards]);
  const filteredMarket   = useMemo(() => filterCards(SECTION_MARKET),   [filterCards]);

  return (
    <div className="screen" id="top">
      <div className="top-gradient" />

      {/* ── Navbar ── */}
      <div className="navbar">
        <div className="status-bar">
          <div className="status-time">09:41</div>
          <div className="status-icons">
            <img src="/images/icon-wifi.svg" alt="wifi" />
            <img src="/images/icon-cell.svg" alt="signal" />
            <img src="/images/icon-battery.svg" alt="battery" />
          </div>
        </div>
        <div className="navbar-content">
          <div className="navbar-inner">
            <button className="icon-button" aria-label="Назад">
              <img src="/images/icon-back.svg" alt="" />
            </button>
            <div className="icon-button" style={{ opacity: 0, pointerEvents: "none" }}>
              <img src="/images/icon-back.svg" alt="" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="hero">
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
          <p className="hero-title">Накопления</p>
          <p className="hero-subtitle">Выберите критерии, покажем варианты</p>
        </div>

        {/* Chips */}
        <div className="chips-container">
          {CHIPS.map((chip, idx) => (
            <button
              key={idx}
              className={`chip${activeChips.has(idx) ? " selected" : ""}`}
              onClick={() => toggleChip(idx)}
            >
              <div className="chip-icon">
                <img src={chip.imgSrc} alt="" style={{ position: "absolute", maxWidth: "none", ...chip.imgStyle }} />
              </div>
              <span className="chip-label">{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Slide dots ── */}
      <div className="slide-dots">
        <div className="dot dot-sm" />
        <div className="dot dot-md" />
        <div className="dot-active">
          <div className="dot-active-bg" />
          <div className="dot-active-fill" />
        </div>
        <div className="dot dot-md" />
        <div className="dot dot-sm" />
      </div>

      {/* ── Lower panel: Cards (or skeleton while loading) ── */}
      {isLoading ? <SkeletonPanel /> : (
        <div className="lower-panel">
          {filteredSavings.length > 0 && (
            <div className="section-block">
              <div className="section-label"><p>Счета и бонусы</p></div>
              <div className="cards-row">
                {filteredSavings.map((card) => <ProductCard key={card.id} card={card} />)}
              </div>
            </div>
          )}

          {filteredDeposits.length > 0 && (
            <div className="section-block gap-12">
              <div className="section-label"><p>Вклады</p></div>
              <div className="cards-row">
                {filteredDeposits.map((card) => <ProductCard key={card.id} card={card} />)}
              </div>
            </div>
          )}

          {filteredMarket.length > 0 && (
            <div className="section-block gap-12">
              <div className="section-label"><p>Рыночные инструменты</p></div>
              <div className="cards-row">
                {filteredMarket.map((card) => <ProductCard key={card.id} card={card} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FAQ ── */}
      <div className="faq-panel">
        <div className="faq-title-row">
          <span className="faq-title">Частые вопросы</span>
        </div>
        <div className="faq-list">
          {FAQ_ITEMS.map((item) => (
            <div
              key={item.id}
              className="accordion-item"
              onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}
            >
              <div className="accordion-header">
                <p className="accordion-title">{item.title}</p>
                <span className={`accordion-chevron${openFaq === item.id ? " open" : ""}`}>
                  <img src="/images/icon-chevron-down.svg" alt="" />
                </span>
              </div>
              <div className={`accordion-body${openFaq === item.id ? " open" : ""}`}>
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── End panel ── */}
      <div className="end-panel">
        <div className="end-content">
          <div className="end-illustration">
            <img
              src="/images/end-section.png"
              alt=""
              style={{ position: "absolute", width: 375, height: "auto", left: "50%", transform: "translateX(-50%)", top: 0 }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
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

      {/* ── Home indicator ── */}
      <div className="home-indicator">
        <div className="home-handle" />
      </div>
    </div>
  );
}
