-- Add columns to point_transactions that were defined in schema but missing from migration 0000
ALTER TABLE "point_transactions" ADD COLUMN IF NOT EXISTS "change_type" varchar(10) DEFAULT 'earn';
ALTER TABLE "point_transactions" ADD COLUMN IF NOT EXISTS "balance_after" integer;
