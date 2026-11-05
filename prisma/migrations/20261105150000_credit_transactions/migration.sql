-- Checklist ALG 10.6: sổ cái credit. Mọi thay đổi organizations.credit_balance ghi một dòng; số dư = tổng amount.

-- CreateEnum
CREATE TYPE "credit_transaction_kind" AS ENUM ('OPENING', 'TOPUP', 'GIFT', 'REFUND', 'USAGE');

-- CreateTable
CREATE TABLE "credit_transactions" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "kind" "credit_transaction_kind" NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "service" TEXT,
    "reason" TEXT,
    "reference" TEXT,
    "actor_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "credit_transactions_organization_id_idx" ON "credit_transactions"("organization_id");

-- CreateIndex
CREATE INDEX "credit_transactions_organization_id_created_at_idx" ON "credit_transactions"("organization_id", "created_at");

-- AddForeignKey
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Số dư đầu kỳ: mỗi tổ chức đang có credit nhận một dòng OPENING để sổ khớp số dư hiện tại
INSERT INTO "credit_transactions" ("id", "organization_id", "kind", "amount", "balance_after", "reason")
SELECT gen_random_uuid()::text, "id", 'OPENING', "credit_balance", "credit_balance", 'Số dư lúc mở sổ cái credit'
FROM "organizations" WHERE "credit_balance" <> 0;
