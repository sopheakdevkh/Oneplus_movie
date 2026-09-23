import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json().catch(() => ({}));
    const { sessionId } = body;

    if (!sessionId || typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
      return NextResponse.json(
        { error: "Invalid or missing Stripe session ID" },
        { status: 400 }
      );
    }

    // Retrieve the verified checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json(
        { error: "Stripe checkout session has not completed payment." },
        { status: 400 }
      );
    }

    const userId = session.metadata?.user_id || user?.id;
    const userEmail =
      session.customer_email ||
      session.customer_details?.email ||
      user?.email;
    const plan = session.metadata?.plan || "monthly";
    const customerId = session.customer as string;

    let subscriptionEndDate: Date | null = null;

    if (session.subscription) {
      try {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        const periodEndSeconds = (
          subscription as unknown as { current_period_end: number }
        ).current_period_end;
        if (periodEndSeconds) {
          subscriptionEndDate = new Date(periodEndSeconds * 1000);
        }
      } catch (subErr) {
        console.warn("Could not retrieve subscription details from Stripe:", subErr);
      }
    }

    if (!subscriptionEndDate) {
      const now = new Date();
      if (plan === "yearly") {
        now.setFullYear(now.getFullYear() + 1);
      } else {
        now.setDate(now.getDate() + 30);
      }
      subscriptionEndDate = now;
    }

    // Update user in PostgreSQL database
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: "active",
          subscriptionTier: plan,
          subscriptionEndDate,
          customerId: customerId || undefined,
        },
      });
      console.log(`[Stripe Verification] Upgraded user ID ${userId} to active VIP (${plan})`);
    } else if (userEmail) {
      await prisma.user.updateMany({
        where: { email: userEmail },
        data: {
          subscriptionStatus: "active",
          subscriptionTier: plan,
          subscriptionEndDate,
          customerId: customerId || undefined,
        },
      });
      console.log(`[Stripe Verification] Upgraded user email ${userEmail} to active VIP (${plan})`);
    }

    return NextResponse.json({
      success: true,
      message: "Membership upgraded to VIP successfully!",
      status: "active",
      tier: plan,
      subscriptionEndDate,
    });
  } catch (error: any) {
    console.error("Stripe session verification error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to verify session" },
      { status: 500 }
    );
  }
}
