import { NextResponse } from "next/server"
import { prisma } from "@/core/tenancy/infra/prisma"

export async function GET() {
  let dbStatus = "ok"
  let dbError: any = null
  let userCount = 0
  const url = new URL(process.env.DATABASE_URL || "http://none")
  const maskedHost = `${url.protocol}//${url.username ? "***:***@" : ""}${url.host}${url.pathname}`

  try {
    userCount = await prisma.users.count()
  } catch (err: any) {
    dbStatus = "error"
    dbError = {
      name: err?.name,
      message: err?.message,
      code: err?.code,
      meta: err?.meta,
      stack: String(err?.stack || err).slice(0, 500),
    }
  }

  return NextResponse.json(
    {
      status: dbStatus === "ok" ? "ok" : "degraded",
      commit: "5506c701",
      dbTarget: maskedHost,
      database: { status: dbStatus, userCount, error: dbError },
      timestamp: new Date().toISOString(),
    },
    { status: dbStatus === "ok" ? 200 : 500 }
  )
}
