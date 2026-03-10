-- 업무 오픈일 데이터 이관: tasks.open_date -> task_open_dates 테이블
-- 실행 조건: task_open_dates 테이블이 생성된 후, open_date 컬럼이 삭제되기 전

-- 1. 새 테이블 생성 (없을 경우에만)
CREATE TABLE IF NOT EXISTS "task_open_dates" (
    "id" BIGSERIAL NOT NULL,
    "task_id" BIGINT NOT NULL,
    "open_date" TIMESTAMP(6) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "task_open_dates_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_task_open_dates_task_id" ON "task_open_dates"("task_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'task_open_dates_task_id_fkey'
  ) THEN
    ALTER TABLE "task_open_dates" ADD CONSTRAINT "task_open_dates_task_id_fkey"
      FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 2. 데이터 이관 (open_date 컬럼이 존재할 경우에만)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'open_date'
  ) THEN
    INSERT INTO "task_open_dates" ("task_id", "open_date", "sort_order", "created_at")
    SELECT "id", "open_date", 0, CURRENT_TIMESTAMP
    FROM "tasks"
    WHERE "open_date" IS NOT NULL;

    ALTER TABLE "tasks" DROP COLUMN "open_date";
  END IF;
END $$;
