# OnePlus Movie — Modern 4K Streaming Web Platform

A cinematic dark-mode video streaming SaaS web application built with **Next.js 16**, **React 19**, **Tailwind CSS v4**, **Neon PostgreSQL**, **Prisma ORM**, and **Cloudinary**.

---

## ✨ Features

- **Cinematic Dark Design**: Pitch-black theme (`#000000`/`#0A0A0C`) with luminous amber (`#FF9F0A`) and icy-cyan accents.
- **Top Rated Section**: Clean 4-card grid showcasing premier titles with certification badges and star ratings.
- **Best of Action Carousel**: 2-row horizontal scrollable movie reel with circular pagination controls.
- **Modern "Cold Eye Watch" Movie Theater**:
  - Edge-to-edge mobile bottom-sheet & desktop cinematic theater.
  - Custom glass video player HUD (Play/Pause, timeline scrubber, ±10s skip, volume slider, fullscreen).
  - Ambient backglow ("Ambilight") dynamic lighting.
  - Interactive tabs: *Overview*, *Cast & Crew*, *More Like This*, and *Audio & Specs*.
- **Admin Management Console**:
  - Full CRUD operations for movies catalog with search & genre filtering.
  - Genre category management with movie counters.
  - Cloudinary CDN status and media asset previews.
- **Fully Responsive**:
  - Desktop vertical left sidebar navigation.
  - Mobile bottom navigation bar and touch-scrollable category tabs.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI & Styling**: React 19, [Tailwind CSS v4](https://tailwindcss.com/), Lucide Icons
- **Database**: [Neon PostgreSQL](https://neon.tech/) Serverless
- **ORM**: [Prisma ORM](https://www.prisma.io/) with `@prisma/adapter-pg`
- **Media CDN**: [Cloudinary](https://cloudinary.com/) for media delivery and optimization

---

## 🛠️ Getting Started

### 1. Clone the repository
```bash
git clone git@github.com:sopheakdevkh/Oneplus_movie.git
cd Oneplus_movie
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env` and fill in your Neon PostgreSQL and Cloudinary credentials:
```bash
cp .env.example .env
```

### 4. Database Setup
Push schema and generate Prisma client:
```bash
npx prisma db push
npx prisma generate
```

### 5. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the streaming application or [http://localhost:3000/admin](http://localhost:3000/admin) for the Admin Console.
