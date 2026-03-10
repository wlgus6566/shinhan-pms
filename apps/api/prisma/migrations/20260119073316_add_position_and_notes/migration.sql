-- AlterTable
ALTER TABLE "project_members" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "position" VARCHAR(30) NOT NULL DEFAULT 'TEAM_MEMBER';

-- CreateIndex
CREATE INDEX "idx_project_work_area_role" ON "project_members"("project_id", "work_area", "role");

-- CreateIndex
CREATE INDEX "idx_users_position" ON "users"("position");
