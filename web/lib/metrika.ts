export const SHOWCASE_PROTOTYPES = ["cashbox", "deposit", "metals", "mts"] as const;
export type ShowcasePrototype = (typeof SHOWCASE_PROTOTYPES)[number];

export type YandexMetricaFunction = ((counterId: number, method: string, ...args: unknown[]) => void) & {
  a?: unknown[][];
  l?: number;
};

const TARGET_PRODUCT: Record<ShowcasePrototype, string> = {
  cashbox: "a2",
  deposit: "d1",
  metals: "m3",
  mts: "m1",
};

declare global {
  interface Window {
    ym?: YandexMetricaFunction;
  }
}

export function getMetrikaCounterId(): number | null {
  const id = Number(process.env.NEXT_PUBLIC_YM_COUNTER_ID);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function getShowcasePrototype(value: string | null): ShowcasePrototype | null {
  return SHOWCASE_PROTOTYPES.includes(value as ShowcasePrototype) ? value as ShowcasePrototype : null;
}

function reachGoal(goal: string, prototype: ShowcasePrototype, params: Record<string, string> = {}) {
  const id = getMetrikaCounterId();
  if (!id || !window.ym) return;
  window.ym(id, "reachGoal", goal, { prototype, ...params });
}

/** Один раз за сессию: считаем респондентов, использовавших фильтры, а не количество кликов. */
export function reportFilterUsed(prototype: ShowcasePrototype, params: Record<string, string>) {
  const key = `ym_filter_used_${prototype}`;
  if (window.sessionStorage.getItem(key)) return;
  window.sessionStorage.setItem(key, "1");
  reachGoal(`filter_used_${prototype}`, prototype, params);
}

export function recordShowcaseProductVisit(prototype: ShowcasePrototype, productId: string) {
  const key = `ym_products_seen_${prototype}`;
  const seen = new Set(JSON.parse(window.sessionStorage.getItem(key) ?? "[]") as string[]);
  seen.add(productId);
  window.sessionStorage.setItem(key, JSON.stringify([...seen]));
}

/** Отмечает выполнение только если пользователь не открывал карточки других продуктов. */
export function reportShortestPath(prototype: ShowcasePrototype) {
  const target = TARGET_PRODUCT[prototype];
  const seen = new Set(JSON.parse(window.sessionStorage.getItem(`ym_products_seen_${prototype}`) ?? "[]") as string[]);
  if (seen.size === 1 && seen.has(target)) reachGoal(`short_path_${prototype}`, prototype);
}

export function resetShowcaseJourney(prototype: ShowcasePrototype) {
  window.sessionStorage.removeItem(`ym_filter_used_${prototype}`);
  window.sessionStorage.removeItem(`ym_products_seen_${prototype}`);
}
