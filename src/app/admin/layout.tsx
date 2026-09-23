import React from "react";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";

export const metadata = {
  title: "Admin Console | LensImpact Film Club",
  description: "Streaming SaaS catalog administration and analytics",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthGuard>{children}</AdminAuthGuard>;
}
