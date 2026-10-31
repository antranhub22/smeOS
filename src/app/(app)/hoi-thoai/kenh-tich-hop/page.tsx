import { redirect } from "next/navigation"

// Kênh chat đã chuyển vào Trung tâm Tích hợp (GĐ2, 31/10/2026) — giữ đường cũ cho liên kết và dấu trang.
export default function ChatChannelsIntegrationPage() {
  redirect("/tich-hop?connector=facebook_messenger")
}
