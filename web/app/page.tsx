"use client";
import Link from "next/link";
import { useState } from "react";

type Status = { title: string; desc: string; href: string | null; badge?: string };
type Segment = "base" | "test";

const STATUSES: Status[] = [
  {
    title: "Аноним",
    desc: "Главная → Каталог",
    href: "/home-anon",
  },
  {
    title: "УПРИД",
    desc: "Главная → Каталог",
    href: "/home-uprid",
  },
  {
    title: "Идентифицированный",
    desc: "Главная → Каталог → Карточка продукта",
    href: "/home-identified",
  },
  {
    title: "Имеет продукты",
    desc: "Главная → Мои накопления → Каталог → Карточка продукта",
    href: "/home",
  },
  {
    title: "Имеет продукты — новый каталог",
    desc: "Главная → Мои накопления → Каталог → Карточка продукта",
    href: "/home?catalog=new",
    badge: "для ревью",
  },
  {
    title: "Новый каталог — пустое состояние",
    desc: "Фильтры всегда доступны, каталог может быть пустым",
    href: "/new-catalog-empty",
  },
];

const TEST_STATUSES: Status[] = [
  {
    title: "Первый сценарий",
    desc: "Сценарий пока не настроен",
    href: null,
  },
];

export default function MenuPage() {
  const [segment, setSegment] = useState<Segment>("base");
  const statuses = segment === "base" ? STATUSES : TEST_STATUSES;

  return (
    <div
      className="page-enter"
      style={{
        minHeight: "100svh",
        background: "#1d2023",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "max(48px, calc(20px + env(safe-area-inset-top)))",
        paddingBottom: "max(20px, calc(20px + env(safe-area-inset-bottom)))",
        paddingLeft: "max(20px, env(safe-area-inset-left))",
        paddingRight: "max(20px, env(safe-area-inset-right))",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <p
          style={{
            fontFamily: "'MTS Wide', sans-serif",
            fontWeight: 500,
            fontSize: 24,
            color: "#fafafa",
            marginBottom: 4,
          }}
        >
          Выберите прототип
        </p>

        <div
          role="tablist"
          aria-label="Тип сценариев"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 4,
            padding: 4,
            marginTop: 20,
            marginBottom: 24,
            borderRadius: 20,
            background: "rgba(98,108,119,0.25)",
          }}
        >
          {([
            { key: "base" as const, label: "Базовый" },
            { key: "test" as const, label: "Тестовый" },
          ]).map((item) => {
            const active = segment === item.key;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSegment(item.key)}
                style={{
                  height: 40,
                  border: 0,
                  borderRadius: 16,
                  background: active ? "#fafafa" : "transparent",
                  color: active ? "#1d2023" : "#969fa8",
                  fontFamily: "'MTS Compact', sans-serif",
                  fontWeight: 500,
                  fontSize: 15,
                  lineHeight: "20px",
                  cursor: "pointer",
                  transition: "background 180ms ease, color 180ms ease",
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {statuses.map((s) => {
            const inner = (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <p
                    style={{
                      fontFamily: "'MTS Compact', sans-serif",
                      fontWeight: 500,
                      fontSize: 17,
                      color: s.href ? "#fafafa" : "#626c77",
                      lineHeight: "24px",
                    }}
                  >
                    {s.title}
                  </p>
                  {!s.href && (
                    <span
                      style={{
                        fontFamily: "'MTS Compact', sans-serif",
                        fontWeight: 500,
                        fontSize: 12,
                        color: "#969fa8",
                        background: "rgba(98,108,119,0.4)",
                        borderRadius: 6,
                        padding: "2px 6px",
                        lineHeight: "16px",
                      }}
                    >
                      скоро
                    </span>
                  )}
                  {s.badge && (
                    <span
                      style={{
                        fontFamily: "'MTS Compact', sans-serif",
                        fontWeight: 700,
                        fontSize: 12,
                        color: "#1d2023",
                        background: "#26cd58",
                        borderRadius: 6,
                        padding: "2px 8px",
                        lineHeight: "16px",
                        whiteSpace: "nowrap",
                        textTransform: "uppercase",
                        letterSpacing: 0.4,
                        boxShadow: "0 0 12px rgba(38,205,88,0.5)",
                      }}
                    >
                      {s.badge}
                    </span>
                  )}
                </div>
                <p
                  style={{
                    fontFamily: "'MTS Compact', sans-serif",
                    fontWeight: 400,
                    fontSize: 14,
                    color: "#626c77",
                    lineHeight: "20px",
                  }}
                >
                  {s.desc}
                </p>
              </>
            );

            const cardStyle: React.CSSProperties = {
              display: "block",
              textDecoration: "none",
              background: "rgba(98,108,119,0.25)",
              borderRadius: 20,
              padding: "16px 20px",
              opacity: s.href ? 1 : 0.5,
              cursor: s.href ? "pointer" : "default",
            };

            return s.href ? (
              <Link key={s.title} href={s.href} style={cardStyle}>
                {inner}
              </Link>
            ) : (
              <div key={s.title} style={cardStyle}>
                {inner}
              </div>
            );
          })}
        </div>

        <Link
          href="/stats"
          style={{
            display: "block",
            textAlign: "center",
            marginTop: 20,
            textDecoration: "none",
            fontFamily: "'MTS Compact', sans-serif",
            fontWeight: 500,
            fontSize: 14,
            color: "#8f8fff",
          }}
        >
          Аналитика прототипа →
        </Link>
      </div>
    </div>
  );
}
