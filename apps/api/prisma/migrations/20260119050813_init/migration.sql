-- CreateTable
CREATE TABLE "projects" (
    "id" BIGSERIAL NOT NULL,
    "project_name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" BIGINT,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "profile_image" TEXT,
    "department" VARCHAR(50) NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    "last_login_at" TIMESTAMP(6),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" BIGINT,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_project_name_key" ON "projects"("project_name");

-- CreateIndex
CREATE INDEX "idx_projects_name" ON "projects"("project_name");

-- CreateIndex
CREATE INDEX "idx_projects_status" ON "projects"("status");

-- CreateIndex
CREATE INDEX "idx_projects_dates" ON "projects"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "idx_projects_created_at" ON "projects"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_projects_is_active" ON "projects"("is_active");

-- CreateIndex
CREATE INDEX "idx_projects_active_status" ON "projects"("is_active", "status");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_department" ON "users"("department");

-- CreateIndex
CREATE INDEX "idx_users_role" ON "users"("role");

-- CreateIndex
CREATE INDEX "idx_users_is_active" ON "users"("is_active");

-- CreateIndex
CREATE INDEX "idx_users_department_active" ON "users"("department", "is_active");

-- CreateIndex
CREATE INDEX "idx_users_role_active" ON "users"("role", "is_active");
