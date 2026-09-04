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
      script.src = `https://mc.yandex.ru/metrika/tag.js?id=${id}`;
      document.head.appendChild(script);
      window.ym(id, "init", {
        ssr: true,
        webvisor: true,
        clickmap: true,
        ecommerce: "dataLayer",
        referrer: document.referrer,
        url: window.location.href,
        accurateTrackBounce: true,
        trackLinks: true,
      });
    }

    if (pathname === "/showcase-test" && prototype) resetShowcaseJourney(prototype);
    window.ym(id, "hit", `${pathname}${window.location.search}`, { params: { prototype: prototype ?? "none" } });
  }, [pathname, prototype]);

  const id = getMetrikaCounterId();
  return id ? (
    <noscript>
      <div><img src={`https://mc.yandex.ru/watch/${id}`} style={{ position: "absolute", left: "-9999px" }} alt="" /></div>
    </noscript>
  ) : null;
}
