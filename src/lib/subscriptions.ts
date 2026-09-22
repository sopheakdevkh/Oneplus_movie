import prisma from "@/lib/db";
import { SubscriptionStatus, SubscriptionTier } from "@/types/user";

/**
 * Updates a user's subscription tier and gateway customer ID.
 */
export async function updateUserSubscription(
  userId: string,
  data: {
    status: SubscriptionStatus;
    tier?: SubscriptionTier | string;
    endDate?: Date | null;
    customerId?: string;
  }
) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: data.status,
      subscriptionTier: data.tier ?? null,
      subscriptionEndDate: data.endDate ?? null,
      ...(data.customerId ? { customerId: data.customerId } : {}),
    },
  });
}

/**
 * Looks up a user by their payment gateway customer ID (useful for Stripe / webhook events).
 */
export async function findUserByCustomerId(customerId: string) {
  return await prisma.user.findFirst({
    where: { customerId },
  });
}

/**
 * Retrieves all active subscribers (e.g., for members-only features or cinema screenings).
 */
export async function getActiveSubscribers() {
  return await prisma.user.findMany({
    where: {
      subscriptionStatus: "active",
      OR: [
        { subscriptionEndDate: null },
        { subscriptionEndDate: { gt: new Date() } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      subscriptionTier: true,
      subscriptionEndDate: true,
      customerId: true,
    },
  });
}
