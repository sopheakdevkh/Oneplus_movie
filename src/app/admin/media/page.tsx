import React from "react";
import { Cloud, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Cloudinary Assets | Oneplus Movie Admin",
};

export default function AdminMediaPage() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dqcopr9tn";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          Cloudinary Asset Infrastructure
        </h1>
        <p className="text-xs text-[#8E8E93] mt-1">
          Dynamic transformations, WebP/AVIF auto compression, and edge CDN status.
        </p>
      </div>

      {/* Cloudinary Status Banner */}
      <div className="p-6 rounded-2xl bg-[#121318] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Active Cloud Account</h2>
              <p className="text-xs text-[#8E8E93]">
                Cloud Name: <span className="font-mono text-white font-bold">{cloudName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Operational</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/5 text-xs">
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
            <span className="text-[#8E8E93] block mb-1">Format Optimization</span>
            <span className="font-bold text-white font-mono">f_auto</span>
            <p className="text-[11px] text-[#8E8E93] mt-1">Delivers WebP or AVIF based on user browser.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
            <span className="text-[#8E8E93] block mb-1">Quality Compression</span>
            <span className="font-bold text-white font-mono">q_auto</span>
            <p className="text-[11px] text-[#8E8E93] mt-1">Intelligently optimizes perceptual visual fidelity.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
            <span className="text-[#8E8E93] block mb-1">Smart Crop Mode</span>
            <span className="font-bold text-white font-mono">c_fill, g_auto</span>
            <p className="text-[11px] text-[#8E8E93] mt-1">AI-assisted focal-point cropping on movie cards.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
