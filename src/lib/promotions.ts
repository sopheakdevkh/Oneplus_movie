export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  badge: string; // e.g. "SPECIAL PROMOTION", "VIP PASS", "LIMITED OFFER", "NEWS & EVENTS", "SPONSOR"
  imageUrl: string;
  linkUrl: string;
  ctaText: string;
  themeColor: string; // Hex color for glowing accents
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_PROMOTIONS: PromoBanner[] = [
  {
    id: "promo-vip-pass",
    title: "LensImpact VIP 4K Pass — 50% Off Annual Membership",
    subtitle: "Unlock unlimited ultra-HD streaming, Dolby Atmos sound, and exclusive director cut commentary.",
    badge: "LIMITED TIME OFFER",
    imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1920&q=80",
    linkUrl: "/dashboard?tab=subscription",
    ctaText: "Claim 50% Off",
    themeColor: "#FF5500",
    isActive: true,
    order: 1,
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-26T12:00:00.000Z",
  },
  {
    id: "promo-indie-festival",
    title: "International Indie Film Gala 2026: Live Stream Premiere",
    subtitle: "Stream 30+ jury-selected short films and filmmaker Q&A panels live starting this Friday evening.",
    badge: "FESTIVAL PREMIERE",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1920&q=80",
    linkUrl: "/admin/content",
    ctaText: "View Schedule",
    themeColor: "#00F0FF",
    isActive: true,
    order: 2,
    createdAt: "2026-09-10T00:00:00.000Z",
    updatedAt: "2026-09-26T12:00:00.000Z",
  },
  {
    id: "promo-gear-sponsor",
    title: "OnePlus 12 & Hasselblad Cinema Camera Edition",
    subtitle: "Shot entirely on mobile: experience cinematic 4K Dolby Vision capture with master color profiles.",
    badge: "FEATURED PARTNER",
    imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1920&q=80",
    linkUrl: "https://www.oneplus.com",
    ctaText: "Discover Gear",
    themeColor: "#EB0028",
    isActive: true,
    order: 3,
    createdAt: "2026-09-15T00:00:00.000Z",
    updatedAt: "2026-09-26T12:00:00.000Z",
  },
];
