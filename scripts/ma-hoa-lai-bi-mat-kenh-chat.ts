/**
 * Mã hoá lại bí mật kênh chat còn lưu dạng rõ trong `chat_channel_integrations.config`.
 * Chạy lặp an toàn: bản ghi đã mã hoá được bỏ qua. Không in giá trị bí mật.
 *   npx tsx --env-file-if-exists=.env scripts/ma-hoa-lai-bi-mat-kenh-chat.ts [--dry-run]
 */

import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/core/tenancy/infra/prisma"
import {
  hasPlaintextSecrets,
  openChannelConfig,
  sealChannelConfig,
  type StoredChannelConfig,
} from "@/modules/chat-assistant/infra/channel-config-vault"

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run")
  const rows = await prisma.chat_channel_integrations.findMany({ select: { id: true, config: true } })
  let migrated = 0
  for (const row of rows) {
    const stored = row.config as StoredChannelConfig | null
    if (!hasPlaintextSecrets(stored)) continue
    migrated++
    if (dryRun) continue
    const sealed = sealChannelConfig(openChannelConfig(stored))
    await prisma.chat_channel_integrations.update({
      where: { id: row.id },
      data: { config: sealed as Prisma.InputJsonObject },
    })
  }
  console.log(`${dryRun ? "[dry-run] " : ""}Đã mã hoá ${migrated}/${rows.length} cấu hình kênh.`)
}

main()
  .catch((err: unknown) => {
    console.error("Lỗi mã hoá lại:", err instanceof Error ? err.message : "không rõ")
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
