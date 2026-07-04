-- PropConnect NG — Migration 006
-- Add buyer email to enquiries so agents can reply by email.
-- Run in: Supabase → SQL Editor → New query → Run

ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS email text;
