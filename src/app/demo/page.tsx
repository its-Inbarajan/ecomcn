import type { Metadata } from "next";

import { StoreListing } from "@/demos/store";

export const metadata: Metadata = { title: "Demo store" };

export default function DemoListingPage() {
  return <StoreListing />;
}
