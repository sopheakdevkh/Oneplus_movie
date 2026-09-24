import { UserState } from "@/types/user";

export type NavMenuTarget = "Browse" | "TV Shows" | "Movies" | "New & Popular";

export type MovieRoleAccess = "public" | "free" | "vip" | "admin";

export interface MovieMenuRule {
  menus: NavMenuTarget[];
  roleAccess: MovieRoleAccess;
}

export interface MenuRolesConfig {
  movies: Record<string, MovieMenuRule>;
}

export const NAV_MENU_TARGETS: { id: NavMenuTarget; label: string; icon: string; description: string }[] = [
  {
    id: "Browse",
    label: "Browse",
    icon: "Compass",
    description: "Main home explore shelf, banner spotlights, and default catalog shelves.",
  },
  {
    id: "TV Shows",
    label: "TV Shows",
    icon: "Tv",
    description: "Episodic series, dramas, limited serials, and sagas.",
  },
  {
    id: "Movies",
    label: "Movies",
    icon: "Film",
    description: "Full-length feature films, cinema releases, and indie productions.",
  },
  {
    id: "New & Popular",
    label: "New & Popular",
    icon: "Flame",
    description: "Trending spotlight releases, top-rated hits, and featured member picks.",
  },
];

export const ROLE_ACCESS_LEVELS: {
  id: MovieRoleAccess;
  label: string;
  badgeLabel: string;
  color: string;
  description: string;
}[] = [
  {
    id: "public",
    label: "Public (All Visitors)",
    badgeLabel: "Public",
    color: "emerald",
    description: "Open to everyone including guests without login.",
  },
  {
    id: "free",
    label: "Free Members",
    badgeLabel: "Free Member",
    color: "sky",
    description: "Requires a free registered account to watch video.",
  },
  {
    id: "vip",
    label: "VIP Subscribers",
    badgeLabel: "VIP Only",
    color: "amber",
    description: "Requires an active paid subscription ($4.99/mo).",
  },
  {
    id: "admin",
    label: "Admin Only",
    badgeLabel: "Admin Only",
    color: "rose",
    description: "Private screening / unreleased. Visible only to Admins.",
  },
];

// Seed initial default rules for default titles in LensImpact catalog
export const DEFAULT_MENU_ROLES_CONFIG: MenuRolesConfig = {
  movies: {
    // ── TV Shows (Series) ──
    "Money Heist": {
      menus: ["Browse", "TV Shows", "New & Popular"],
      roleAccess: "vip",
    },
    "Wednesday": {
      menus: ["Browse", "TV Shows", "New & Popular"],
      roleAccess: "free",
    },
    "Never Have I Ever": {
      menus: ["Browse", "TV Shows"],
      roleAccess: "public",
    },
    "LUCIFER": {
      menus: ["Browse", "TV Shows", "New & Popular"],
      roleAccess: "vip",
    },
    "Lucifer": {
      menus: ["Browse", "TV Shows", "New & Popular"],
      roleAccess: "vip",
    },

    // ── Feature Movies ──
    "Spider-Man:\nAcross the Spider-Verse": {
      menus: ["Browse", "Movies", "New & Popular"],
      roleAccess: "public",
    },
    "Spider-Man: Across the Spider-Verse": {
      menus: ["Browse", "Movies", "New & Popular"],
      roleAccess: "public",
    },
    "Harry Potter (2011)": {
      menus: ["Browse", "Movies"],
      roleAccess: "public",
    },
    "Harry Potter": {
      menus: ["Browse", "Movies"],
      roleAccess: "public",
    },
    "Interstellar": {
      menus: ["Browse", "Movies", "New & Popular"],
      roleAccess: "vip",
    },
    "Inception": {
      menus: ["Browse", "Movies", "New & Popular"],
      roleAccess: "public",
    },
    "Tenet": {
      menus: ["Browse", "Movies"],
      roleAccess: "free",
    },
  },
};

/**
 * Checks whether a given role access level is accessible by the current user state.
 */
export function isMovieAccessibleForRole(
  requiredRole: MovieRoleAccess | undefined,
  userState: UserState
): boolean {
  if (userState === "admin") {
    return true;
  }

  const role = requiredRole || "public";

  if (role === "public") {
    return true;
  }

  if (role === "free") {
    return userState === "free_user" || userState === "paid_member";
  }

  if (role === "vip") {
    return userState === "paid_member";
  }

  if (role === "admin") {
    return false; // non-admins cannot access admin-only
  }

  return true;
}

/**
 * Normalizes title for consistent lookup
 */
export function normalizeMovieKey(titleOrId: string): string {
  return titleOrId.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Resolves the rule for a movie with intelligent catalog fallbacks
 */
export function resolveMovieRule(
  config: MenuRolesConfig,
  movie: {
    id?: string;
    title: string;
    type?: string;
    isTopRated?: boolean;
    menus?: NavMenuTarget[];
    roleAccess?: MovieRoleAccess;
  }
): MovieMenuRule {
  // 1. Direct properties on movie object (if set)
  if (movie.menus && movie.menus.length > 0 && movie.roleAccess) {
    return {
      menus: movie.menus,
      roleAccess: movie.roleAccess,
    };
  }

  // 2. Check config by ID
  if (movie.id && config.movies[movie.id]) {
    return config.movies[movie.id];
  }

  // 3. Check config by Exact Title
  if (config.movies[movie.title]) {
    return config.movies[movie.title];
  }

  // 4. Check config by Normalized Title
  const normTitle = normalizeMovieKey(movie.title);
  for (const [key, rule] of Object.entries(config.movies)) {
    if (normalizeMovieKey(key) === normTitle) {
      return rule;
    }
  }

  // 5. Intelligent catalog defaults based on type & rating
  const isSeries =
    movie.type === "Series" ||
    /money heist|wednesday|lucifer|never have i ever/i.test(movie.title);

  const menus: NavMenuTarget[] = ["Browse", isSeries ? "TV Shows" : "Movies"];
  if (movie.isTopRated) {
    menus.push("New & Popular");
  }

  return {
    menus,
    roleAccess: "public",
  };
}
