import MyProductClient from "./MyProductClient";
import { OWNED } from "./data";

export function generateStaticParams() {
  return Object.keys(OWNED).map((id) => ({ id }));
}

export default async function MyProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MyProductClient id={id} />;
}
