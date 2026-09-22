import { NextRequest, NextResponse } from "next/server";
import { requireActiveSubscription } from "@/lib/auth-middleware";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Premium Content Route: GET /api/movies/:id/premium-guide
 *
 * Protected by requireActiveSubscription.
 * - Allows Admins OR Active Paid Members.
 * - Blocks Free Users with HTTP 403: { error: "SUBSCRIPTION_REQUIRED", redirect: "/pricing" }.
 * - Blocks Guests with HTTP 401: Unauthorized.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  // 1. Authorization Guard: Verify active subscription or admin status
  const guard = await requireActiveSubscription(request);

  if (!guard.authorized) {
    return guard.response;
  }

  const { id } = await params;

  // 2. Fetch film record
  const movie = await prisma.movie.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      premiumBreakdown: true,
      premiumResources: true,
      genres: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  if (!movie) {
    return NextResponse.json({ error: "Movie not found" }, { status: 404 });
  }

  // Fallback demo breakdown if database row has not yet been populated
  const defaultBreakdown =
    movie.premiumBreakdown ||
    `Comprehensive psychological breakdown for ${movie.title}: Investigating existential agency, subliminal archetypal patterns, and moral dilemmas in the modern cinematic canon.`;

  const defaultResources = movie.premiumResources || {
    pdfSyllabusUrl: `/downloads/syllabi/${movie.slug}-study-guide.pdf`,
    discussionPrompts: [
      "How does the director use lighting to mirror the moral fracture of the protagonist?",
      "In what ways does the film invert classic genre tropes to comment on existential responsibility?",
    ],
    actionTakeaways: [
      "Voluntary acceptance of consequences is the foundation of genuine redemption.",
      "Structural corruption thrives on unspoken complicity.",
    ],
  };

  // 3. Return privileged content payload
  return NextResponse.json({
    movie: {
      id: movie.id,
      title: movie.title,
      slug: movie.slug,
      genres: movie.genres,
    },
    authorizedUser: {
      email: guard.user.email,
      role: guard.user.role,
      subscriptionStatus: guard.user.subscriptionStatus,
    },
    premiumGuide: {
      breakdown: defaultBreakdown,
      resources: defaultResources,
    },
  });
}
