export interface CastMember {
  name: string;
  role: string;
  avatar: string;
}

export interface CastDataConfig {
  movies: Record<string, CastMember[]>;
  defaultCast: CastMember[];
}

export const INITIAL_CAST_CONFIG: CastDataConfig = {
  movies: {
    "John wick 4": [
      {
        name: "Keanu Reeves",
        role: "John Wick",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      },
      {
        name: "Donnie Yen",
        role: "Caine",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      },
      {
        name: "Bill Skarsgård",
        role: "Marquis",
        avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80",
      },
      {
        name: "Laurence Fishburne",
        role: "Bowery King",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
      },
    ],
    "Aquaman 2": [
      {
        name: "Jason Momoa",
        role: "Arthur Curry / Aquaman",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
      },
      {
        name: "Patrick Wilson",
        role: "Orm Marius",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
      },
      {
        name: "Yahya Abdul-Mateen II",
        role: "Black Manta",
        avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80",
      },
    ],
    "Transformers: Rise of the Beasts": [
      {
        name: "Anthony Ramos",
        role: "Noah Diaz",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      },
      {
        name: "Dominique Fishback",
        role: "Elena Wallace",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
      },
      {
        name: "Peter Cullen",
        role: "Optimus Prime (Voice)",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      },
    ],
    "Rocky Balboa": [
      {
        name: "Sylvester Stallone",
        role: "Rocky Balboa",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      },
      {
        name: "Burt Young",
        role: "Paulie",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
      },
      {
        name: "Milo Ventimiglia",
        role: "Robert Balboa Jr.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      },
      {
        name: "Antonio Tarver",
        role: "Mason 'The Line' Dixon",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
      },
    ],
  },
  defaultCast: [
    {
      name: "Alex Cross",
      role: "Lead Protagonist",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "Elena Vance",
      role: "Special Operative",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "Marcus Kane",
      role: "Tactical Commander",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "Sarah Chen",
      role: "Intelligence Officer",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    },
  ],
};

/**
 * Returns cast members for a given movie title based on dynamic config.
 * Supports case-insensitive matching and fallback to defaultCast.
 */
export function getCastForMovie(
  title: string,
  config?: CastDataConfig | null
): CastMember[] {
  const activeConfig = config || INITIAL_CAST_CONFIG;

  if (activeConfig.movies) {
    // 1. Direct title match
    if (activeConfig.movies[title] && activeConfig.movies[title].length > 0) {
      return activeConfig.movies[title];
    }

    // 2. Case-insensitive / normalized title match
    const normalized = title.trim().toLowerCase();
    for (const [key, castList] of Object.entries(activeConfig.movies)) {
      if (key.trim().toLowerCase() === normalized && castList.length > 0) {
        return castList;
      }
    }
  }

  return activeConfig.defaultCast?.length > 0
    ? activeConfig.defaultCast
    : INITIAL_CAST_CONFIG.defaultCast;
}
