-- AlterTable: TaskAssignee에 시작일/종료일 추가
ALTER TABLE "task_assignees" ADD COLUMN IF NOT EXISTS "start_date" TIMESTAMP(6);
ALTER TABLE "task_assignees" ADD COLUMN IF NOT EXISTS "end_date" TIMESTAMP(6);

-- CreateTable: 프로젝트 단가 테이블
CREATE TABLE IF NOT EXISTS "project_unit_prices" (
    "id" BIGSERIAL NOT NULL,
    "project_id" BIGINT NOT NULL,
    "grade" VARCHAR(20) NOT NULL,
    "year_month" VARCHAR(7) NOT NULL,
    "unit_price" INTEGER NOT NULL,
    "notes" VARCHAR(200),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" BIGINT,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "project_unit_prices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_project_unit_prices_project_id" ON "project_unit_prices"("project_id");
CREATE INDEX IF NOT EXISTS "idx_project_unit_prices_project_year_month" ON "project_unit_prices"("project_id", "year_month");
CREATE INDEX IF NOT EXISTS "idx_project_unit_prices_active" ON "project_unit_prices"("project_id", "year_month", "is_active");

-- AddForeignKey
ALTER TABLE "project_unit_prices" DROP CONSTRAINT IF EXISTS "project_unit_prices_project_id_fkey";
ALTER TABLE "project_unit_prices" ADD CONSTRAINT "project_unit_prices_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
