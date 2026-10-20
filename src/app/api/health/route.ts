import { NextResponse } from "next/server"
import { prisma } from "@/core/tenancy/infra/prisma"

export async function GET() {
  let dbStatus = "ok"
  let dbError = null
  let userCount = 0
  try {
    userCount = await prisma.users.count()
  } catch (err: unknown) {
    dbStatus = "error"
    dbError = err instanceof Error ? err.message : String(err)
  }

  return NextResponse.json(
    {
      status: dbStatus === "ok" ? "ok" : "degraded",
      commit: "7e8ee445",
      database: { status: dbStatus, userCount, error: dbError },
      timestamp: new Date().toISOString(),
    },
    { status: dbStatus === "ok" ? 200 : 500 }
  )
}
