import { getDictionary, translate } from "@/lib/i18n/server"
import { redirect } from "next/navigation"

export default function ChatRedirectPage() {
  const dict = getDictionary("vi")
  redirect("/hoi-thoai")
}
