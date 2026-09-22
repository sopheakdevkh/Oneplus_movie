-- Migration: Add subscription tracking columns to users table
-- Target: PostgreSQL / Prisma
-- Description: Adds subscription_status, subscription_plan, subscription_end_date, and customer_id

-- 1. Add columns to users table
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "subscription_status" VARCHAR(20) DEFAULT 'free' NOT NULL,
  ADD COLUMN IF NOT EXISTS "subscription_plan" VARCHAR(50) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS "subscription_end_date" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS "customer_id" VARCHAR(255) DEFAULT NULL;

-- 2. Add validation constraint for subscription_status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_subscription_status_check'
  ) THEN
    ALTER TABLE "users"
      ADD CONSTRAINT "users_subscription_status_check"
      CHECK ("subscription_status" IN ('free', 'active', 'past_due', 'cancelled'));
  END IF;
END $$;

-- 3. Indexes for fast webhook lookups and subscriber queries
CREATE INDEX IF NOT EXISTS "users_customer_id_idx" ON "users"("customer_id");
CREATE INDEX IF NOT EXISTS "users_subscription_status_idx" ON "users"("subscription_status");

-- ==============================================================================
-- ROLLBACK SCRIPT (Down Migration)
-- Execute the following statements to revert this migration if needed:
--
-- ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_subscription_status_check";
-- DROP INDEX IF EXISTS "users_customer_id_idx";
-- DROP INDEX IF EXISTS "users_subscription_status_idx";
-- ALTER TABLE "users"
--   DROP COLUMN IF EXISTS "subscription_status",
--   DROP COLUMN IF EXISTS "subscription_plan",
--   DROP COLUMN IF EXISTS "subscription_end_date",
--   DROP COLUMN IF EXISTS "customer_id";
-- ==============================================================================
