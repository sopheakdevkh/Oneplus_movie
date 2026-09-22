import React, { Suspense } from "react";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Create Free Account | LensImpact Film Club",
  description: "Join LensImpact Film Club to bookmark films, join discussions, and unlock curated cinema.",
};

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0f0f12] text-white flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#EB0029] border-t-transparent animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
