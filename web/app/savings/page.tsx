"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ── DATA ── */
const ACCOUNTS = [
  {
    id: "mts-schet",
    bg: "#574DC1",
    initials: "М",
    name: "МТС Счёт",
    balance: "52 000,32 ₽",
    subtitle: "16% на ежедневный остаток",
    income: "+10,23 ₽",
  },
  {
    id: "mts-plus",
    bg: "#1D9B7B",
    initials: "М+",
    name: "МТС Плюс",
    balance: "0 ₽",
    subtitle: "Пополните до 25 августа 2024",
    income: "+10,23 ₽",
  },
  {
    id: "vklad-max",
    bg: "#2A3347",
    initials: "В",
    name: "Вклад МТС Максимум",
    balance: "154 900 ₽",
    subtitle: "18,3%, потратьте до 15.02, ещё 38 000 ₽",
    income: "+10,23 ₽",
  },
  {
    id: "cfa-gorizont",
    bg: "#E87B3A",
    initials: "Г",
    name: "ЦФА Горизонтор",
    balance: "154 900 ₽",
    subtitle: "До 8 ноября 2024",
    income: "+10,23 ₽",
  },
  {
    id: "cfa-personal",
    bg: "#3D3587",
    initials: "Л",
    name: "Личный счёт для ЦФА",
    balance: "154 900 ₽",
    subtitle: "Бессрочный",
    income: "+10,23 ₽",
  },
  {
    id: "gold",
    bg: "#B8882A",
    initials: "Au",
    name: "Золото",
    balance: "154 900 ₽",
    subtitle: "30 г.",
    income: "+10,23 ₽",
  },
];

export default function SavingsPage() {
  const router = useRouter();
  return (
    <div className="screen sv-screen page-enter">
      <div className="top-gradient" />

      {/* Navbar */}
      <div className="sv-navbar">
        <button className="icon-button" aria-label="Назад" onClick={() => router.back()}>
          <img src="/images/icon-back.svg" alt="" />
        </button>
        <span className="sv-navbar-bell">🔔</span>
      </div>

      {/* Hero — title + balance + income */}
      <div className="sv-hero">
        <p className="sv-label">Накопления</p>
        <p className="sv-balance">652 000,32 ₽</p>
        <div className="sv-income-badge">
          <span className="sv-income-green">+8 546 ₽</span>
          <span className="sv-income-muted"> за всё время ↑</span>
        </div>
      </div>

      {/* Row 1: Пополнить / Перевести */}
      <div className="sv-row1">
        <button className="sv-btn-main">+ Пополнить</button>
        <button className="sv-btn-main">Перевести</button>
      </div>

      {/* Row 2: Аналитика / Новая цель / Открыть */}
      <div className="sv-row2">
        <button className="sv-chip-btn"><span>📊</span>Аналитика</button>
        <button className="sv-chip-btn"><span>🎯</span>Новая цель</button>
        <Link href="/catalog" className="sv-chip-btn">🔓 Открыть</Link>
      </div>

      {/* Product list */}
      <div className="sv-product-list">
        {ACCOUNTS.map((acc, i) => (
          <div
            key={acc.id}
            className={`sv-product-row${i < ACCOUNTS.length - 1 ? " sv-product-row--sep" : ""}`}
          >
            <div className="sv-product-icon" style={{ background: acc.bg }}>
              <span className="sv-product-icon-text">{acc.initials}</span>
            </div>
            <div className="sv-product-meta">
              <p className="sv-product-name">{acc.name}</p>
              <p className="sv-product-sub">{acc.subtitle}</p>
            </div>
            <div className="sv-product-right">
              <p className="sv-product-balance">{acc.balance}</p>
              <p className="sv-product-income">{acc.income}</p>
            </div>
          </div>
        ))}

        {/* Add row — new product suggestion */}
        <Link href="/catalog" className="sv-add-row">
          <div className="sv-add-icon">+</div>
          <div className="sv-product-meta">
            <p className="sv-product-name">Накопительный счёт «Кешбокс»</p>
            <p className="sv-product-sub">до 15% с ежедневной выплатой</p>
          </div>
        </Link>
      </div>

      {/* CTA */}
      <Link href="/catalog" className="sv-cta">
        <span className="sv-cta-main">Подобрать накопление</span>
        <span className="sv-cta-sub">+ с умным поиском продуктов</span>
      </Link>
    </div>
  );
}
