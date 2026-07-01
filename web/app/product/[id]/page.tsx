"use client";

import { use } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Feature = {
  icon: string;
  title: string;
  desc: string;
};

type ProductDetail = {
  heroBg: string;
  heroImg: string;
  /** Full hero image from Figma (icon + background baked in). When set,
   * this replaces heroBg/heroImg entirely. */
  heroFull?: string;
  title: string;
  subtitle: string;
  features: Feature[];
};

type BonusCell = { icon: string; title: string; desc: string };

/* УПРИД: для продуктов, требующих карту МТС Деньги, первым буллитом — её оформление */
const CARD_REQUIRED_FEATURE: Feature = {
  icon: "/images/chip-card.png",
  title: "Нужна карта МТС Деньги",
  desc: "Закажите дебетовую карту онлайн, доставим в удобное место и время",
};

/* "Бонусы за накопления" (a4) — its own Figma layout, no hero */
const BONUS_DETAIL = {
  navTitle: "Бонусы за накопления",
  cardTitle: "Подключите бонусы",
  cardSubtitle: "И держите нужную сумму на отдельном счёте",
  bonuses: [
    { icon: "/images/pd-bonus/icon-marketplace.png", title: "15% Маркетплейсы", desc: "За остаток 50 000 ₽" },
    { icon: "/images/pd-bonus/icon-zhkh.png",         title: "5% ЖКХ",            desc: "За остаток 30 000 ₽" },
    { icon: "/images/pd-bonus/icon-transport.png",    title: "30% Транспорт",     desc: "За остаток 30 000 ₽" },
    { icon: "/images/pd-bonus/icon-qr.png",            title: "2% Оплата QR",      desc: "За остаток 20 000 ₽" },
  ] as BonusCell[],
  howTitle: "Как это работает",
  steps: [
    { icon: "/images/pd-bonus/icon-pick.svg",     title: "Выбирайте бонусы по душе",  desc: "Дополнительные кешбэки в кино, супермаркетах и не только" },
    { icon: "/images/pd-bonus/icon-keep.svg",     title: "И держите деньги на счёте", desc: "В приложении видно, какую сумму и как долго хранить" },
    { icon: "/images/pd-bonus/icon-activate.svg", title: "Когда активируем бонусы",   desc: "Подключим кешбэк, как только накопите дни с нужным остатком" },
    { icon: "/images/pd-bonus/icon-more.svg",     title: "Больше о счёте",            desc: "Закрыть можно в любой момент, но тогда вы не получите выгоду" },
  ] as Feature[],
  termsLink: "Подробная информация",
  bottomSummary: "Сумма пополнения — 110 000 ₽",
};

const PRODUCTS: Record<string, ProductDetail> = {
  a1: {
    heroBg: "linear-gradient(180deg, #1B3A7A 0%, #0D1E42 65%, #1d2023 100%)",
    heroImg: "/images/prod-ejednevny.png",
    heroFull: "/images/hero-a1.png",
    title: "МТС Счёт — доход каждый день",
    subtitle: "Начисляем проценты на ежедневный остаток. Снимайте и пополняйте без ограничений",
    features: [
      { icon: "/images/chip-percent.png",  title: "Ставка до 15,5% годовых",     desc: "Начисляем проценты на ежедневный остаток на счёте" },
      { icon: "/images/chip-coins.png",    title: "Выплата процентов",            desc: "Проценты выплачиваем ежедневно на карту МТС Деньги" },
      { icon: "/images/chip-lock.png",     title: "Снятие без ограничений",       desc: "Выводите деньги в любое время без потери процентов" },
      { icon: "/images/chip-refill.png",   title: "Пополнение в любое время",    desc: "Пополняйте счёт когда угодно, проценты начнут начисляться сразу" },
      { icon: "/images/chip-shield.png",   title: "Застрахован государством",     desc: "Вклад застрахован АСВ на сумму до 1,4 млн рублей" },
    ],
  },
  a2: {
    heroBg: "linear-gradient(180deg, #574DC1 0%, #3730A3 50%, #1d2023 100%)",
    heroImg: "/images/prod-keshboks.png",
    heroFull: "/images/hero-a2.png",
    title: "Кешбокс — карта заряжает счёт",
    subtitle: "Ежедневно зачисляем проценты. Для открытия счёта нужна карта МТС Деньги",
    features: [
      { icon: "/images/chip-percent.png",  title: "Ставка до 15% годовых",        desc: "Начните с базовой ставки 9% и увеличивайте её каждый день" },
      { icon: "/images/chip-card.png",     title: "Как начисляются проценты",     desc: "Покупайте по карте МТС Деньги каждый день на сумму от 350 ₽" },
      { icon: "/images/chip-high-rate.png",title: "Если не потратить 350 ₽",     desc: "Ставка станет 11%, но её снова можно увеличить" },
      { icon: "/images/chip-coins.png",    title: "Выплата процентов",            desc: "Выплачиваем доход каждый день на карту МТС Деньги" },
      { icon: "/images/chip-pillow.png",   title: "Максимальный доход",           desc: "Ставка 20% действует на любую сумму, которая лежит на счёте" },
    ],
  },
  a3: {
    heroBg: "linear-gradient(180deg, #0B5B47 0%, #063D30 65%, #1d2023 100%)",
    heroImg: "/images/prod-minimalny.png",
    heroFull: "/images/hero-a3.png",
    title: "МТС Счёт — на минимальный остаток",
    subtitle: "Начисляем проценты на минимальный остаток за расчётный период",
    features: [
      { icon: "/images/chip-percent.png",  title: "Ставка до 12,5% годовых",      desc: "Начисляем проценты на минимальный остаток за месяц" },
      { icon: "/images/chip-coins.png",    title: "Выплата процентов",            desc: "Проценты выплачиваем ежемесячно на карту МТС Деньги" },
      { icon: "/images/chip-lock.png",     title: "Снятие без ограничений",       desc: "Выводите деньги в любое время" },
      { icon: "/images/chip-refill.png",   title: "Пополнение в любое время",    desc: "Пополняйте счёт без ограничений по сумме" },
      { icon: "/images/chip-shield.png",   title: "Застрахован государством",     desc: "Вклад застрахован АСВ на сумму до 1,4 млн рублей" },
    ],
  },
  d1: {
    heroBg: "linear-gradient(180deg, #0B4D2F 0%, #063320 65%, #1d2023 100%)",
    heroImg: "/images/prod-vklad-plus.png",
    title: "Вклад Плюс — выбирайте валюту",
    subtitle: "Фиксированная доходность в рублях, юанях или дирхамах",
    features: [
      { icon: "/images/chip-percent.png",  title: "Ставка до 14,7% годовых",      desc: "Фиксированная ставка на весь срок вклада" },
      { icon: "/images/chip-stable.png",   title: "Выбор валюты",                  desc: "Открывайте в рублях, китайских юанях или дирхамах ОАЭ" },
      { icon: "/images/chip-refill.png",   title: "Пополнение вклада",            desc: "Пополняйте вклад в течение первых 30 дней" },
      { icon: "/images/chip-lock.png",     title: "Частичное снятие",             desc: "Возможность частичного снятия без потери процентов" },
      { icon: "/images/chip-shield.png",   title: "Застрахован государством",     desc: "Вклад застрахован АСВ на сумму до 1,4 млн рублей" },
    ],
  },
  d2: {
    heroBg: "linear-gradient(180deg, #7A1A2E 0%, #4D0F1C 65%, #1d2023 100%)",
    heroImg: "/images/prod-mts-dengi.png",
    title: "Вклад МТС Деньги",
    subtitle: "Фиксированная ставка в рублях. Без снятия и пополнения",
    features: [
      { icon: "/images/chip-percent.png",  title: "Ставка до 14,5% годовых",      desc: "Максимальная ставка на срок 90 дней" },
      { icon: "/images/chip-coins.png",    title: "Выплата процентов",            desc: "Проценты выплачиваются в конце срока" },
      { icon: "/images/chip-shield.png",   title: "Застрахован государством",     desc: "Вклад застрахован АСВ на сумму до 1,4 млн рублей" },
      { icon: "/images/chip-stable.png",   title: "Фиксированная ставка",         desc: "Ставка зафиксирована на весь срок и не меняется" },
    ],
  },
  d3: {
    heroBg: "linear-gradient(180deg, #0A1628 0%, #06101C 65%, #1d2023 100%)",
    heroImg: "/images/prod-mts-maksimum.png",
    title: "Вклад МТС Максимум",
    subtitle: "Динамическая доходность — ставка растёт вместе с суммой",
    features: [
      { icon: "/images/chip-percent.png",   title: "Ставка до 14,5% годовых",     desc: "Ставка зависит от суммы и срока вклада" },
      { icon: "/images/chip-high-rate.png", title: "Динамическая доходность",     desc: "Чем больше сумма на счёте, тем выше ставка" },
      { icon: "/images/chip-shield.png",    title: "Застрахован государством",    desc: "Вклад застрахован АСВ на сумму до 1,4 млн рублей" },
      { icon: "/images/chip-stable.png",    title: "Рублёвый вклад",              desc: "Открывается только в рублях" },
    ],
  },
  m1: {
    heroBg: "linear-gradient(180deg, #0A1E3D 0%, #060F20 65%, #1d2023 100%)",
    heroImg: "/images/prod-mts-nakopleniya.png",
    title: "МТС Накопления",
    subtitle: "Рыночный инструмент с динамической доходностью и ежедневным начислением",
    features: [
      { icon: "/images/chip-percent.png",  title: "Доходность до 15,5% годовых", desc: "Динамическая доходность зависит от рынка" },
      { icon: "/images/chip-coins.png",    title: "Ежедневное начисление",        desc: "Проценты начисляются каждый день" },
      { icon: "/images/chip-lock.png",     title: "Снятие без ограничений",       desc: "Выводите деньги в любое время" },
      { icon: "/images/chip-refill.png",   title: "Пополнение счёта",             desc: "Пополняйте счёт без ограничений" },
    ],
  },
  m2: {
    heroBg: "linear-gradient(180deg, #004D5E 0%, #003040 65%, #1d2023 100%)",
    heroImg: "/images/prod-tsifrovye.png",
    title: "Цифровые активы",
    subtitle: "Инвестируйте в активы новым способом с фиксированной доходностью",
    features: [
      { icon: "/images/chip-percent.png", title: "Доходность до 21% годовых",     desc: "Фиксированная доходность на срок владения" },
      { icon: "/images/chip-stable.png",  title: "Новый вид активов",             desc: "ЦФА — цифровые финансовые активы на блокчейне" },
      { icon: "/images/chip-coins.png",   title: "Выплата в конце срока",         desc: "Доход выплачивается по истечении срока" },
      { icon: "/images/chip-access.png",  title: "Досрочное погашение",           desc: "Возможность погашения до истечения срока" },
    ],
  },
  m3: {
    heroBg: "linear-gradient(180deg, #4A3500 0%, #302300 65%, #1d2023 100%)",
    heroImg: "/images/prod-metally.png",
    heroFull: "/images/hero-m3.png",
    title: "Металлы",
    subtitle: "Сделки с золотом, серебром, платиной и палладием 24/7",
    features: [
      { icon: "/images/chip-percent.png", title: "Доходность до 20% годовых",     desc: "Доходность зависит от динамики цен на металлы" },
      { icon: "/images/chip-stable.png",  title: "Выбор металла",                 desc: "Торгуйте золотом, серебром, платиной и палладием" },
      { icon: "/images/chip-lock.png",    title: "Торговля 24/7",                 desc: "Совершайте сделки круглосуточно" },
      { icon: "/images/chip-coins.png",   title: "Без хранения металла",          desc: "Обезличенный металлический счёт без физической выдачи" },
    ],
  },
};

/* b1/b2 are best-of copies of a1/a2 */
PRODUCTS.b1 = PRODUCTS.a1;
PRODUCTS.b2 = PRODUCTS.a2;

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  /* УПРИД / Аноним: «Бонусы за накопления» и «МТС Накопления» остаются без изменений */
  const scenario = searchParams.get("scenario");
  const needsCard = (scenario === "uprid" || scenario === "anon") && id !== "a4" && id !== "m1";
  const needsIdentity = scenario === "anon" && (id === "a4" || id === "m1");
  const UNLOCK_FEATURE: Feature = {
    icon: "/images/chip-lock.png",
    title: "Откройте доступ к продукту",
    desc: "Подтвердите личность через госуслуги",
  };

  if (id === "a4") {
    const b = BONUS_DETAIL;
    return (
      <div className="pd-screen pd-screen-tall-bottom">
        {/* Animated wrapper — kept separate from .pd-bottom so its transform
            doesn't create a containing block that breaks position:fixed */}
        <div className="page-enter" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          {/* Navbar — no hero on this screen */}
          <div className="pd-navbar2">
            <div className="pd-navbar2-row">
              <button className="pd-navbar2-btn" onClick={() => router.back()} aria-label="Назад">
                <img src="/images/icon-back.svg" alt="" style={{ width: 24, height: 24 }} />
              </button>
              <p className="pd-navbar2-title">{b.navTitle}</p>
              <div style={{ width: 32, height: 32, flexShrink: 0 }} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
            {/* Подключите бонусы */}
            <div className="pd-card">
              <div className="pd-card-title-block">
                <p className="pd-card-title">{b.cardTitle}</p>
                <p className="pd-card-subtitle">{b.cardSubtitle}</p>
              </div>
              {b.bonuses.map((bonus, i) => (
                <div key={i} className="pd-bonus-cell">
                  <img src={bonus.icon} alt="" className="pd-bonus-icon" />
                  <div className="pd-bonus-text">
                    <p className="pd-bonus-title">{bonus.title}</p>
                    <p className="pd-bonus-desc">{bonus.desc}</p>
                  </div>
                  <div className="pd-bonus-right">
                    <button className="pd-bonus-info-btn" aria-label="Подробнее">
                      <img src="/images/pd-bonus/icon-info.svg" alt="" style={{ width: 24, height: 24 }} />
                    </button>
                    <div className="pd-bonus-checkbox">
                      <img src="/images/pd-bonus/icon-checkbox-off.svg" alt="" style={{ width: 18, height: 18 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Как это работает */}
            <div className="pd-card">
              <div className="pd-card-title-block">
                <p className="pd-card-title">{b.howTitle}</p>
              </div>
              <div className="pd-features">
                {(needsIdentity ? [UNLOCK_FEATURE, ...b.steps] : b.steps).map((s, i) => (
                  <div key={i} className="pd-feature">
                    <div className="pd-feature-icon-wrap">
                      <img src={s.icon} alt="" className="pd-feature-icon" />
                    </div>
                    <div className="pd-feature-text">
                      <p className="pd-feature-title">{s.title}</p>
                      <p className="pd-feature-desc">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms link */}
            <div className="pd-terms">
              <span className="pd-terms-link">{b.termsLink}</span>
            </div>
          </div>
        </div>

        {/* Fixed bottom — CTA */}
        <div className="pd-bottom pd-bottom-stacked">
          <div className="pd-cta-btn-wrap">
            <button className="pd-cta-btn" onClick={() => {
              if (needsIdentity) router.push(`/identity${scenario ? `?scenario=${scenario}` : ""}`);
            }}>{needsIdentity ? "Подтвердить личность" : "Продолжить"}</button>
          </div>
          <div className="pd-bottom-handle-wrap">
            <div className="pd-bottom-handle" />
          </div>
        </div>
      </div>
    );
  }

  const product = PRODUCTS[id];

  if (!product) {
    return (
      <div className="screen" style={{ alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#969fa8", fontFamily: "'MTS Compact', sans-serif" }}>Продукт не найден</p>
      </div>
    );
  }

  return (
    <div className="pd-screen">
      {/* Animated wrapper — kept separate from .pd-bottom so its transform
          doesn't create a containing block that breaks position:fixed */}
      <div className="page-enter" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Hero */}
        {product.heroFull ? (
          <div className="pd-hero">
            <img src={product.heroFull} alt="" className="pd-hero-full" />
          </div>
        ) : (
          <div className="pd-hero" style={{ background: product.heroBg }}>
            <img src={product.heroImg} alt="" className="pd-hero-img" />
          </div>
        )}

        {/* Back button overlay */}
        <div className="pd-navbar">
          <button className="pd-back-btn" onClick={() => router.back()} aria-label="Назад">
            <img src="/images/icon-back.svg" alt="" style={{ width: 24, height: 24, opacity: 0.9 }} />
          </button>
        </div>

        {/* Content panel */}
        <div className="pd-content">
          {/* Title block */}
          <div className="pd-title-block">
            <p className="pd-title">{product.title}</p>
            <p className="pd-subtitle">{product.subtitle}</p>
          </div>

          {/* Features */}
          <div className="pd-features">
            {(needsIdentity ? [UNLOCK_FEATURE, ...product.features] : needsCard ? [CARD_REQUIRED_FEATURE, ...product.features] : product.features).map((f, i) => (
              <div key={i} className="pd-feature">
                <div className="pd-feature-icon-wrap">
                  <img src={f.icon} alt="" className="pd-feature-icon" />
                </div>
                <div className="pd-feature-text">
                  <p className="pd-feature-title">{f.title}</p>
                  <p className="pd-feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Terms link */}
          <div className="pd-terms">
            <span className="pd-terms-link">Условия счёта</span>
          </div>
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="pd-bottom">
        <button className="pd-cta-btn" onClick={() => {
          if (needsIdentity) router.push(`/identity${scenario ? `?scenario=${scenario}` : ""}`);
          else if (needsCard) router.push(`/card${scenario ? `?scenario=${scenario}` : ""}`);
        }}>{needsIdentity ? "Подтвердить личность" : needsCard ? "Оформить карту" : "Продолжить"}</button>
      </div>
    </div>
  );
}
