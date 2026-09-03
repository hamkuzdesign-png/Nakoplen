import { Suspense } from "react";
import TestHomeClient from "./TestHomeClient";

export default function TestHomePage() {
  return (
    <Suspense>
      <TestHomeClient />
    </Suspense>
  );
}
