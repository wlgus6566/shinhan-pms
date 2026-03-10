-- CreateTable
CREATE TABLE "work_logs" (
    "id" BIGSERIAL NOT NULL,
    "task_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "work_date" DATE NOT NULL,
    "content" TEXT NOT NULL,
    "work_hours" DECIMAL(4,1),
    "progress" SMALLINT,
    "issues" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "work_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_work_logs_task_date" ON "work_logs"("task_id", "work_date");

-- CreateIndex
CREATE INDEX "idx_work_logs_user_date" ON "work_logs"("user_id", "work_date");

-- CreateIndex
CREATE INDEX "idx_work_logs_date" ON "work_logs"("work_date");

-- CreateIndex
CREATE UNIQUE INDEX "unique_task_user_date" ON "work_logs"("task_id", "user_id", "work_date");

-- AddForeignKey
ALTER TABLE "work_logs" ADD CONSTRAINT "work_logs_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_logs" ADD CONSTRAINT "work_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
