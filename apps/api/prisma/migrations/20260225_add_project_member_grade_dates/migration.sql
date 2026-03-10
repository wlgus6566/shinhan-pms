-- AlterTable
ALTER TABLE "project_members" ADD COLUMN IF NOT EXISTS "grade" VARCHAR(20) NOT NULL DEFAULT 'BEGINNER';
ALTER TABLE "project_members" ADD COLUMN IF NOT EXISTS "join_date" DATE;
ALTER TABLE "project_members" ADD COLUMN IF NOT EXISTS "leave_date" DATE;
