-- Checklist ALG 10.3, 9.7, 10.5: hạn mức credit theo tháng (Console đặt) và trần AI (cửa hàng đặt), cờ cảnh báo mỗi kỳ.

-- CreateTable
CREATE TABLE "usage_limits" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "monthly_limit" INTEGER,
    "used" INTEGER NOT NULL DEFAULT 0,
    "alerted_near" BOOLEAN NOT NULL DEFAULT false,
    "alerted_low" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usage_limits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "usage_limits_organization_id_idx" ON "usage_limits"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "usage_limits_organization_id_service_period_key" ON "usage_limits"("organization_id", "service", "period");

-- AddForeignKey
ALTER TABLE "usage_limits" ADD CONSTRAINT "usage_limits_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

