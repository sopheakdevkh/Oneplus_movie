import { NextRequest, NextResponse } from "next/server";
import { requireActiveSubscription } from "@/lib/subscription-guard";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  // 1. Backend Protection: Verify active subscription status (returns 403 if not active)
  const authCheck = await requireActiveSubscription(request, {
    redirectOnForbidden: false,
  });

  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const { id } = await params;

  // 2. Fetch movie data
  const movie = await prisma.movie.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
  });

  if (!movie) {
    return NextResponse.json({ error: "Movie not found" }, { status: 404 });
  }

  // 3. Return privileged psychological breakdown & study notes
  return NextResponse.json({
    movie: {
      id: movie.id,
      title: movie.title,
    },
    unlockedBy: authCheck.user.email,
    impactGuide: {
      psychologicalThemes: [
        "Existential Resilience & The Burden of Choice",
        "Trauma Metamorphosis and Reclaimed Agency",
        "The Illusion of Inevitability: Breaking Cyclical Harm",
      ],
      deepAnalysis: `In ${movie.title}, the narrative constructs a visceral examination of internal conflict. Beneath the stylistic cinematography lies a profound psychological inquiry into human limits, institutional morality, and emotional catharsis.`,
      lessonTakeaways: [
        "Takeaway 1: Self-governance over external dogma.",
        "Takeaway 2: Authentic connection as the antidote to fatalism.",
        "Takeaway 3: Navigating ambiguity without moral compromise.",
      ],
      studyNotesPdfUrl: `/downloads/impact-guides/${movie.slug}-study-guide.pdf`,
      communityCircle: {
        activeMembers: 142,
        discussionPrompt: "How does the protagonist's climactic choice challenge conventional ideas of sacrifice?",
        latestCritique: "The color palette directly mirrors Jungian individuation stages in the third act.",
      },
    },
  });
}
