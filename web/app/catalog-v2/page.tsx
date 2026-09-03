"use client";

import { useRouter } from "next/navigation";
import { asset } from "@/lib/asset";

const PRODUCTS = [
  { title: "Вклады", rate: "До 14,5%", description: <>Получайте стабильный доход<br />без рисков</>, image: "/images/PLUS.png", href: "/catalog-v2/deposits" },
  { title: "Накопительный счёт", rate: "До 14%", description: <>Свободно распоряжайтесь деньгами<br />и получайте доход</>, image: "/images/ED.png", href: "/catalog-v2/accounts" },
  { title: "Инвестиции", rate: "До 22%", description: <>Зарабатывайте на инструментах<br />с высокой доходностью</>, image: "/images/CFA.png", href: "/catalog-v2/investments" },
  { title: "МТС Накопления", rate: "До 15%", description: <>Проценты считаем ежедневно,<br />выплачиваем в конце месяца</>, image: "/images/BONUS.png", href: "/catalog-v2/mts-savings" },
];

export default function CatalogV2Page() {
  const router = useRouter();

  return (
    <main className="catalog-v2-shell">
      <section className="catalog-v2-screen" aria-label="Каталог накоплений">
        <div className="catalog-v2-hero">
          <div className="catalog-v2-status">
            <span>09:41</span>
            <span className="catalog-v2-status-icons">⌁ ◧ ▮</span>
          </div>
          <button className="catalog-v2-back" aria-label="Назад" onClick={() => router.back()}>
            <img src={asset("/images/savings2/back.svg")} alt="" />
          </button>
          <div className="catalog-v2-heading">
            <h1>Накопления</h1>
            <p>Здесь деньги работают на вас</p>
          </div>
        </div>

        <div className="catalog-v2-products">
          {PRODUCTS.map((product) => (
            <button className="catalog-v2-card" key={product.title} onClick={() => router.push(product.href)}>
              <div className="catalog-v2-card-copy">
                <span className="catalog-v2-rate">{product.rate}</span>
                <strong>{product.title}</strong>
                <span className="catalog-v2-description">{product.description}</span>
              </div>
              <img src={asset(product.image)} alt="" />
            </button>
          ))}
        </div>

        <div className="catalog-v2-home-indicator" />
      </section>
    </main>
  );
}
