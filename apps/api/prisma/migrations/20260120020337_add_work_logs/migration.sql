-- DropIndex
DROP INDEX "idx_work_logs_date";

-- AlterTable
ALTER TABLE "work_logs" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "idx_work_logs_is_active" ON "work_logs"("is_active");
