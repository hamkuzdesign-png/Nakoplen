"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function CardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenario = searchParams.get("scenario");

  const features = [
    {
      icon: "/images/chip-coins.png",
      title: "До 10 000 ₽ кэшбэка",
      desc: "Выбирайте до 5 категорий на следующий месяц и получайте до 10 000 ₽ кэшбэка в месяц",
    },
    {
      icon: "/images/chip-shield.png",
      title: "МТС Premium в подарок",
      desc: "Бесплатно на 6 месяцев. Внутри 5% кэшбэка за супермаркеты, Защитник, KION, Строки, Музыка и другое",
    },
    {
      icon: "/images/chip-pillow.png",
      title: "Больше преимуществ в МТС",
      desc: "50 ГБ интернета в подарок и кэшбэк до 30% за оплату связи для абонентов МТС",
    },
    {
      icon: "/images/chip-refill.png",
      title: "Снятие и переводы",
      desc: "Переводите по СБП и снимайте до 100 000 ₽ без комиссии и в любых банкоматах РФ",
    },
    {
      icon: "/images/chip-access.png",
      title: "Бесплатное обслуживание",
      desc: "Выпустим бесплатно и доставим до вашего адреса или в магазин МТС",
    },
  ];

  return (
    <div className="pd-screen">
      <div className="page-enter" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Hero */}
        <div className="pd-hero" style={{ background: "linear-gradient(180deg, #b0c8d4 0%, #8eafc0 60%, #1d2023 100%)" }}>
          <img src="/images/hero-card.png" alt="" className="pd-hero-full" />
        </div>

        {/* Back button */}
        <div className="pd-navbar">
          <button className="pd-back-btn" onClick={() => router.back()} aria-label="Назад">
            <img src="/images/icon-back.svg" alt="" style={{ width: 24, height: 24, opacity: 0.9 }} />
          </button>
        </div>

        {/* Content panel */}
        <div className="pd-content">
          <div className="pd-title-block">
            <p className="pd-title">Пластиковая карта МТС Деньги</p>
            <p className="pd-subtitle">Получайте 30% кэшбэка за связь МТС</p>
          </div>

          <div className="pd-features">
            {features.map((f, i) => (
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

          <div className="pd-terms">
            <span className="pd-terms-link">Тарифы и условия</span>
          </div>
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="pd-bottom">
        <button className="pd-cta-btn">Продолжить</button>
      </div>
    </div>
  );
}
