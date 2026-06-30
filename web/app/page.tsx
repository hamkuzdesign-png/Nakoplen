"use client";
import Link from "next/link";

const STATUSES = [
  {
    title: "Аноним",
    desc: "Пользователь без авторизации",
    href: null,
  },
  {
    title: "УПРИД",
    desc: "Упрощённая идентификация",
    href: null,
  },
  {
    title: "Идентифицированный",
    desc: "Полная идентификация",
    href: null,
  },
  {
    title: "Имеет продукты",
    desc: "Главная → Мои накопления → Каталог → Карточка продукта",
    href: "/home",
  },
];

export default function MenuPage() {
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
          Сценарии
        </p>
        <p
          style={{
            fontFamily: "'MTS Compact', sans-serif",
            fontWeight: 400,
            fontSize: 14,
            color: "#969fa8",
            marginBottom: 24,
          }}
        >
          Выберите статус пользователя
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {STATUSES.map((s) => {
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
      </div>
    </div>
  );
}
