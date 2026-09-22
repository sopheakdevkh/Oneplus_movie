import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/db";
import type Stripe from "stripe";

// Disable body parsing if needed - App Router request.text() handles raw stream automatically
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    console.error("Stripe webhook error: Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  // 1. Verify raw webhook signature to prevent spoofing
  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      console.warn(
        "STRIPE_WEBHOOK_SECRET is not set in environment. Parsing event without signature verification (Development only)."
      );
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown verification error";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  // 2. Process relevant Stripe billing lifecycle events
  try {
    switch (event.type) {
      // ----------------------------------------------------------------------
      // 2. Checkout Session Completed: Initial subscription purchase
      // ----------------------------------------------------------------------
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Extract user_id from metadata or fallback to email
        const userId = session.metadata?.user_id;
        const customerId = session.customer as string;
        const plan = session.metadata?.plan || "monthly";

        let subscriptionEndDate: Date | null = null;

        // If this is a subscription mode checkout, fetch the subscription details
        if (session.subscription) {
          try {
            const subscription = await stripe.subscriptions.retrieve(
              session.subscription as string
            );

            // current_period_end is in seconds
            const periodEndSeconds = (subscription as unknown as { current_period_end: number }).current_period_end;
            if (periodEndSeconds) {
              subscriptionEndDate = new Date(periodEndSeconds * 1000);
            }
          } catch (subError) {
            console.error("Error retrieving subscription from Stripe:", subError);
          }
        }

        // Default 30-day or 1-year fallback if period end was not retrieved
        if (!subscriptionEndDate) {
          const now = new Date();
          if (plan === "yearly") {
            now.setFullYear(now.getFullYear() + 1);
          } else {
            now.setDate(now.getDate() + 30);
          }
          subscriptionEndDate = now;
        }

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
          console.log(`[Stripe Webhook] Activated subscription for user ID: ${userId}`);
        } else if (session.customer_email) {
          await prisma.user.updateMany({
            where: { email: session.customer_email },
            data: {
              subscriptionStatus: "active",
              subscriptionTier: plan,
              subscriptionEndDate,
              customerId: customerId || undefined,
            },
          });
          console.log(`[Stripe Webhook] Activated subscription for user email: ${session.customer_email}`);
        } else {
          console.warn("[Stripe Webhook] No user_id or email found on checkout session.");
        }
        break;
      }

      // ----------------------------------------------------------------------
      // 3. Invoice Payment Succeeded: Recurring renewal payments
      // ----------------------------------------------------------------------
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Only handle subscription renewal invoices
        const subscriptionId = (invoice as unknown as { subscription?: string | null }).subscription;

        if (subscriptionId) {
          try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const periodEndSeconds = (subscription as unknown as { current_period_end: number }).current_period_end;
            const newEndDate = periodEndSeconds ? new Date(periodEndSeconds * 1000) : null;

            // Find user by customerId or metadata
            const metadataUserId = subscription.metadata?.user_id;

            if (metadataUserId) {
              await prisma.user.update({
                where: { id: metadataUserId },
                data: {
                  subscriptionStatus: "active",
                  ...(newEndDate ? { subscriptionEndDate: newEndDate } : {}),
                },
              });
              console.log(`[Stripe Webhook] Renewed subscription for user ID: ${metadataUserId}`);
            } else if (customerId) {
              const updated = await prisma.user.updateMany({
                where: { customerId },
                data: {
                  subscriptionStatus: "active",
                  ...(newEndDate ? { subscriptionEndDate: newEndDate } : {}),
                },
              });
              console.log(`[Stripe Webhook] Renewed subscription for customer ID: ${customerId} (Count: ${updated.count})`);
            }
          } catch (invError) {
            console.error("Error updating recurring renewal invoice:", invError);
          }
        }
        break;
      }

      // ----------------------------------------------------------------------
      // 4. Customer Subscription Deleted: Cancellation or churn
      // ----------------------------------------------------------------------
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const metadataUserId = subscription.metadata?.user_id;

        const orConditions = [];
        if (metadataUserId) orConditions.push({ id: metadataUserId });
        if (customerId) orConditions.push({ customerId });

        if (orConditions.length > 0) {
          const result = await prisma.user.updateMany({
            where: {
              OR: orConditions,
            },
            data: {
              subscriptionStatus: "cancelled",
              subscriptionTier: null,
            },
          });
          console.log(`[Stripe Webhook] Cancelled subscription for customer: ${customerId} (Updated: ${result.count})`);
        }
        break;
      }

      // Optional: Invoice payment failed (past_due)
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        if (customerId) {
          await prisma.user.updateMany({
            where: { customerId },
            data: {
              subscriptionStatus: "past_due",
            },
          });
          console.log(`[Stripe Webhook] Marked subscription past_due for customer: ${customerId}`);
        }
        break;
      }

      default: {
        // 5. Unhandled events logged and acknowledged
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        break;
      }
    }

    // 5. Return a 200 HTTP response quickly after processing
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing Stripe webhook event:", error);
    // Return 500 so Stripe knows to retry the event delivery
    return NextResponse.json(
      { error: "Webhook event processing failed" },
      { status: 500 }
    );
  }
}
