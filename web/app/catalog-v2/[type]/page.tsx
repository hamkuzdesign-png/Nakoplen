import CatalogV2ProductClient from "./CatalogV2ProductClient";

const SCREENS = {
  deposits: {
    title: "Вклады", subtitle: "Выберите подходящий", cards: [
      ["МТС Деньги", "До 14,5%", "В рублях. 6 или 12 месяцев", "/images/DENG.png"],
      ["МТС Максимум", "До 14,5%", "В рублях. На 4, 6 или 12 месяцев", "/images/DENG.png"],
      ["Вклад Плюс", "До 13%", "В рублях, юанях или дирхамах. 3–12 месяцев", "/images/PLUS.png"],
    ],
  },
  accounts: {
    title: "Накопительные счета", subtitle: "Выберите подходящий", cards: [
      ["Кешбокс", "До 14,5%", "Выплачиваем проценты на карту каждый день", "/images/Keshbox.png"],
      ["На ежедневный остаток", "До 14,5%", "Считаем процент на ежедневный остаток, зачисляем в конце месяца", "/images/ED.png"],
      ["На минимальный остаток", "До 14,5%", "Считаем процент на минимальную сумму в месяц, зачисления в конце месяца", "/images/MD.png"],
    ],
  },
  investments: {
    title: "Инвестиции", subtitle: "Выберите подходящий", cards: [
      ["Брокерский счёт", "До 14,5%", "Инвестиции в вашем смартфоне", "/images/ED.png"],
      ["Цифровые активы", "До 22%", "Аналоги ценных бумаг и других активов", "/images/CFA.png"],
      ["Металлы", "До 14,5%", "Сделки с золотом, серебром, платиной и палладием 24/7", "/images/METALL.png"],
    ],
  },
  "mts-savings": {
    title: "МТС Накопления", subtitle: "Выберите подходящий", cards: [
      ["МТС Накопления", "До 15%", "Проценты начисляются ежедневно", "/images/BONUS.png"],
    ],
  },
} as const;

export function generateStaticParams() {
  return Object.keys(SCREENS).map((type) => ({ type }));
}

export default async function CatalogV2ProductPage({ params }: { params: Promise<{ type: keyof typeof SCREENS }> }) {
  const { type } = await params;
  const screen = SCREENS[type] ?? SCREENS.deposits;

  return <CatalogV2ProductClient screen={screen} />;
}
