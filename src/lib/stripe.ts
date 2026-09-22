import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_key";

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-02-24.acacia" as Stripe.LatestApiVersion,
  appInfo: {
    name: "LensImpact Film Club",
    version: "1.0.0",
  },
});

export default stripe;
