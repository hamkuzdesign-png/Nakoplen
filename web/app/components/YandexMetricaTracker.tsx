"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { getMetrikaCounterId, getShowcasePrototype, resetShowcaseJourney, type YandexMetricaFunction } from "@/lib/metrika";

/** Enables click maps/Webvisor and sends virtual pageviews for SPA navigation. */
export default function YandexMetricaTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prototype = getShowcasePrototype(searchParams.get("prototype"));

  useEffect(() => {
    const id = getMetrikaCounterId();
    if (!id) return;

    if (!window.ym) {
      let queue: YandexMetricaFunction;
      queue = ((...args: unknown[]) => { queue.a = queue.a ?? []; queue.a.push(args); }) as YandexMetricaFunction;
      queue.l = Date.now();
      window.ym = queue;
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://mc.yandex.ru/metrika/tag.js";
      document.head.appendChild(script);
      window.ym(id, "init", { defer: true, clickmap: true, webvisor: true, trackLinks: true, accurateTrackBounce: true });
    }

    if (pathname === "/showcase-test" && prototype) resetShowcaseJourney(prototype);
    window.ym(id, "hit", `${pathname}${window.location.search}`, { params: { prototype: prototype ?? "none" } });
  }, [pathname, prototype]);

  return null;
}
