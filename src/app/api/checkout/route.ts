import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { plan = "monthly", userId } = body;

    // Validate plan
    if (plan !== "monthly" && plan !== "yearly") {
      return NextResponse.json(
        { error: "Invalid subscription plan selected." },
        { status: 400 }
      );
    }

    const price = plan === "yearly" ? 49.0 : 4.99;
    const interval = plan === "yearly" ? "year" : "month";

    // Simulate payment gateway checkout session creation (e.g., Stripe, LemonSqueezy)
    // In production, this would call stripe.checkout.sessions.create(...)
    const mockSessionId = `cs_test_${Math.random().toString(36).substring(2, 12)}`;
    const mockCustomerId = `cus_${Math.random().toString(36).substring(2, 10)}`;

    return NextResponse.json({
      success: true,
      sessionId: mockSessionId,
      customerId: mockCustomerId,
      plan,
      amount: price,
      currency: "usd",
      interval,
      // In sandbox/live, this would be the Stripe Hosted Checkout URL
      checkoutUrl: `/pricing/success?session_id=${mockSessionId}&plan=${plan}`,
      message: `Checkout session initialized for LensImpact Film Club Premium (${plan}).`,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to initialize checkout session. Please try again." },
      { status: 500 }
    );
  }
}
