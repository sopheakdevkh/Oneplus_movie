"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserState } from "@/types/user";
import AuthModal from "@/components/auth/AuthModal";

export interface UserSession {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  subscription_status: string;
  subscription_tier?: string | null;
  subscription_end_date?: string | Date | null;
  // Alias compatibility
  subscriptionStatus?: string;
  subscriptionTier?: string | null;
  subscriptionEndDate?: string | Date | null;
  created_at?: string | Date | null;
  createdAt?: string | Date | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  redirectTo?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
  redirectTo?: string;
}

export type PendingActionCallback = (() => void | Promise<void>) | null;

export interface OpenAuthModalOptions {
  onSuccess?: () => void | Promise<void>;
  title?: string;
  subtitle?: string;
  defaultTab?: "signin" | "signup";
}

export interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userState: UserState;
  isMember: boolean;
  isAdmin: boolean;
  isAuthModalOpen: boolean;
  // Actions
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  openAuthModal: (
    actionOrOptions?: (() => void | Promise<void>) | OpenAuthModalOptions,
    maybeOptions?: OpenAuthModalOptions
  ) => void;
  closeAuthModal: () => void;
  setUserState: (state: UserState) => void;
  setUser: (user: UserSession | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Normalizes user object to guarantee both snake_case and camelCase properties
function normalizeUser(rawUser: any): UserSession {
  const status = rawUser.subscription_status || rawUser.subscriptionStatus || "free";
  const tier = rawUser.subscription_tier || rawUser.subscriptionTier || null;
  const endDate = rawUser.subscription_end_date || rawUser.subscriptionEndDate || null;
  const createdAt = rawUser.created_at || rawUser.createdAt || null;

  return {
    id: rawUser.id,
    email: rawUser.email,
    name: rawUser.name || null,
    role: (rawUser.role || "user").toLowerCase(),
    subscription_status: status,
    subscription_tier: tier,
    subscription_end_date: endDate,
    subscriptionStatus: status,
    subscriptionTier: tier,
    subscriptionEndDate: endDate,
    created_at: createdAt,
    createdAt: createdAt,
  };
}

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: UserSession | null;
}) {
  const router = useRouter();

  const [user, setUser] = useState<UserSession | null>(
    initialUser ? normalizeUser(initialUser) : null
  );
  const [isLoading, setIsLoading] = useState<boolean>(!initialUser);
  const [simulatedState, setSimulatedState] = useState<UserState | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // 1. checkAuth: Runs on initial load via GET /api/auth/me
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          const formatted = normalizeUser(data.user);
          setUser(formatted);
          setIsLoading(false);
          return;
        }
      }

      // Clear any previous demo state so real user authentication takes precedence
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("lensimpact_demo_user_state");
      }
      setSimulatedState(null);
      setUser(null);
    } catch (err) {
      console.warn("Session check error, defaulting to unauthenticated guest:", err);
      setUser(null);
      setSimulatedState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Run session check on initial mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Determine user state tier (admin, paid_member, free_user, or guest)
  const computeState = (): UserState => {
    if (user && user.role?.toLowerCase() === "admin") return "admin";
    if (simulatedState && simulatedState !== "admin") return simulatedState;
    if (!user || !user.id) return "guest";

    const isSubActive =
      user.subscription_status === "active" &&
      (!user.subscription_end_date ||
        new Date(user.subscription_end_date).getTime() > Date.now());

    if (isSubActive) return "paid_member";
    return "free_user";
  };

  const userState = computeState();
  const isAuthenticated = Boolean(user && user.id) || (userState !== "guest");
  const isMember = userState === "paid_member" || userState === "admin";
  const isAdmin = Boolean(user && user.role?.toLowerCase() === "admin");

  // 2. login: Calls /api/auth/login, sets state, and redirects
  const login = async (
    credentials: LoginCredentials
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsLoading(false);
        return { success: false, error: data.message || data.error || "Login failed." };
      }

      const formatted = normalizeUser(data.user);
      setUser(formatted);
      setSimulatedState(null);
      sessionStorage.removeItem("lensimpact_demo_user_state");

      setIsLoading(false);

      // Redirect to intended URL or default to dashboard / overview
      const targetUrl =
        credentials.redirectTo ||
        (typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("redirect") || "/dashboard"
          : "/dashboard");

      router.push(targetUrl);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: "Network error during login. Please try again." };
    }
  };

  // 3. register: Calls /api/auth/register, auto-logs in, and redirects
  const register = async (
    userData: RegisterData
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          full_name: userData.full_name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsLoading(false);
        return { success: false, error: data.message || data.error || "Registration failed." };
      }

      const formatted = normalizeUser(data.user);
      setUser(formatted);
      setSimulatedState(null);
      sessionStorage.removeItem("lensimpact_demo_user_state");

      setIsLoading(false);

      const targetUrl =
        userData.redirectTo ||
        (typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("redirect") || "/dashboard"
          : "/dashboard");

      router.push(targetUrl);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: "Network error during registration. Please try again." };
    }
  };

  // 4. logout: Calls /api/auth/logout, clears state, redirects to homepage
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.warn("Logout request failed:", err);
    } finally {
      setUser(null);
      setSimulatedState(null);
      sessionStorage.removeItem("lensimpact_demo_user_state");
      setIsLoading(false);
      router.push("/");
    }
  };

  // Simulation & Modal Controls with action resuming
  const [pendingAction, setPendingAction] = useState<PendingActionCallback>(null);
  const [modalOptions, setModalOptions] = useState<{
    title?: string;
    subtitle?: string;
    defaultTab?: "signin" | "signup";
  }>({});

  const openAuthModal = (
    actionOrOptions?: (() => void | Promise<void>) | OpenAuthModalOptions,
    maybeOptions?: OpenAuthModalOptions
  ) => {
    if (typeof actionOrOptions === "function") {
      setPendingAction(() => actionOrOptions);
      setModalOptions(maybeOptions || {});
    } else if (actionOrOptions && typeof actionOrOptions === "object") {
      setPendingAction(() => actionOrOptions.onSuccess || null);
      setModalOptions(actionOrOptions);
    } else {
      setPendingAction(null);
      setModalOptions({});
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingAction(null);
    setModalOptions({});
  };

  const setUserState = (newState: UserState) => {
    setSimulatedState(newState);
    sessionStorage.setItem("lensimpact_demo_user_state", newState);

    if (newState === "guest") {
      setUser(null);
    } else if (newState === "free_user") {
      setUser({
        id: "usr_free_demo",
        name: "Sarah Jenkins",
        email: "sarah@lensimpact.com",
        role: "user",
        subscription_status: "free",
        subscriptionStatus: "free",
      });
    } else if (newState === "paid_member") {
      setUser({
        id: "usr_member_demo",
        name: "Sarah Jenkins",
        email: "sarah@lensimpact.com",
        role: "user",
        subscription_status: "active",
        subscription_tier: "monthly",
        subscriptionStatus: "active",
        subscriptionTier: "monthly",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        userState,
        isMember,
        isAdmin,
        isAuthModalOpen,
        login,
        register,
        logout,
        checkAuth,
        openAuthModal,
        closeAuthModal,
        setUserState,
        setUser,
      }}
    >
      {children}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onSuccess={pendingAction}
        title={modalOptions.title}
        subtitle={modalOptions.subtitle}
        defaultTab={modalOptions.defaultTab}
      />
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
