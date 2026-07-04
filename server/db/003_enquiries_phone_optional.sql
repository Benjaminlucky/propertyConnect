-- PropConnect NG — Migration 003
-- WhatsApp enquiries don't capture a buyer phone number,
-- so phone must be nullable.
-- Run in: Supabase → SQL Editor → New query → Run

ALTER TABLE enquiries ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE enquiries ALTER COLUMN phone SET DEFAULT '';
