import React, { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign In | LensImpact Film Club",
  description: "Sign in to access your watchlists, community discussions, and curated cinema streaming.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0f0f12] text-white flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#EB0029] border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
