import { prisma } from "./prisma"

export async function checkDatabaseHealth(): Promise<number> {
  return prisma.users.count()
}
