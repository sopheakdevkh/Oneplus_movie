-- ==============================================================================
-- Migration: User States Architecture & Film Content Gating Fields
-- Target: PostgreSQL / Prisma
-- Description:
--   1. Updates `users` table to support 4 user states (Guest, Free, Paid Member, Admin)
--      with role, subscription_status, subscription_tier, subscription_end_date, customer_id.
--   2. Updates `movies` table with separated public and premium content fields:
--      public_synopsis, youtube_video_id, premium_breakdown, premium_resources.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. USER STATES SCHEMA UPDATE (users table)
-- ------------------------------------------------------------------------------

-- Ensure role column exists with default 'user'
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "role" VARCHAR(20) DEFAULT 'user' NOT NULL;

-- Ensure subscription fields exist
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "subscription_status" VARCHAR(20) DEFAULT 'free' NOT NULL,
  ADD COLUMN IF NOT EXISTS "subscription_tier" VARCHAR(50) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS "subscription_end_date" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS "customer_id" VARCHAR(255) DEFAULT NULL;

-- Migrate data from legacy subscription_plan to subscription_tier if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'subscription_plan'
  ) THEN
    UPDATE "users"
    SET "subscription_tier" = "subscription_plan"
    WHERE "subscription_tier" IS NULL AND "subscription_plan" IS NOT NULL;
  END IF;
END $$;

-- Add check constraint for role ('user', 'admin')
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
  ) THEN
    ALTER TABLE "users"
      ADD CONSTRAINT "users_role_check"
      CHECK ("role" IN ('user', 'admin'));
  END IF;
END $$;

-- Add check constraint for subscription_status ('free', 'active', 'past_due', 'cancelled')
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

-- Performance indexes for webhook lookups, role filtering, and subscription queries
CREATE INDEX IF NOT EXISTS "users_customer_id_idx" ON "users"("customer_id");
CREATE INDEX IF NOT EXISTS "users_subscription_status_idx" ON "users"("subscription_status");
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users"("role");


-- ------------------------------------------------------------------------------
-- 2. FILM CONTENT GATING FIELDS (movies table)
-- ------------------------------------------------------------------------------

ALTER TABLE "movies"
  ADD COLUMN IF NOT EXISTS "public_synopsis" TEXT,
  ADD COLUMN IF NOT EXISTS "youtube_video_id" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "premium_breakdown" TEXT,
  ADD COLUMN IF NOT EXISTS "premium_resources" JSONB;

-- Backfill public_synopsis from existing description if null
UPDATE "movies"
SET "public_synopsis" = "description"
WHERE "public_synopsis" IS NULL AND "description" IS NOT NULL;

-- Backfill youtube_video_id from existing videoUrl if applicable (e.g. extracts 11-char ID)
UPDATE "movies"
SET "youtube_video_id" = SUBSTRING("videoUrl" FROM 'v=([a-zA-Z0-9_-]{11})')
WHERE "youtube_video_id" IS NULL AND "videoUrl" LIKE '%v=%';

-- Performance index for YouTube ID lookups and fast public queries
CREATE INDEX IF NOT EXISTS "movies_youtube_video_id_idx" ON "movies"("youtube_video_id");


-- ==============================================================================
-- ROLLBACK SCRIPT (Down Migration)
-- ==============================================================================
-- ALTER TABLE "movies"
--   DROP COLUMN IF EXISTS "public_synopsis",
--   DROP COLUMN IF EXISTS "youtube_video_id",
--   DROP COLUMN IF EXISTS "premium_breakdown",
--   DROP COLUMN IF EXISTS "premium_resources";
--
-- ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_role_check";
-- ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_subscription_status_check";
-- DROP INDEX IF EXISTS "users_role_idx";
-- DROP INDEX IF EXISTS "users_subscription_status_idx";
-- DROP INDEX IF EXISTS "users_customer_id_idx";
-- ALTER TABLE "users"
--   DROP COLUMN IF EXISTS "subscription_tier",
--   DROP COLUMN IF EXISTS "subscription_end_date",
--   DROP COLUMN IF EXISTS "customer_id";
-- ==============================================================================
