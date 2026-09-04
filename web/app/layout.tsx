import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import VolumeKeyHandler from "./components/VolumeKeyHandler";
import CornerHoldHandler from "./components/CornerHoldHandler";
import AnalyticsTracker from "./components/AnalyticsTracker";
import YandexMetricaTracker from "./components/YandexMetricaTracker";

export const metadata: Metadata = {
  title: "Накопления — МТС Банк",
  description: "Прототип экрана накоплений МТС Банк",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Накопления",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#f2f3f7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Suspense>
          <VolumeKeyHandler />
          <CornerHoldHandler />
          <AnalyticsTracker />
          <YandexMetricaTracker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
