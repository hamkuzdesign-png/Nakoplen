"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { asset } from "@/lib/asset";
import { getShowcasePrototype, recordShowcaseProductVisit, reportShowcaseCompletionTime, reportShortestPath } from "@/lib/metrika";

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
  icon: asset("/images/chip-card.png"),
  title: "Нужна карта МТС Деньги",
  desc: "Закажите дебетовую карту онлайн, доставим в удобное место и время",
};

/* "Бонусы за накопления" (a4) — its own Figma layout, no hero */
const BONUS_DETAIL = {
  navTitle: "Бонусы за накопления",
  cardTitle: "Подключите бонусы",
  cardSubtitle: "И держите нужную сумму на отдельном счёте",
  bonuses: [
    { icon: asset("/images/pd-bonus/icon-marketplace.png"), title: "15% Маркетплейсы", desc: "За остаток 50 000 ₽" },
    { icon: asset("/images/pd-bonus/icon-zhkh.png"),         title: "5% ЖКХ",            desc: "За остаток 30 000 ₽" },
    { icon: asset("/images/pd-bonus/icon-transport.png"),    title: "30% Транспорт",     desc: "За остаток 30 000 ₽" },
    { icon: asset("/images/pd-bonus/icon-qr.png"),            title: "2% Оплата QR",      desc: "За остаток 20 000 ₽" },
  ] as BonusCell[],
  howTitle: "Как это работает",
  steps: [
    { icon: asset("/images/pd-bonus/icon-pick.svg"),     title: "Выбирайте бонусы по душе",  desc: "Дополнительные кешбэки в кино, супермаркетах и не только" },
    { icon: asset("/images/pd-bonus/icon-keep.svg"),     title: "И держите деньги на счёте", desc: "В приложении видно, какую сумму и как долго хранить" },
    { icon: asset("/images/pd-bonus/icon-activate.svg"), title: "Когда активируем бонусы",   desc: "Подключим кешбэк, как только накопите дни с нужным остатком" },
    { icon: asset("/images/pd-bonus/icon-more.svg"),     title: "Больше о счёте",            desc: "Закрыть можно в любой момент, но тогда вы не получите выгоду" },
  ] as Feature[],
  termsLink: "Подробная информация",
  bottomSummary: "Сумма пополнения — 110 000 ₽",
};

const PRODUCTS: Record<string, ProductDetail> = {
  a1: {
    heroBg: "url('/images/bgpp.png') center / cover no-repeat",
    heroImg: asset("/images/EDPP.png"),
    title: "МТС Счёт — доход каждый день",
    subtitle: "Начисляем проценты на ежедневный остаток. Снимайте и пополняйте без ограничений",
    features: [
      { icon: asset("/images/ED-1-BULL.png"), title: "Ставка до 15,5% годовых", desc: "Процент зависит от тарифа — смотрите подробные условия" },
      { icon: asset("/images/ED-2-BULL.png"), title: "Счёт растёт каждый день", desc: "Считаем процент на ежедневный остаток, зачисляем каждый месяц" },
      { icon: asset("/images/ED-3-BULL.png"), title: "Снимайте и пополняйте", desc: "Без потери процентов и в любой момент" },
      { icon: asset("/images/ED-4-BULL.png"), title: "Копите на цель", desc: "Выберите цель — ремонт, отпуск или машина. И копить будет проще" },
      { icon: asset("/images/ED-5-BULL.png"), title: "Повышенный лимит в Премиум и Private", desc: "Получайте максимальную доходность на сумму до 10 млн ₽ в Премиум, до 50 млн ₽ — в Private" },
    ],
  },
  a2: {
    heroBg: "url('/images/bgpp.png') center / cover no-repeat",
    heroImg: asset("/images/KK.png"),
    title: "Кешбокс — карта заряжает счёт",
    subtitle: "Ежедневно зачисляем проценты. Для открытия счёта нужна карта МТС Деньги",
    features: [
      { icon: asset("/images/1-MD.png"), title: "Ставка до 14% годовых", desc: "Начните с базовой ставки 9% и увеличивайте её каждый день" },
      { icon: asset("/images/2-MD.png"), title: "Как начисляются проценты", desc: "Выплачиваем доход каждый день на карту МТС Деньги" },
      { icon: asset("/images/3-MD.png"), title: "Максимальный доход", desc: "Ставка 14% действует на любую сумму, которая лежит на счёте" },
      { icon: asset("/images/4-MD.png"), title: "Как повысить ставку", desc: "Покупайте по карте МТС Деньги каждый день на сумму от 350 ₽" },
      { icon: asset("/images/5-MD.png"), title: "Если не потратить 350 ₽", desc: "Ставка станет 9%, но её снова можно увеличить" },
    ],
  },
  a3: {
    heroBg: "url('/images/bgpp.png') center / cover no-repeat",
    heroImg: asset("/images/Minimal.png"),
    title: "МТС Счёт — на минимальный остаток",
    subtitle: "Начисляем проценты на минимальный остаток за расчётный период",
    features: [
      { icon: asset("/images/1-MD.png"), title: "Ставка до 13% годовых", desc: "Зарплатным и премиальным клиентам, а всем остальным — 12,5%. Ставка действует без условий" },
      { icon: asset("/images/2-MD.png"), title: "Как работает расчётный период", desc: "Например, вы пополнили счёт 8 мая. Первый расчётный период — до 30 мая, следующий — до 29 июня" },
      { icon: asset("/images/3-MD.png"), title: "Если не планируете тратить", desc: "Выгодно выбирать счёт с доходом на минимальный остаток за месяц" },
      { icon: asset("/images/4-MD.png"), title: "Если понадобятся деньги", desc: "Можно вывести наличные со счёта. Доход пересчитаем на новый остаток" },
      { icon: asset("/images/5-MD.png"), title: "Выплаты каждый месяц", desc: "Начисляем и выплачиваем проценты в последний календарный день месяца" },
    ],
  },
  d1: {
    heroBg: "url('/images/bgpp.png') center / cover no-repeat",
    heroImg: asset("/images/PL.png"),
    title: "Вклад Плюс",
    subtitle: "Фиксированная доходность в рублях, юанях или дирхамах",
    features: [
      { icon: asset("/images/PL1.png"), title: "Выбирайте комфортный срок", desc: "Откройте вклад на 3–12 месяцев" },
      { icon: asset("/images/PL2.png"), title: "Зафиксируйте сумму вклада", desc: "Минимум 10 000 ₽, максимальная сумма не ограничена" },
      { icon: asset("/images/PL3.png"), title: "Пополните в течение 3 дней", desc: "Переводите себе до 30 млн ₽ в месяц без комиссии через СБП" },
      { icon: asset("/images/PL4.png"), title: "Получите доходность до 14%", desc: "Подключите капитализацию процентов, чтобы заработать больше" },
    ],
  },
  d2: {
    heroBg: "linear-gradient(180deg, #7A1A2E 0%, #4D0F1C 65%, #1d2023 100%)",
    heroImg: asset("/images/prod-mts-dengi.png"),
    title: "Вклад МТС Деньги",
    subtitle: "Фиксированная ставка в рублях. Без снятия и пополнения",
    features: [
      { icon: asset("/images/chip-percent.png"),  title: "Ставка до 13,5% годовых",      desc: "Максимальная ставка на срок 90 дней" },
      { icon: asset("/images/chip-coins.png"),    title: "Выплата процентов",            desc: "Проценты выплачиваются в конце срока" },
      { icon: asset("/images/chip-shield.png"),   title: "Застрахован государством",     desc: "Вклад застрахован АСВ на сумму до 1,4 млн рублей" },
      { icon: asset("/images/chip-stable.png"),   title: "Фиксированная ставка",         desc: "Ставка зафиксирована на весь срок и не меняется" },
    ],
  },
  d3: {
    heroBg: "linear-gradient(180deg, #0A1628 0%, #06101C 65%, #1d2023 100%)",
    heroImg: asset("/images/prod-mts-maksimum.png"),
    title: "Вклад МТС Максимум",
    subtitle: "Динамическая доходность — ставка растёт вместе с суммой",
    features: [
      { icon: asset("/images/chip-percent.png"),   title: "Ставка до 14,2% годовых",     desc: "Ставка зависит от суммы и срока вклада" },
      { icon: asset("/images/chip-high-rate.png"), title: "Динамическая доходность",     desc: "Чем больше сумма на счёте, тем выше ставка" },
      { icon: asset("/images/chip-shield.png"),    title: "Застрахован государством",    desc: "Вклад застрахован АСВ на сумму до 1,4 млн рублей" },
      { icon: asset("/images/chip-stable.png"),    title: "Рублёвый вклад",              desc: "Открывается только в рублях" },
    ],
  },
  m1: {
    heroBg: "url('/images/bgpp.png') center / cover no-repeat",
    heroImg: asset("/images/155.png"),
    title: "МТС Накопления",
    subtitle: "Рыночный инструмент с динамической доходностью и ежедневным начислением",
    features: [
      { icon: asset("/images/TT1.png"), title: "Доход каждый день", desc: "Если положить от 100 ₽" },
      { icon: asset("/images/TT2.png"), title: "Можно снять", desc: "Деньги доступны в любое время, но вывод занимает 2–3 рабочих дня" },
      { icon: asset("/images/TT3.png"), title: "В основе цифровые облигации МТС", desc: "Они не меняют свои цену и не торгуются" },
      { icon: asset("/images/TT4.png"), title: "Получите доходность до 14%", desc: "Подключите капитализацию процентов, чтобы заработать больше" },
    ],
  },
  m2: {
    heroBg: "linear-gradient(180deg, #004D5E 0%, #003040 65%, #1d2023 100%)",
    heroImg: asset("/images/prod-tsifrovye.png"),
    title: "Цифровые активы",
    subtitle: "Инвестируйте в активы новым способом с фиксированной доходностью",
    features: [
      { icon: asset("/images/chip-percent.png"), title: "Доходность до 20% годовых",     desc: "Фиксированная доходность на срок владения" },
      { icon: asset("/images/chip-stable.png"),  title: "Новый вид активов",             desc: "ЦФА — цифровые финансовые активы на блокчейне" },
      { icon: asset("/images/chip-coins.png"),   title: "Выплата в конце срока",         desc: "Доход выплачивается по истечении срока" },
      { icon: asset("/images/chip-access.png"),  title: "Досрочное погашение",           desc: "Возможность погашения до истечения срока" },
    ],
  },
  m3: {
    heroBg: "url('/images/bgpp.png') center / cover no-repeat",
    heroImg: asset("/images/met.png"),
    title: "Откройте металлический счёт",
    subtitle: "Сделки с золотом, серебром, платиной и палладием 24/7",
    features: [
      { icon: asset("/images/MET1.png"), title: "Начните с небольших вложений", desc: "Минимальная сумма покупки – 0,1 грамм" },
      { icon: asset("/images/MET2.png"), title: "Без комиссии", desc: "Бесплатное открытие и обслуживание счёта" },
      { icon: asset("/images/MET3.png"), title: "Ликвидно", desc: "Стоимость металлов стабильно растёт каждый год" },
    ],
  },
};

/* b1/b2 are best-of copies of a1/a2 */
PRODUCTS.b1 = PRODUCTS.a1;
PRODUCTS.b2 = PRODUCTS.a2;

export default function ProductClient({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  /* УПРИД / Аноним: «Бонусы за накопления» и «МТС Накопления» остаются без изменений */
  const scenario = searchParams.get("scenario");
  const prototype = searchParams.get("prototype");
  const showcasePrototype = scenario === "showcase_test" ? getShowcasePrototype(prototype) : null;
  const prototypeCatalogHref = scenario === "showcase_test" && prototype
    ? `/new-catalog?scenario=showcase_test&prototype=${prototype}`
    : null;
  const goBack = () => {
    if (prototypeCatalogHref) {
      router.push(prototypeCatalogHref);
      return;
    }
    router.back();
  };
  const needsCard = (scenario === "uprid" || scenario === "anon") && id !== "a4" && id !== "m1";
  const needsIdentity = scenario === "anon" && (id === "a4" || id === "m1");
  /* Идентифицированный (без scenario): полный флоу открытия Кешбокса */
  const opensCashbox = !scenario && (id === "a2" || id === "b2");
  const showcaseSuccess = scenario === "showcase_test" && ((prototype === "cashbox" && id === "a2") || (prototype === "deposit" && id === "d1") || (prototype === "metals" && id === "m3") || (prototype === "mts" && id === "m1"));
  useEffect(() => {
    if (showcasePrototype) recordShowcaseProductVisit(showcasePrototype, id);
  }, [id, showcasePrototype]);
  const UNLOCK_FEATURE: Feature = {
    icon: asset("/images/chip-lock.png"),
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
                <img src={asset("/images/icon-back.svg")} alt="" style={{ width: 24, height: 24 }} />
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
                      <img src={asset("/images/pd-bonus/icon-info.svg")} alt="" style={{ width: 24, height: 24 }} />
                    </button>
                    <div className="pd-bonus-checkbox">
                      <img src={asset("/images/pd-bonus/icon-checkbox-off.svg")} alt="" style={{ width: 18, height: 18 }} />
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

  const rawProduct = PRODUCTS[id];
  const isSavingsPromo = id === "a1" || id === "a2" || id === "a3" || id === "b1" || id === "b2" || (id === "d1" && scenario === "showcase_test") || (id === "m3" && scenario === "showcase_test") || (id === "m1" && scenario === "showcase_test");
  /* Сценарий "созданные продукты": у пользователя уже открыт этот счёт по
     ставке 11,7%, а не по маркетинговым 15,2% — подменяем только текст ставки. */
  const product =
    rawProduct && scenario === "owned" && (id === "a1" || id === "b1")
      ? {
          ...rawProduct,
          features: rawProduct.features.map(f =>
            f.title === "Ставка до 15,5% годовых" ? { ...f, title: "Ставка до 11,7% годовых" } : f
          ),
        }
      : rawProduct;

  if (!product) {
    return (
      <div className="screen" style={{ alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#969fa8", fontFamily: "'MTS Compact', sans-serif" }}>Продукт не найден</p>
      </div>
    );
  }

  return (
    <div className={`pd-screen${isSavingsPromo ? " pd-screen-savings-promo" : ""}${id === "a1" || id === "b1" ? " pd-screen-savings-ed" : ""}${scenario === "showcase_test" && id === "a3" ? " pd-screen-savings-minimal-showcase" : ""}${scenario === "showcase_test" && id === "a2" ? " pd-screen-savings-cashbox-showcase" : ""}${scenario === "showcase_test" && id === "d1" ? " pd-screen-savings-deposit-showcase" : ""}${scenario === "showcase_test" && id === "m3" ? " pd-screen-savings-metals-showcase" : ""}${scenario === "showcase_test" && id === "m1" ? " pd-screen-savings-mts-showcase" : ""}`}>
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
            {scenario === "showcase_test" && id === "m1" ? (
              <div className="pd-term-chips" aria-label="Срок накопления">
                {["Без срока", "1 мес", "3 мес", "4 мес", "от 1 дня"].map((label, i) => (
                  <span key={label} className={`pd-term-chip${i === 0 ? " is-active" : ""}`}>{label}</span>
                ))}
              </div>
            ) : null}
            {id === "a1" || id === "b1" || (scenario === "showcase_test" && id === "a3") || (scenario === "showcase_test" && id === "a2") || (scenario === "showcase_test" && id === "d1") || (scenario === "showcase_test" && id === "m3") ? (
              <p className="pd-promo-title">{id === "a2" ? "Кешбокс — карта заряжает счёт до 14%" : id === "d1" || id === "m3" ? product.title : <>Накопительный счёт<br />на {id === "a3" ? "минимальный" : "ежедневный"} остаток</>}</p>
            ) : null}
          </div>
        )}

        {/* Back button overlay */}
        <div className="pd-navbar">
          <button className="pd-back-btn" onClick={goBack} aria-label="Назад">
            <img src={asset("/images/icon-back.svg")} alt="" style={{ width: 24, height: 24, opacity: 0.9 }} />
          </button>
        </div>

        {/* Content panel */}
        <div className="pd-content">
          {/* Title block */}
          {!isSavingsPromo && (
            <div className="pd-title-block">
              <p className="pd-title">{product.title}</p>
              <p className="pd-subtitle">{product.subtitle}</p>
            </div>
          )}

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

          {/* Terms link stays in the content for regular product screens. */}
          {!isSavingsPromo && (
            <div className="pd-terms">
              <span className="pd-terms-link">Условия счёта</span>
            </div>
          )}
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="pd-bottom">
        <button className="pd-cta-btn" onClick={() => {
          if (showcaseSuccess) {
            if (showcasePrototype) reportShortestPath(showcasePrototype);
            if (showcasePrototype) reportShowcaseCompletionTime(showcasePrototype);
            router.push(`/showcase-success?product=${id}&prototype=${showcasePrototype}`);
          }
          else if (needsIdentity) router.push(`/identity${scenario ? `?scenario=${scenario}` : ""}`);
          else if (needsCard) router.push(`/card${scenario ? `?scenario=${scenario}` : ""}`);
          else if (opensCashbox) router.push("/open-cashbox");
        }}>{needsIdentity ? "Подтвердить личность" : needsCard ? "Оформить карту" : id === "m1" ? "Открыть счёт" : "Продолжить"}</button>
        {isSavingsPromo && (id === "m1" ? (
          <div className="pd-promo-bottom-label">Без срока · 15% годовых</div>
        ) : (
          <div className="pd-terms"><span className="pd-terms-link">Условия счёта</span></div>
        ))}
      </div>
    </div>
  );
}
