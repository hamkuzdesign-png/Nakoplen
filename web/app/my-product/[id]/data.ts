export type OwnedProduct = {
  name: string;
  subtitle: string;
  amount: number;
  rate: number;
  icon: "discount" | "money";
  lifetime: string | null;
  history: { label: string; amount: number }[];
};

/* Balances/rates/lifetime totals mirror the rows on /my-savings and the
   "Счета"/"Вклады" chip totals on /analytics — history bars sum to the
   same figure as the `lifetime` badge where one is shown. */
export const OWNED: Record<string, OwnedProduct> = {
  os1: {
    name: "МТС Счёт",
    subtitle: "15,5% на ежедневный остаток",
    amount: 467100,
    rate: 15.5,
    icon: "discount",
    lifetime: "+10 032 ₽",
    history: [
      { label: "фев", amount: 320 },
      { label: "май", amount: 1688 },
      { label: "июл", amount: 1500 },
      { label: "авг", amount: 1200 },
      { label: "окт", amount: 1792 },
      { label: "ноя", amount: 3532 },
    ],
  },
  os2: {
    name: "МТС Счёт",
    subtitle: "12,5% на минимальный остаток",
    amount: 30000.32,
    rate: 12.5,
    icon: "discount",
    lifetime: "+641 ₽",
    history: [
      { label: "июн", amount: 641 },
    ],
  },
  dep1: {
    name: "Вклад МТС Плюс",
    subtitle: "Пополните до 25 августа 2026",
    amount: 0,
    rate: 14.7,
    icon: "money",
    lifetime: null,
    history: [],
  },
  dep2: {
    name: "Вклад МТС Максимум",
    subtitle: "18,3%, потратьте до 15.02 ещё 38 000 ₽",
    amount: 154900,
    rate: 18.3,
    icon: "money",
    lifetime: "+2 046 ₽",
    history: [
      { label: "мар", amount: 950 },
      { label: "авг", amount: 350 },
      { label: "сен", amount: 746 },
    ],
  },
};
