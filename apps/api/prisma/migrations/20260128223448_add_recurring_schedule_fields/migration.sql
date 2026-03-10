-- AlterTable
ALTER TABLE "schedules" ADD COLUMN "is_recurring" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "schedules" ADD COLUMN "recurrence_type" VARCHAR(10);
ALTER TABLE "schedules" ADD COLUMN "recurrence_end_date" TIMESTAMP(6);

-- CreateIndex
CREATE INDEX "idx_schedules_is_recurring" ON "schedules"("is_recurring");
CREATE INDEX "idx_schedules_recurrence_type" ON "schedules"("recurrence_type");
CREATE INDEX "idx_schedules_recurring_end" ON "schedules"("is_recurring", "recurrence_end_date");
