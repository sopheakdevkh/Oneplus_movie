import prisma from "./db";

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
}

export const EXACT_MOVIES: MovieData[] = [
  // Top Rated (4 Cards displayed in 4-column Grid)
  {
    id: "top-1-john-wick",
    title: "John wick 4",
    slug: "john-wick-4",
    description: "John Wick uncovers a path to defeating The High Table across Paris, Osaka, Berlin, and New York.",
    releaseYear: 2023,
    duration: 169,
    rating: 9.2,
    certification: "CBFC: A",
    posterUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    isTopRated: true,
    rank: 1,
    genres: [{ id: "g-action", name: "Action", slug: "action" }],
    type: "Movie",
  },
  {
    id: "top-2-aquaman",
    title: "Aquaman 2",
    slug: "aquaman-2",
    description: "Black Manta seeks revenge on Aquaman for his father's death with the mythic Black Trident.",
    releaseYear: 2023,
    duration: 124,
    rating: 9.2,
    certification: "CBFC: A",
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    isTopRated: true,
    rank: 2,
    genres: [{ id: "g-action", name: "Action", slug: "action" }],
    type: "Movie",
  },
  {
    id: "top-3-transformers",
    title: "Transformers: Rise of the Beasts",
    slug: "transformers-rise-of-the-beasts",
    description: "The Maximals, Predacons, and Terrorcons join the existing battle on Earth between Autobots and Decepticons.",
    releaseYear: 2023,
    duration: 127,
    rating: 9.2,
    certification: "CBFC: A",
    posterUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    isTopRated: true,
    rank: 3,
    genres: [{ id: "g-action", name: "Action", slug: "action" }],
    type: "Movie",
  },
  {
    id: "top-4-peter-pan",
    title: "Peter Pan & Wendy",
    slug: "peter-pan-and-wendy",
    description: "Wendy Darling meets Peter Pan, a boy who refuses to grow up, and embarks on a thrilling adventure to Neverland.",
    releaseYear: 2023,
    duration: 106,
    rating: 9.2,
    certification: "PG-13",
    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    isTopRated: true,
    rank: 4,
    genres: [{ id: "g-drama", name: "Drama", slug: "drama" }],
    type: "Movie",
  },

  // Best of Action (8 Cards Scrollable Grid - 4 per row)
  {
    id: "act-1-man-from-toronto",
    title: "The Man from Toronto",
    slug: "the-man-from-toronto",
    description: "The world's deadliest assassin and New York's biggest screw-up are mistaken for each other.",
    releaseYear: 2022,
    duration: 110,
    rating: 4.6,
    certification: "PG-13",
    posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4",
    isTopRated: false,
    genres: [{ id: "g-action", name: "Action", slug: "action" }],
    type: "Movie",
  },
  {
    id: "act-2-extraction",
    title: "Extraction",
    slug: "extraction",
    description: "A black-market mercenary who has nothing to lose is hired to rescue the kidnapped son of an imprisoned international crime lord.",
    releaseYear: 2020,
    duration: 116,
    rating: 4.6,
    certification: "CBFC: A",
    posterUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    isTopRated: false,
    genres: [{ id: "g-action", name: "Action", slug: "action" }],
    type: "Movie",
  },
  {
    id: "act-3-godzilla",
    title: "Godzilla: King of the Monsters",
    slug: "godzilla-king-of-the-monsters",
    description: "Members of the crypto-zoological agency Monarch face off against ancient god-sized monsters.",
    releaseYear: 2019,
    duration: 132,
    rating: 4.6,
    certification: "PG-13",
    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    isTopRated: false,
    genres: [{ id: "g-action", name: "Action", slug: "action" }],
    type: "Movie",
  },
  {
    id: "act-4-jumanji",
    title: "Jumanji: The Next Level",
    slug: "jumanji-the-next-level",
    description: "The gang is back to rescue one of their own, but the game has changed in unpredictable ways.",
    releaseYear: 2019,
    duration: 123,
    rating: 4.6,
    certification: "PG-13",
    posterUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1000&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    isTopRated: false,
    genres: [{ id: "g-action", name: "Action", slug: "action" }],
    type: "Movie",
  },
  {
    id: "act-5-yaksha",
    title: "Yaksha: Ruthless Operations",
    slug: "yaksha-ruthless-operations",
    description: "The ruthless leader of an overseas black ops team takes on a deadly mission in Shenyang.",
    releaseYear: 2022,
    duration: 125,
    rating: 4.6,
    certification: "CBFC: A",
    posterUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1000&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    isTopRated: false,
    genres: [{ id: "g-action", name: "Action", slug: "action" }],
    type: "Movie",
  },
  {
    id: "act-6-mechanic",
    title: "Mechanic: Resurrection",
    slug: "mechanic-resurrection",
    description: "Arthur Bishop thought he had put his murderous past behind him when a formidable enemy kidnaps his love.",
    releaseYear: 2016,
    duration: 98,
    rating: 4.6,
    certification: "CBFC: A",
    posterUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1000&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    isTopRated: false,
    genres: [{ id: "g-action", name: "Action", slug: "action" }],
    type: "Movie",
  },
  {
    id: "act-7-the-pirates",
    title: "The Pirates: The Last Royal Treasure",
    slug: "the-pirates-the-last-royal-treasure",
    description: "A gutsy crew of Joseon pirates and bandits battle stormy seas in search of royal gold lost at sea.",
    releaseYear: 2022,
    duration: 126,
    rating: 4.6,
    certification: "CBFC: A",
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    isTopRated: false,
    genres: [{ id: "g-action", name: "Action", slug: "action" }],
    type: "Movie",
  },
  {
    id: "act-8-six-underground",
    title: "6 Underground",
    slug: "6-underground",
    description: "Six individuals from around the globe choose to delete their pasts to change the future.",
    releaseYear: 2019,
    duration: 128,
    rating: 4.6,
    certification: "CBFC: A",
    posterUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    isTopRated: false,
    genres: [{ id: "g-action", name: "Action", slug: "action" }],
    type: "Movie",
  },
  // Additional 8 action movies for rich multi-page horizontal scrolling (optional extra pages)
  {
    id: "act-9-top-gun",
    title: "Top Gun: Maverick",
    slug: "top-gun-maverick",
    description: "After thirty years, Maverick is still pushing the envelope as a top naval aviator.",
    releaseYear: 2022,
    duration: 130,
    rating: 4.9,
    certification: "PG-13",
    posterUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    isTopRated: false,
    genres: [{ id: "g-action", name: "Action", slug: "action" }],
    type: "Movie",
  },
  {
    id: "act-10-bullet-train",
    title: "Bullet Train",
    slug: "bullet-train",
    description: "Five assassins aboard a swiftly-moving bullet train find out that their missions have something in common.",
    releaseYear: 2022,
    duration: 126,
    rating: 4.7,
    certification: "CBFC: A",
    posterUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    isTopRated: false,
    genres: [{ id: "g-action", name: "Action", slug: "action" }],
    type: "Movie",
  },
  {
    id: "act-11-red-notice",
    title: "Red Notice",
    slug: "red-notice",
    description: "An Interpol agent tracks the world's most wanted art thief with the help of a rival criminal.",
    releaseYear: 2021,
    duration: 118,
    rating: 4.5,
    certification: "PG-13",
    posterUrl: "https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=1000&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    isTopRated: false,
    genres: [{ id: "g-action", name: "Action", slug: "action" }],
    type: "Movie",
  },
  {
    id: "act-12-gray-man",
    title: "The Gray Man",
    slug: "the-gray-man",
    description: "When the CIA's most skilled operative accidentally uncovers dark agency secrets, a psychopathic former colleague puts a bounty on his head.",
    releaseYear: 2022,
    duration: 122,
    rating: 4.6,
    certification: "CBFC: A",
    posterUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    isTopRated: false,
    genres: [{ id: "g-action", name: "Action", slug: "action" }],
    type: "Movie",
  },
];

export async function getTopRatedMovies(): Promise<MovieData[]> {
  try {
    if (process.env.DATABASE_URL) {
      const movies = await prisma.movie.findMany({
        where: { isTopRated: true },
        include: { genres: true },
        orderBy: { rank: "asc" },
      });
      if (movies.length > 0) {
        return movies as unknown as MovieData[];
      }
    }
  } catch (error) {
    console.warn("Prisma query fallback:", error);
  }

  return EXACT_MOVIES.filter((m) => m.isTopRated).slice(0, 4);
}

export async function getActionMovies(): Promise<MovieData[]> {
  try {
    if (process.env.DATABASE_URL) {
      const movies = await prisma.movie.findMany({
        where: {
          genres: {
            some: {
              slug: "action",
            },
          },
        },
        include: { genres: true },
        orderBy: { rating: "desc" },
      });
      if (movies.length > 0) {
        return movies as unknown as MovieData[];
      }
    }
  } catch (error) {
    console.warn("Prisma query fallback:", error);
  }

  return EXACT_MOVIES.filter((m) => !m.isTopRated);
}

export async function getAllMovies(): Promise<MovieData[]> {
  return EXACT_MOVIES;
}

export async function getFeaturedSpotlight(): Promise<MovieData> {
  return EXACT_MOVIES[0];
}
