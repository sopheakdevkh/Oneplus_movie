import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getAuthenticatedUser } from "@/lib/auth";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    // 1. Retrieve the currently authenticated user's ID and email
    const user = await getAuthenticatedUser(request);

    if (!user || !user.id || !user.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to subscribe to LensImpact Film Club." },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json().catch(() => ({}));
    const { priceId, plan = "monthly" } = body;

    // Validate that either a priceId or a valid plan was provided
    if (!priceId && plan !== "monthly" && plan !== "yearly") {
      return NextResponse.json(
        { error: "Invalid request. Please provide a valid 'priceId' or subscription 'plan'." },
        { status: 400 }
      );
    }

    // 3. Resolve the application origin URL for redirects
    const origin =
      request.headers.get("origin") ||
      request.headers.get("referer") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const cleanOrigin = origin.replace(/\/$/, "");

    // 4. Configure recurring line items:
    // If a Stripe price ID (from request body or STRIPE_PRICE_ID_MONTHLY / STRIPE_PRICE_ID_YEARLY in .env) is provided, use it directly;
    // Otherwise, create an inline recurring price item ($4.99/mo or $49/yr).
    const isYearly = plan === "yearly" || priceId === "yearly";
    const envPriceId = isYearly
      ? process.env.STRIPE_PRICE_ID_YEARLY
      : process.env.STRIPE_PRICE_ID_MONTHLY;

    const isRealPriceId = (id?: string | null) =>
      Boolean(id && id.startsWith("price_") && !id.includes("..."));

    const resolvedPriceId = isRealPriceId(priceId)
      ? priceId
      : isRealPriceId(envPriceId)
      ? envPriceId
      : null;

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];

    if (resolvedPriceId) {
      lineItems = [
        {
          price: resolvedPriceId,
          quantity: 1,
        },
      ];
    } else {
      const unitAmount = isYearly ? 4900 : 499; // $49.00 or $4.99 in cents
      const interval = isYearly ? "year" : "month";

      lineItems = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `LensImpact Film Club Premium (${isYearly ? "Annual" : "Monthly"})`,
              description:
                "Unlimited access to in-depth psychological breakdowns, printable lesson notes, and private club discussions.",
            },
            unit_amount: unitAmount,
            recurring: {
              interval,
            },
          },
          quantity: 1,
        },
      ];
    }

    // 5. Create the Stripe Checkout Session
    // Check if user already has a customer ID or use their email
    const customerParams: Partial<Stripe.Checkout.SessionCreateParams> = user.customerId
      ? { customer: user.customerId }
      : { customer_email: user.email };

    let session: Stripe.Checkout.Session;

    try {
      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        ...customerParams,
        line_items: lineItems,
        // Set success_url to /dashboard?payment=success and cancel_url to /pricing
        success_url: `${cleanOrigin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${cleanOrigin}/pricing`,
        // Pass user_id inside checkout session metadata
        metadata: {
          user_id: user.id,
          user_email: user.email,
          plan: plan || (priceId?.includes("year") ? "yearly" : "monthly"),
        },
        subscription_data: {
          metadata: {
            user_id: user.id,
            user_email: user.email,
          },
        },
        allow_promotion_codes: true,
        billing_address_collection: "auto",
      });
    } catch (stripeError: unknown) {
      console.error("Stripe Checkout Session creation error:", stripeError);

      // In production, strictly reject and never issue mock checkout passes
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Payment processor is unavailable. Please verify payment configuration." },
          { status: 502 }
        );
      }

      // Local development fallback only when working without live Stripe keys
      const mockSessionId = `cs_test_${Math.random().toString(36).substring(2, 14)}`;
      const mockRedirectUrl = `${cleanOrigin}/dashboard?payment=success&session_id=${mockSessionId}&mock=true`;

      return NextResponse.json({
        url: mockRedirectUrl,
        sessionId: mockSessionId,
        metadata: {
          user_id: user.id,
          user_email: user.email,
        },
        isMock: true,
        note: "[DEV ONLY] Stripe key unprovisioned. Returned local simulated checkout.",
      });
    }

    // 6. Return the redirect URL and session ID back to the frontend
    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      metadata: {
        user_id: user.id,
      },
    });
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Could not create checkout session." },
      { status: 500 }
    );
  }
}
