import React from "react";
import type { Metadata } from "next";
import PricingClient from "@/components/pricing/PricingClient";

export const metadata: Metadata = {
  title: "Pricing & Membership Plans | LensImpact Film Club",
  description:
    "Join the LensImpact Film Club. Choose between our Free Tier and Premium Member Tier ($4.99/mo or $49/yr) for in-depth psychological breakdowns, printable lesson notes, and an exclusive cinema community.",
  keywords: [
    "film club membership",
    "cinema pricing",
    "psychological film analysis",
    "movie study notes",
    "LensImpact Film Club plans",
    "curated streaming",
  ],
};

export default function PricingPage() {
  return <PricingClient />;
}
