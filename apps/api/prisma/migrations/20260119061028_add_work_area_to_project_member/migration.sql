-- AlterTable
ALTER TABLE "project_members" ADD COLUMN     "work_area" VARCHAR(20) NOT NULL DEFAULT 'BACKEND';

-- CreateIndex
CREATE INDEX "idx_project_members_work_area" ON "project_members"("work_area");
