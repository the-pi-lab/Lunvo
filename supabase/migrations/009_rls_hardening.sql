-- 009_rls_hardening.sql
-- Fix missing RLS and policies for Phase 07
-- Audited 001-008: users has ENABLE but no policies, personas/posts/weekly_reports had no RLS at all.
-- This migration makes all core tables secure: unauthenticated SELECT = 0 rows.

-- 1. Enable RLS on missing tables (idempotent)
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;
-- users already has ENABLE from 001, but ensure it stays
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Policies for public.users (user can only manage own row)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname=''public'' AND tablename=''users'' AND policyname=''Users can view own profile'') THEN
    CREATE POLICY "Users can view own profile"
      ON public.users FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname=''public'' AND tablename=''users'' AND policyname=''Users can update own profile'') THEN
    CREATE POLICY "Users can update own profile"
      ON public.users FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname=''public'' AND tablename=''users'' AND policyname=''Users can insert own profile'') THEN
    CREATE POLICY "Users can insert own profile"
      ON public.users FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 3. Policies for public.personas (user_id = auth.uid())
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname=''public'' AND tablename=''personas'' AND policyname=''Users can view own persona'') THEN
    CREATE POLICY "Users can view own persona"
      ON public.personas FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname=''public'' AND tablename=''personas'' AND policyname=''Users can insert own persona'') THEN
    CREATE POLICY "Users can insert own persona"
      ON public.personas FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname=''public'' AND tablename=''personas'' AND policyname=''Users can update own persona'') THEN
    CREATE POLICY "Users can update own persona"
      ON public.personas FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname=''public'' AND tablename=''personas'' AND policyname=''Users can delete own persona'') THEN
    CREATE POLICY "Users can delete own persona"
      ON public.personas FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- 4. Policies for public.posts (user_id = auth.uid())
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname=''public'' AND tablename=''posts'' AND policyname=''Users can view own posts'') THEN
    CREATE POLICY "Users can view own posts"
      ON public.posts FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname=''public'' AND tablename=''posts'' AND policyname=''Users can insert own posts'') THEN
    CREATE POLICY "Users can insert own posts"
      ON public.posts FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname=''public'' AND tablename=''posts'' AND policyname=''Users can update own posts'') THEN
    CREATE POLICY "Users can update own posts"
      ON public.posts FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname=''public'' AND tablename=''posts'' AND policyname=''Users can delete own posts'') THEN
    CREATE POLICY "Users can delete own posts"
      ON public.posts FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- 5. Policies for public.weekly_reports (user_id = auth.uid())
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname=''public'' AND tablename=''weekly_reports'' AND policyname=''Users can view own reports'') THEN
    CREATE POLICY "Users can view own reports"
      ON public.weekly_reports FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname=''public'' AND tablename=''weekly_reports'' AND policyname=''Users can insert own reports'') THEN
    CREATE POLICY "Users can insert own reports"
      ON public.weekly_reports FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 6. Ensure anon role cannot bypass (RLS already blocks anon, but be explicit)
-- No policies for anon = 0 rows, which is desired. Test: unauthenticated SELECT should return 0.

-- 7. Verify handle_new_user remains SECURITY DEFINER (already from 001/004, keep it)
-- No change needed, but ensure search_path is safe
