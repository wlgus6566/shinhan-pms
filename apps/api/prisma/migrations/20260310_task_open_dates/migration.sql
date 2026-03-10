-- CreateTable: task_open_dates (업무별 오픈일 복수 등록)
CREATE TABLE "task_open_dates" (
    "id" BIGSERIAL NOT NULL,
    "task_id" BIGINT NOT NULL,
    "open_date" TIMESTAMP(6) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_open_dates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_task_open_dates_task_id" ON "task_open_dates"("task_id");

-- AddForeignKey
ALTER TABLE "task_open_dates" ADD CONSTRAINT "task_open_dates_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- MigrateData: 기존 open_date 데이터를 task_open_dates 테이블로 이관
INSERT INTO "task_open_dates" ("task_id", "open_date", "sort_order", "created_at")
SELECT "id", "open_date", 0, CURRENT_TIMESTAMP
FROM "tasks"
WHERE "open_date" IS NOT NULL;

-- AlterTable: tasks 테이블에서 open_date 컬럼 제거
ALTER TABLE "tasks" DROP COLUMN "open_date";
