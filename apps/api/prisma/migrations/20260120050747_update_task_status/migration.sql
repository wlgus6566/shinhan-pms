-- Migrate existing status values
UPDATE tasks
SET status = CASE
  WHEN status = 'TODO' THEN 'WAITING'
  WHEN status = 'IN_PROGRESS' THEN 'IN_PROGRESS'
  WHEN status = 'DONE' THEN 'COMPLETED'
  WHEN status = 'HOLD' THEN 'WAITING'
  ELSE 'WAITING'
END
WHERE is_active = true;

-- AlterTable
ALTER TABLE "tasks" ALTER COLUMN "status" SET DEFAULT 'WAITING';
