-- Checklist ALG 10.4: chi phí thật của SMS/ZNS theo giá vốn tham chiếu, để tính biên lợi nhuận nền tảng.

-- CreateTable
CREATE TABLE "provider_cost_entries" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "cost_usd" DOUBLE PRECISION,
    "cost_vnd" INTEGER NOT NULL,
    "reference" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_cost_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "provider_cost_entries_organization_id_idx" ON "provider_cost_entries"("organization_id");

-- CreateIndex
CREATE INDEX "provider_cost_entries_organization_id_occurred_at_idx" ON "provider_cost_entries"("organization_id", "occurred_at");

-- AddForeignKey
ALTER TABLE "provider_cost_entries" ADD CONSTRAINT "provider_cost_entries_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

