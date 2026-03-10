-- AlterTable
ALTER TABLE "projects" 
ADD COLUMN "client" VARCHAR(100),
ADD COLUMN "project_type" VARCHAR(20) NOT NULL DEFAULT 'BUILD';

-- CreateIndex
CREATE INDEX "idx_projects_client" ON "projects"("client");

-- CreateIndex
CREATE INDEX "idx_projects_type" ON "projects"("project_type");
