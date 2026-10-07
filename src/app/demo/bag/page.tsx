import type { Metadata } from "next";

import { StoreBag } from "@/demos/store";

export const metadata: Metadata = { title: "Bag · Demo store" };

export default function DemoBagPage() {
  return <StoreBag />;
}
