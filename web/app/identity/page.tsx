"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { asset } from "@/lib/asset";

/* Step 1 — Госуслуги login (light) */
function GosuslugiScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <div style={{ minHeight: "100svh", background: "#f5f5f5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "48px 20px 32px" }}>
      {/* Logo */}
      <div style={{ marginBottom: 32 }}>
        <span style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 700, fontSize: 32 }}>
          <span style={{ color: "#e21d1d" }}>гос</span><span style={{ color: "#0d4cd3" }}>услуги</span>
        </span>
      </div>

      {/* Fields */}
      <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="text"
          placeholder="Телефон / Email / Снилс"
          style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: "1px solid #d0d5dd", fontSize: 16, fontFamily: "'MTS Compact', sans-serif", background: "#fff", boxSizing: "border-box", outline: "none" }}
        />
        <input
          type="password"
          placeholder="Пароль"
          style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: "1px solid #d0d5dd", fontSize: 16, fontFamily: "'MTS Compact', sans-serif", background: "#fff", boxSizing: "border-box", outline: "none" }}
        />
        <div style={{ textAlign: "right" }}>
          <span style={{ color: "#0d4cd3", fontFamily: "'MTS Compact', sans-serif", fontSize: 14, cursor: "pointer" }}>Восстановить</span>
        </div>

        <button
          onClick={onLogin}
          style={{ background: "#0d4cd3", color: "#fff", border: "none", borderRadius: 8, padding: "14px", fontSize: 16, fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, cursor: "pointer", marginTop: 4 }}
        >
          Войти
        </button>

        <div style={{ textAlign: "center" }}>
          <span style={{ color: "#0d4cd3", fontFamily: "'MTS Compact', sans-serif", fontSize: 14, cursor: "pointer" }}>Не удаётся войти?</span>
        </div>

        <div style={{ height: 1, background: "#d0d5dd", margin: "8px 0" }} />

        <div style={{ textAlign: "center" }}>
          <span style={{ color: "#0d4cd3", fontFamily: "'MTS Compact', sans-serif", fontSize: 14, cursor: "pointer" }}>Зарегистрироваться</span>
        </div>

        <div style={{ background: "#fff", borderRadius: 8, padding: "12px 16px", display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e8eaf0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 14, color: "#666" }}>?</span>
          </div>
          <span style={{ fontFamily: "'MTS Compact', sans-serif", fontSize: 13, color: "#333", lineHeight: "18px" }}>Куда ещё можно войти с этой учётной записью?</span>
        </div>
      </div>
    </div>
  );
}

/* Step 2 — Loading */
function LoadingScreen() {
  return (
    <div style={{ minHeight: "100svh", background: "#000", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "52px 20px 12px" }}>
        <div style={{ width: 32 }} />
        <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 17, color: "#fafafa" }}>Оформление карты</p>
        <div style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#969fa8", fontSize: 20, cursor: "pointer" }}>✕</span>
        </div>
      </div>

      {/* Spinner + label */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,0.15)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 400, fontSize: 17, color: "#fafafa" }}>Загрузка</p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* Step 3 — Success */
function SuccessScreen({ onDone }: { onDone: () => void }) {
  return (
    <div style={{ minHeight: "100svh", background: "#1d2023", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "52px 20px 12px" }}>
        <div style={{ width: 32 }} />
        <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 17, color: "#fafafa" }}>Оформление карты</p>
        <div style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={onDone}>
          <span style={{ color: "#969fa8", fontSize: 20 }}>✕</span>
        </div>
      </div>

      {/* Card image */}
      <div style={{ display: "flex", justifyContent: "center", padding: "24px 0 8px", position: "relative" }}>
        <div style={{ position: "relative", width: 200, height: 130 }}>
          <img src={asset("/images/hero-card.png")} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 16 }} />
          {/* Green checkmark badge */}
          <div style={{ position: "absolute", bottom: -8, left: -8, width: 40, height: 40, borderRadius: "50%", background: "#26cd58", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #1d2023" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>

      {/* Title + subtitle */}
      <div style={{ padding: "24px 20px 8px", textAlign: "center" }}>
        <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 22, color: "#fafafa", marginBottom: 8 }}>Картой уже можно пользоваться</p>
        <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 400, fontSize: 14, color: "#969fa8", lineHeight: "20px" }}>Проверим паспортные данные и пришлём СМС по готовности</p>
      </div>

      {/* Feature rows */}
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Row 1 */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(98,108,119,0.25)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={asset("/images/chip-coins.png")} alt="" style={{ width: 24, height: 24 }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 15, color: "#fafafa", marginBottom: 2 }}>Повышенный кэшбэк</p>
            <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 400, fontSize: 13, color: "#969fa8" }}>В категориях на выбор</p>
          </div>
          <div style={{ background: "rgba(38,205,88,0.15)", borderRadius: 8, padding: "4px 8px", flexShrink: 0 }}>
            <span style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 12, color: "#26cd58" }}>Уже у вас</span>
          </div>
        </div>

        {/* Row 2 */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(98,108,119,0.25)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={asset("/images/chip-refill.png")} alt="" style={{ width: 24, height: 24 }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 15, color: "#fafafa", marginBottom: 2 }}>Переводы по СБП</p>
            <p style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 400, fontSize: 13, color: "#969fa8" }}>После проверки данных</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "4px 8px", flexShrink: 0 }}>
            <span style={{ fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, fontSize: 12, color: "#969fa8" }}>Ждите СМС</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* CTA */}
      <div style={{ padding: "0 20px 40px" }}>
        <button
          onClick={onDone}
          style={{ width: "100%", background: "#8566ff", color: "#fff", border: "none", borderRadius: 16, padding: "16px", fontSize: 15, fontFamily: "'MTS Compact', sans-serif", fontWeight: 500, cursor: "pointer", letterSpacing: "0.5px" }}
        >
          НА ГЛАВНУЮ
        </button>
      </div>
    </div>
  );
}

export default function IdentityPage() {
  return (
    <Suspense>
      <IdentityPageInner />
    </Suspense>
  );
}

function IdentityPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"gosuslugi" | "loading" | "success">("gosuslugi");

  function handleLogin() {
    setStep("loading");
  }

  useEffect(() => {
    if (step === "loading") {
      const t = setTimeout(() => setStep("success"), 1800);
      return () => clearTimeout(t);
    }
  }, [step]);

  const scenario = searchParams.get("scenario");
  function handleDone() {
    if (scenario === "anon") router.push("/home-anon");
    else if (scenario === "uprid") router.push("/home-uprid");
    else router.push("/");
  }

  return (
    <div className="phone-width">
      {step === "gosuslugi" && <GosuslugiScreen onLogin={handleLogin} />}
      {step === "loading" && <LoadingScreen />}
      {step === "success" && <SuccessScreen onDone={handleDone} />}
    </div>
  );
}
