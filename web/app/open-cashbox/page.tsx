"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Step = "card" | "topup" | "otp" | "success";

/* Общая шапка шагов «Открытие счёта» (Figma 8153-67503, Navbar 2.0.1) */
function StepNavbar({ subtitle, onBack }: { subtitle: string; onBack: () => void }) {
  return (
    <div className="pd-navbar2">
      <div className="pd-navbar2-row">
        <button className="pd-navbar2-btn" onClick={onBack} aria-label="Назад">
          <img src="/images/icon-back.svg" alt="" style={{ width: 24, height: 24 }} />
        </button>
        <div className="cb-navbar-titles">
          <p className="cb-navbar-title">Открытие счёта</p>
          <p className="cb-navbar-subtitle">{subtitle}</p>
        </div>
        <div style={{ width: 32, height: 32, flexShrink: 0 }} />
      </div>
    </div>
  );
}

/* Шаг 1 из 2 — «Выберите карту» */
function CardStep({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <div className="pd-screen">
      <div className="page-enter" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <StepNavbar subtitle="Шаг 1 из 2" onBack={onBack} />
        <div className="pd-card" style={{ flex: 1 }}>
          <div className="pd-card-title-block">
            <p className="pd-card-title">Выберите карту</p>
          </div>
          <div style={{ padding: "12px 20px 0" }}>
            <p className="cb-label">Куда зачислять проценты</p>
            <div className="cb-field">
              <div className="cb-field-icon"><img src="/images/chip-card.png" alt="" /></div>
              <div className="cb-field-text">
                <p className="cb-field-caption">МТС Деньги ·· 0015</p>
                <p className="cb-field-value">112 000,32 ₽</p>
              </div>
              <img src="/images/icon-chevron-down.svg" alt="" className="cb-field-chevron" />
            </div>
          </div>
          <div className="cb-bullets" style={{ marginTop: 20 }}>
            <div className="cb-bullet-row">
              <div className="cb-bullet-dot" />
              <p className="cb-bullet-text">Карту для зачисления процентов можно выбрать только один раз</p>
            </div>
            <div className="cb-bullet-row">
              <div className="cb-bullet-dot" />
              <p className="cb-bullet-text">Процентная ставка растёт, если совершаете покупки по этой карте</p>
            </div>
          </div>
        </div>
      </div>
      <div className="pd-bottom">
        <button className="pd-cta-btn" onClick={onNext}>продолжить</button>
      </div>
    </div>
  );
}

/* Шаг 2 из 2 — «Пополнить счёт» */
function TopupStep({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const [transfer, setTransfer] = useState(true);
  const [amount, setAmount] = useState("5 000");

  return (
    <div className="pd-screen">
      <div className="page-enter" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <StepNavbar subtitle="Шаг 2 из 2" onBack={onBack} />
        <div className="pd-card" style={{ flex: 1 }}>
          <div className="pd-card-title-block">
            <p className="pd-card-title">Пополнить счёт</p>
          </div>
          <div style={{ padding: "12px 20px 0", display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="cb-toggle-row">
              <div className="cb-toggle-text">
                <p className="cb-toggle-title">Перевести деньги</p>
                <p className="cb-toggle-sub">С карты или счёта</p>
              </div>
              <button
                className={`cb-switch ${transfer ? "on" : "off"}`}
                onClick={() => setTransfer(v => !v)}
                aria-label="Перевести деньги"
              >
                <div className="cb-switch-knob" />
              </button>
            </div>

            {transfer && (
              <>
                <div>
                  <p className="cb-label">Откуда списать</p>
                  <div className="cb-field">
                    <div className="cb-field-icon"><img src="/images/chip-card.png" alt="" /></div>
                    <div className="cb-field-text">
                      <p className="cb-field-caption">МТС Деньги ·· 0015</p>
                      <p className="cb-field-value">112 000,32 ₽</p>
                    </div>
                    <img src="/images/icon-chevron-down.svg" alt="" className="cb-field-chevron" />
                  </div>
                </div>

                <div className="cb-amount-field">
                  <div className="cb-amount-inner">
                    <p className="cb-amount-label">Сумма</p>
                    <input
                      className="cb-amount-input"
                      inputMode="numeric"
                      value={`${amount} ₽`}
                      onChange={(e) => setAmount(e.target.value.replace(/[^\d\s]/g, "").replace(/\s*₽\s*$/, ""))}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="pd-bottom">
        <button className="pd-cta-btn" onClick={onNext}>открыть счёт</button>
        <p className="cb-consent">
          Нажимая Открыть счёт, вы соглашаетесь с <span className="cb-consent-link">условиями</span>
        </p>
      </div>
    </div>
  );
}

/* Экран OTP-подтверждения */
function OtpStep({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1600);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="cb-otp-screen">
      <div className="page-enter" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div className="pd-navbar2">
          <div className="pd-navbar2-row">
            <button className="pd-navbar2-btn" onClick={onBack} aria-label="Назад">
              <img src="/images/icon-back.svg" alt="" style={{ width: 24, height: 24 }} />
            </button>
            <p className="pd-navbar2-title">Подтверждение</p>
            <div style={{ width: 32, height: 32, flexShrink: 0 }} />
          </div>
        </div>
        <div className="cb-otp-content">
          <p className="cb-otp-caption">Отправили код на номер<br />+7 999 123-45-67</p>
          <div className="cb-otp-boxes">
            {["0", "6", "0", "8"].map((d, i) => (
              <div key={i} className="cb-otp-box">{d}</div>
            ))}
          </div>
          <div className="cb-otp-spinner" />
        </div>
      </div>
    </div>
  );
}

/* Результирующий экран — «Заявка принята» */
function SuccessStep({ onDone }: { onDone: () => void }) {
  return (
    <div className="cb-success-screen">
      <div className="page-enter" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1 }} />
        <div className="cb-success-card">
          <img src="/images/icon-success-done.png" alt="" className="cb-success-icon" />
          <div className="cb-success-text">
            <p className="cb-success-title">Заявка принята</p>
            <p className="cb-success-desc">Счёт будет доступен через несколько минут в разделе «Счета»</p>
          </div>
          <button className="cb-success-btn" onClick={onDone}>понятно</button>
        </div>
      </div>
    </div>
  );
}

export default function OpenCashboxPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("card");

  return (
    <div className="phone-width">
      {step === "card" && <CardStep onBack={() => router.back()} onNext={() => setStep("topup")} />}
      {step === "topup" && <TopupStep onBack={() => setStep("card")} onNext={() => setStep("otp")} />}
      {step === "otp" && <OtpStep onBack={() => setStep("topup")} onDone={() => setStep("success")} />}
      {step === "success" && <SuccessStep onDone={() => router.push("/home-identified")} />}
    </div>
  );
}
