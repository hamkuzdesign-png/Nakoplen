/* Kept in a plain (non-"use client") module so the server-only page.tsx can
   import it for generateStaticParams without pulling in ProductClient's
   client-side code. Mirrors the keys of PRODUCTS in ProductClient.tsx
   (b1/b2 are aliases of a1/a2) plus the standalone "a4" bonus screen. */
export const PRODUCT_IDS = ["a1", "a2", "a3", "a4", "d1", "d2", "d3", "m1", "m2", "m3", "b1", "b2"];
