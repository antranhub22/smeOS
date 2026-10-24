import { z } from "zod"

import { validationFailed } from "@/core/http/errors"
import { handle, jsonResponse } from "@/core/http/response"
import { sendEmail } from "@/core/notifications/email-service"
import { signUp } from "@/modules/organization/use-cases/sign-up"

// Đăng ký thật: hồ sơ luôn để trống — chỉ instant-trial mới seed data mẫu theo ngành.
// Approval Gate: sau khi đăng ký, tài khoản ở trạng thái PENDING_APPROVAL.
// Super Admin vào /van-hanh/dang-ky để duyệt.

const ADMIN_NOTIFICATION_EMAIL = "tuan.ctw@gmail.com"

const schema = z.object({
  email: z.string(),
  password: z.string(),
  name: z.string().nullish(),
  organization_name: z.string(),
  industry_key: z.string().nullish(),
  organization_type: z.enum(["SINGLE", "CHAIN"]).default("SINGLE"),
})

export const POST = handle(async (request) => {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) throw validationFailed({ issues: parsed.error.issues })

  const result = await signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    name: parsed.data.name ?? null,
    organizationName: parsed.data.organization_name,
    industryKey: parsed.data.industry_key ?? undefined,
    organizationType: parsed.data.organization_type,
    seedProfile: false,
  })

  // Gửi email thông báo cho Super Admin — fire-and-forget, không block response.
  void sendEmail({
    to: ADMIN_NOTIFICATION_EMAIL,
    subject: `[smeOS] Đơn đăng ký mới: ${parsed.data.organization_name}`,
    html: buildAdminNotificationHtml({
      orgName: parsed.data.organization_name,
      applicantEmail: parsed.data.email,
      applicantName: parsed.data.name ?? null,
      industryKey: parsed.data.industry_key ?? "FLORAL",
      orgType: parsed.data.organization_type,
    }),
  })

  return jsonResponse({ status: result.status }, { status: 201 })
})

function buildAdminNotificationHtml(data: {
  orgName: string
  applicantEmail: string
  applicantName: string | null
  industryKey: string
  orgType: string
}): string {
  return `
<div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 12px;">
  <h2 style="color: #111827; margin-bottom: 4px;">📋 Đơn đăng ký mới</h2>
  <p style="color: #6b7280; font-size: 14px; margin-top: 0;">Có cửa hàng mới đăng ký trên smeOS, cần bạn xét duyệt.</p>
  <table style="width: 100%; border-collapse: collapse; margin-top: 16px; background: #fff; border-radius: 8px; overflow: hidden;">
    <tr style="background: #f3f4f6;">
      <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #374151; width: 40%;">Cửa hàng</td>
      <td style="padding: 10px 14px; font-size: 13px; color: #111827;">${data.orgName}</td>
    </tr>
    <tr>
      <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #374151;">Email đăng ký</td>
      <td style="padding: 10px 14px; font-size: 13px; color: #111827;">${data.applicantEmail}</td>
    </tr>
    <tr style="background: #f3f4f6;">
      <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #374151;">Người điều hành</td>
      <td style="padding: 10px 14px; font-size: 13px; color: #111827;">${data.applicantName ?? "—"}</td>
    </tr>
    <tr>
      <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #374151;">Ngành</td>
      <td style="padding: 10px 14px; font-size: 13px; color: #111827;">${data.industryKey}</td>
    </tr>
    <tr style="background: #f3f4f6;">
      <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #374151;">Loại hình</td>
      <td style="padding: 10px 14px; font-size: 13px; color: #111827;">${data.orgType === "CHAIN" ? "Chuỗi cửa hàng" : "Cửa hàng độc lập"}</td>
    </tr>
  </table>
  <div style="margin-top: 20px; text-align: center;">
    <a href="${process.env.PUBLIC_APP_URL ?? "http://localhost:3200"}/van-hanh/dang-ky"
       style="display: inline-block; background: #6366f1; color: #fff; padding: 11px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
      Vào trang Duyệt đăng ký →
    </a>
  </div>
  <p style="margin-top: 16px; font-size: 12px; color: #9ca3af; text-align: center;">smeOS Platform • Giai đoạn Beta</p>
</div>
`
}
