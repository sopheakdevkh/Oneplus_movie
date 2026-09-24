"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Film,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { LensImpactSignSvg } from "@/components/OnePlusLogo";

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (() => void | Promise<void>) | null;
  title?: string;
  subtitle?: string;
  defaultTab?: "signin" | "signup";
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Unlock Member Access",
  subtitle = "Sign in or create a free account to continue your cinematic experience.",
  defaultTab = "signup",
}: AuthModalProps) {
  const router = useRouter();
  const { login, register, setUserState } = useAuth();

  const [activeTab, setActiveTab] = useState<"signin" | "signup">(defaultTab);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync tab if defaultTab changes when opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setErrorMessage(null);
      setPassword("");
    }
  }, [isOpen, defaultTab]);

  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle Form Submission via Global AuthContext
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic client validations
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (activeTab === "signup" && !fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (activeTab === "signin") {
        const result = await login({ email: email.trim(), password });
        if (!result.success) {
          setIsSubmitting(false);
          setErrorMessage(result.error || "Invalid email or password.");
          return;
        }
      } else {
        const result = await register({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
        });
        if (!result.success) {
          setIsSubmitting(false);
          setErrorMessage(result.error || "Registration failed. Email may already be in use.");
          return;
        }
      }

      // Requirement 3: Automatically complete pending action & unlock state
      if (onSuccess) {
        try {
          await onSuccess();
        } catch (err) {
          console.warn("Pending action error after auth:", err);
        }
      }

      // Refresh server-side state
      router.refresh();

      // Close modal automatically
      setIsSubmitting(false);
      onClose();
    } catch {
      setIsSubmitting(false);
      setErrorMessage("An unexpected network error occurred. Please try again.");
    }
  };

  return (
    // Requirement 4: Backdrop container with click dismissal
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      aria-modal="true"
      role="dialog"
    >
      {/* Modal Card: e.stopPropagation() prevents backdrop click when clicking inside */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl bg-[#121319] border border-white/10 p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85)] space-y-5 animate-in zoom-in-95 duration-200 text-white overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#EB0029]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Requirement 4: Easy Close Button (X) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2 pt-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl drop-shadow-[0_0_15px_rgba(235,0,41,0.4)] mb-1">
            <LensImpactSignSvg />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
            {title}
          </h2>
          <p className="text-xs text-[#8E8E93] max-w-xs mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Requirement 1: Tabs to switch smoothly between "Sign In" and "Create Account" */}
        <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab("signin");
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeTab === "signin"
                ? "bg-[#EB0029] text-white shadow-[0_0_15px_rgba(235,0,41,0.35)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("signup");
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeTab === "signup"
                ? "bg-[#EB0029] text-white shadow-[0_0_15px_rgba(235,0,41,0.35)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span>Create Account</span>
          </button>
        </div>

        {/* Error Badge */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-[#EB0029]/15 border border-[#EB0029]/40 text-[#ff4d6a] text-xs flex items-start space-x-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-[#EB0029] shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Requirement 2: Form fields submitting directly via Global AuthContext */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {activeTab === "signup" && (
            <div className="space-y-1 animate-in fade-in duration-150">
              <label className="text-white/80 font-bold block">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-white/40 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#EB0029] transition-colors"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-white/80 font-bold block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cinephile@lensimpact.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#EB0029] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-white/80 font-bold block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#EB0029] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-white/40 hover:text-white transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 rounded-xl bg-[#EB0029] hover:bg-[#ff1740] active:scale-[0.99] text-white font-bold text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(235,0,41,0.4)] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Processing authentication...</span>
            ) : (
              <>
                <span>{activeTab === "signin" ? "Sign In to Account" : "Create Free Account"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
