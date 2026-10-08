import type { Metadata } from "next";
import { Suspense } from "react";

import { StoreBag } from "@/demos/store";

export const metadata: Metadata = { title: "Bag · Demo store" };

export default function DemoBagPage() {
  // StoreBag reads ?step= with useSearchParams, which a static page renders in Suspense.
  return (
    <Suspense>
      <StoreBag />
    </Suspense>
  );
}
