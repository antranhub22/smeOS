-- Checklist ALG 10.7, PO Q9: gói thuê bao, hoá đơn kỳ (VietQR + SePay), credit tặng theo gói hết hạn cuối tháng.

-- CreateEnum
CREATE TYPE "subscription_cycle" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "subscription_status" AS ENUM ('ACTIVE', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "subscription_invoice_status" AS ENUM ('PENDING', 'PAID', 'VOID');

-- AlterEnum
ALTER TYPE "credit_transaction_kind" ADD VALUE 'EXPIRE';

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "cycle" "subscription_cycle" NOT NULL,
    "price_vnd" INTEGER NOT NULL,
    "included_credits_monthly" INTEGER NOT NULL DEFAULT 0,
    "status" "subscription_status" NOT NULL DEFAULT 'ACTIVE',
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "plan_credit_period" TEXT,
    "plan_credit_granted" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_invoices" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "amount_vnd" INTEGER NOT NULL,
    "status" "subscription_invoice_status" NOT NULL DEFAULT 'PENDING',
    "due_at" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "payment_reference" TEXT,
    "reminded_7d" BOOLEAN NOT NULL DEFAULT false,
    "reminded_1d" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_organization_id_key" ON "subscriptions"("organization_id");

-- CreateIndex
CREATE INDEX "subscriptions_organization_id_idx" ON "subscriptions"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_invoices_code_key" ON "subscription_invoices"("code");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_invoices_payment_reference_key" ON "subscription_invoices"("payment_reference");

-- CreateIndex
CREATE INDEX "subscription_invoices_organization_id_idx" ON "subscription_invoices"("organization_id");

-- CreateIndex
CREATE INDEX "subscription_invoices_status_due_at_idx" ON "subscription_invoices"("status", "due_at");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_invoices_subscription_id_period_start_key" ON "subscription_invoices"("subscription_id", "period_start");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_invoices" ADD CONSTRAINT "subscription_invoices_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_invoices" ADD CONSTRAINT "subscription_invoices_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

