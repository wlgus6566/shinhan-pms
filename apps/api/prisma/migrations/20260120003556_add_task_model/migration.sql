-- CreateTable
CREATE TABLE "tasks" (
    "id" BIGSERIAL NOT NULL,
    "project_id" BIGINT NOT NULL,
    "task_name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "difficulty" VARCHAR(10) NOT NULL,
    "client_name" VARCHAR(100),
    "planning_assignee_id" BIGINT,
    "design_assignee_id" BIGINT,
    "frontend_assignee_id" BIGINT,
    "backend_assignee_id" BIGINT,
    "start_date" DATE,
    "end_date" DATE,
    "notes" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'TODO',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" BIGINT,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_tasks_project_id" ON "tasks"("project_id");

-- CreateIndex
CREATE INDEX "idx_tasks_difficulty" ON "tasks"("difficulty");

-- CreateIndex
CREATE INDEX "idx_tasks_status" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "idx_tasks_is_active" ON "tasks"("is_active");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_planning_assignee_id_fkey" FOREIGN KEY ("planning_assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_design_assignee_id_fkey" FOREIGN KEY ("design_assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_frontend_assignee_id_fkey" FOREIGN KEY ("frontend_assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_backend_assignee_id_fkey" FOREIGN KEY ("backend_assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
