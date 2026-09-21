import React from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin Console | Oneplus Movie",
  description: "Streaming SaaS catalog administration and analytics",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col md:flex-row">
      {/* Responsive Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="p-4 sm:p-6 lg:p-10 flex-1">{children}</main>
      </div>
    </div>
  );
}
