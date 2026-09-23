import React, { Suspense } from "react";
import AdminLoginClient from "@/components/admin/AdminLoginClient";

export const metadata = {
  title: "Admin Security Gateway | LensImpact Film Club",
  description: "Administrative authentication portal for LensImpact Film Club control console",
};

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-white/50">
          <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <AdminLoginClient />
    </Suspense>
  );
}
