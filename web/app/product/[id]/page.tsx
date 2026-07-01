import { Suspense } from "react";
import ProductClient from "./ProductClient";
import { PRODUCT_IDS } from "./data";

export function generateStaticParams() {
  return PRODUCT_IDS.map((id) => ({ id }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <ProductClient id={id} />
    </Suspense>
  );
}
