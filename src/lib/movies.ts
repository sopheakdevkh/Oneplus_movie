export interface GenreData {
  id: string;
  name: string;
  slug: string;
}

export interface MovieData {
  id: string;
  title: string;
  slug: string;
  description: string;
  publicSynopsis?: string | null;
  youtubeVideoId?: string | null;
  premiumBreakdown?: string | null;
  premiumResources?: any | null;
  releaseYear: number;
  duration: number;
  rating: number;
  certification: string;
  posterUrl: string;
  bannerUrl?: string;
  videoUrl?: string;
  isTopRated: boolean;
  rank?: number | null;
  genres: GenreData[];
  type?: "Movie" | "Series" | "Animation";
  tagline?: string;
  badge?: string;
  subMeta?: string;
  episode?: string;
  menus?: ("Browse" | "TV Shows" | "Movies" | "New & Popular")[];
  roleAccess?: "public" | "free" | "vip" | "admin";
}

export interface ContinueWatchingItem {
  id: string;
  title: string;
  episode: string;
  progressPercent: number;
  posterUrl: string;
  movie: MovieData;
}

// 1. Featured Hero Card from screenshot: Spider-Man: Across the Spider-Verse
export const HERO_SPIDERMAN: MovieData = {
  id: "hero-spiderman",
  title: "Spider-Man:\nAcross the Spider-Verse",
  slug: "spider-man-across-the-spider-verse",
  badge: "🔥 Now Trending",
  description:
    "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
  releaseYear: 2023,
  duration: 140,
  rating: 8.8,
  certification: "U/A 13+",
  posterUrl:
    "https://images.unsplash.com/photo-1635863138275-d9b33299680b?auto=format&fit=crop&w=800&q=80",
  bannerUrl:
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80",
  videoUrl: "https://www.youtube.com/watch?v=cqGjhVJWtEg",
  isTopRated: true,
  genres: [
    { id: "g-animation", name: "Animation", slug: "animation" },
    { id: "g-adventure", name: "Adventure", slug: "adventure" },
  ],
  type: "Animation",
};

// 2. Recommended Movies from screenshot: Harry Potter, Interstellar, Inception, Tenet
export const RECOMMENDED_MOVIES: MovieData[] = [
  {
    id: "rec-harry-potter",
    title: "Harry Potter (2011)",
    slug: "harry-potter-and-the-deathly-hallows-2",
    description:
      "Harry, Ron, and Hermione search for Voldemort's remaining Horcruxes in their final stand at Hogwarts.",
    releaseYear: 2011,
    duration: 130,
    rating: 8.1,
    certification: "U/A 16+",
    subMeta: "IMDb 8.1 • 2h 10min • 2011",
    posterUrl:
      "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=600&q=80",
    bannerUrl:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    videoUrl: "https://www.youtube.com/watch?v=mObK5XD8udk",
    isTopRated: true,
    genres: [{ id: "g-fantasy", name: "Fantasy", slug: "fantasy" }],
    type: "Movie",
  },
  {
    id: "rec-interstellar",
    title: "Interstellar",
    slug: "interstellar",
    description:
      "A team of explorers travels through a wormhole in space in an attempt to ensure humanity's survival.",
    releaseYear: 2014,
    duration: 169,
    rating: 8.7,
    certification: "U/A 16+",
    subMeta: "IMDb 8.7 • 2h 49min • 2014",
    posterUrl:
      "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80",
    bannerUrl:
      "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80",
    videoUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
    isTopRated: true,
    genres: [{ id: "g-scifi", name: "Sci-Fi", slug: "sci-fi" }],
    type: "Movie",
  },
  {
    id: "rec-inception",
    title: "Inception",
    slug: "inception",
    description:
      "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task.",
    releaseYear: 2010,
    duration: 148,
    rating: 8.8,
    certification: "U/A 13+",
    subMeta: "IMDb 8.8 • 2h 28min • 2010",
    posterUrl:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
    bannerUrl:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
    videoUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0",
    isTopRated: true,
    genres: [{ id: "g-scifi", name: "Sci-Fi", slug: "sci-fi" }],
    type: "Movie",
  },
  {
    id: "rec-tenet",
    title: "Tenet",
    slug: "tenet",
    description:
      "Armed with only one word, Tenet, and fighting for the survival of the entire world, a Protagonist journeys through twilight world of international espionage.",
    releaseYear: 2020,
    duration: 150,
    rating: 7.3,
    certification: "U/A 16+",
    subMeta: "IMDb 7.3 • 2h 30min • 2020",
    posterUrl:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
    bannerUrl:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
    videoUrl: "https://www.youtube.com/watch?v=LdOM0x0XDMo",
    isTopRated: false,
    genres: [{ id: "g-scifi", name: "Sci-Fi", slug: "sci-fi" }],
    type: "Movie",
  },
];

// 3. Right Sidebar Trending Now Cards: Never Have I Ever, Lucifer
export const RIGHT_TRENDING_CARDS: MovieData[] = [
  {
    id: "rt-never-have-i-ever",
    title: "NEVER HAVE I EVER",
    slug: "never-have-i-ever",
    tagline: "NEW SERIES",
    description:
      "The complicated life of a modern-day first-generation Indian American teenage girl, inspired by Mindy Kaling's own childhood.",
    releaseYear: 2023,
    duration: 30,
    rating: 7.9,
    certification: "16+",
    posterUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    bannerUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/watch?v=HyOEcV4n_No",
    isTopRated: true,
    genres: [{ id: "g-comedy", name: "Comedy", slug: "comedy" }],
    type: "Series",
  },
  {
    id: "rt-lucifer",
    title: "LUCIFER",
    slug: "lucifer",
    tagline: "NEW SERIES",
    description:
      "Bored and unhappy as the Lord of Hell, Lucifer Morningstar abandoned his throne and retired to Los Angeles, where he ends up helping LAPD detective Chloe Decker.",
    releaseYear: 2021,
    duration: 45,
    rating: 8.1,
    certification: "18+",
    posterUrl:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
    bannerUrl:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/watch?v=X4bF_quwNtw",
    isTopRated: true,
    genres: [{ id: "g-fantasy", name: "Fantasy", slug: "fantasy" }],
    type: "Series",
  },
];

// 4. Right Sidebar Continue Watching: Money Heist, Wednesday, Never Have I Ever
export const RIGHT_CONTINUE_WATCHING: MovieData[] = [
  {
    id: "rcw-money-heist",
    title: "Money Heist",
    slug: "money-heist",
    episode: "Season 3 · E5",
    description:
      "An unusual group of robbers attempt to carry out the most perfect robbery in Spanish history - stealing 2.4 billion euros from the Royal Mint of Spain.",
    releaseYear: 2021,
    duration: 50,
    rating: 8.2,
    certification: "18+",
    posterUrl:
      "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=200&q=80",
    bannerUrl:
      "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/watch?v=p_PJbmrX4uk",
    isTopRated: true,
    genres: [{ id: "g-crime", name: "Crime", slug: "crime" }],
    type: "Series",
  },
  {
    id: "rcw-wednesday",
    title: "Wednesday",
    slug: "wednesday",
    episode: "Episode 9",
    description:
      "While attending Nevermore Academy, Wednesday Addams attempts to master her emerging psychic ability, thwart a monstrous killing spree and solve the supernatural mystery.",
    releaseYear: 2022,
    duration: 55,
    rating: 8.1,
    certification: "16+",
    posterUrl:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=200&q=80",
    bannerUrl:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/watch?v=Di310WS8zLk",
    isTopRated: true,
    genres: [{ id: "g-mystery", name: "Mystery", slug: "mystery" }],
    type: "Series",
  },
  {
    id: "rcw-never-have-i-ever",
    title: "Never Have I Ever",
    slug: "never-have-i-ever-cw",
    episode: "Season 2 · E7",
    description:
      "The complicated life of a modern-day first-generation Indian American teenage girl.",
    releaseYear: 2023,
    duration: 30,
    rating: 7.9,
    certification: "16+",
    posterUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    bannerUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/watch?v=HyOEcV4n_No",
    isTopRated: false,
    genres: [{ id: "g-comedy", name: "Comedy", slug: "comedy" }],
    type: "Series",
  },
];

export const ALL_DASHBOARD_MOVIES: MovieData[] = [
  HERO_SPIDERMAN,
  ...RECOMMENDED_MOVIES,
  ...RIGHT_TRENDING_CARDS,
  ...RIGHT_CONTINUE_WATCHING,
];

// Featured hero carousel slides
export const FEATURED_SLIDES: MovieData[] = [
  HERO_SPIDERMAN,
  RECOMMENDED_MOVIES[1], // Interstellar
  RECOMMENDED_MOVIES[2], // Inception
];

// Continue Watching items for StreamPulse
export const CONTINUE_WATCHING: ContinueWatchingItem[] = [
  {
    id: "cw-1",
    title: "Money Heist",
    episode: "Season 3 · Episode 5",
    progressPercent: 68,
    posterUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80",
    movie: RIGHT_CONTINUE_WATCHING[0],
  },
  {
    id: "cw-2",
    title: "Wednesday",
    episode: "Episode 9",
    progressPercent: 84,
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    movie: RIGHT_CONTINUE_WATCHING[1],
  },
  {
    id: "cw-3",
    title: "Never Have I Ever",
    episode: "Season 2 · Episode 7",
    progressPercent: 42,
    posterUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    movie: RIGHT_CONTINUE_WATCHING[2],
  },
  {
    id: "cw-4",
    title: "Interstellar",
    episode: "1h 45m remaining",
    progressPercent: 55,
    posterUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80",
    movie: RECOMMENDED_MOVIES[1],
  },
];

// StreamPulse Originals collection
export const STREAMPULSE_ORIGINALS: MovieData[] = [
  HERO_SPIDERMAN,
  RIGHT_TRENDING_CARDS[0], // Never Have I Ever
  RIGHT_TRENDING_CARDS[1], // Lucifer
  RIGHT_CONTINUE_WATCHING[0], // Money Heist
  RECOMMENDED_MOVIES[0], // Harry Potter
  RECOMMENDED_MOVIES[2], // Inception
];

// Legacy export compatibility
export const EXACT_MOVIES: MovieData[] = ALL_DASHBOARD_MOVIES;
export const TRENDING_MOVIES: MovieData[] = RECOMMENDED_MOVIES;
export const FEATURED_SERIES: MovieData = HERO_SPIDERMAN;

