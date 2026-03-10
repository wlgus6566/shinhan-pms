-- CreateTable
CREATE TABLE "project_members" (
    "id" BIGSERIAL NOT NULL,
    "project_id" BIGINT NOT NULL,
    "member_id" BIGINT NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'PA',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" BIGINT NOT NULL,
    "updated_at" TIMESTAMP(6),
    "updated_by" BIGINT,

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_project_members_project_id" ON "project_members"("project_id");

-- CreateIndex
CREATE INDEX "idx_project_members_member_id" ON "project_members"("member_id");

-- CreateIndex
CREATE INDEX "idx_project_members_role" ON "project_members"("role");

-- CreateIndex
CREATE UNIQUE INDEX "unique_project_member" ON "project_members"("project_id", "member_id");

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
