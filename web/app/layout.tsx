import type { Metadata, Viewport } from "next";
import "./globals.css";
import VolumeKeyHandler from "./components/VolumeKeyHandler";
import AnalyticsTracker from "./components/AnalyticsTracker";

export const metadata: Metadata = {
  title: "Накопления — МТС Банк",
  description: "Прототип экрана накоплений МТС Банк",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Накопления",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1d2023",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <VolumeKeyHandler />
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
