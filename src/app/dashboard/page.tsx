import React, { Suspense } from "react";
import DashboardClient from "./DashboardClient";

export const metadata = {
  title: "Member Dashboard & Account Settings | LensImpact Film Club",
  description:
    "Manage your LensImpact membership, explore your watch queue, update profile settings, and access VIP psychological film studies.",
};

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07080B] text-white flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardClient />
    </Suspense>
  );
}
