"use client";

import { useRouter } from "next/navigation";
import { asset } from "@/lib/asset";

type Screen = {
  title: string;
  subtitle: string;
  cards: readonly (readonly [string, string, string, string])[];
};

export default function CatalogV2ProductClient({ screen }: { screen: Screen }) {
  const router = useRouter();

  return (
    <main className="catalog-v2-shell">
      <section className="catalog-v2-screen" aria-label={screen.title}>
        <div className="catalog-v2-hero">
          <div className="catalog-v2-status"><span>09:41</span><span className="catalog-v2-status-icons">⌁ ◧ ▮</span></div>
          <button className="catalog-v2-back" aria-label="Назад" onClick={() => router.back()}><img src={asset("/images/savings2/back.svg")} alt="" /></button>
          <div className="catalog-v2-heading"><h1>{screen.title}</h1><p>{screen.subtitle}</p></div>
        </div>
        <div className="catalog-v2-products">
          {screen.cards.map(([title, rate, description, image]) => (
            <button className="catalog-v2-card" key={title} onClick={() => router.push("/catalog")}>
              <div className="catalog-v2-card-copy"><span className="catalog-v2-rate">{rate}</span><strong>{title}</strong><span className="catalog-v2-description">{description}</span></div>
              <img src={asset(image)} alt="" />
            </button>
          ))}
        </div>
        <div className="catalog-v2-home-indicator" />
      </section>
    </main>
  );
}
