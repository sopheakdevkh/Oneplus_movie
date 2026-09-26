import React from "react";
import { getPromotionsAction } from "@/app/actions/promotions";
import PromotionManagerClient from "@/components/admin/PromotionManagerClient";

export const metadata = {
  title: "Promotions & Ads Slider | LensImpact Film Club Admin",
  description:
    "Manage billboard promotions, advertisement news, image uploads, and event banners.",
};

export default async function AdminPromotionsPage() {
  const promotions = await getPromotionsAction();

  return <PromotionManagerClient initialPromotions={promotions} />;
}
