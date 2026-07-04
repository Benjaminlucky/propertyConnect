-- PropConnect NG — Migration 007
-- Add AI valuation estimate columns to listings.
-- Populated asynchronously after a listing is published.
-- Run in: Supabase → SQL Editor → New query → Run

ALTER TABLE listings ADD COLUMN IF NOT EXISTS valuation_low  text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS valuation_high text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS valuation_note text;
