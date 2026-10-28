import { getDictionary, translate } from "@/lib/i18n/server"
import { redirect } from "next/navigation"

export default function HoSoRedirectPage() {
  const dict = getDictionary("vi")
  // Option 1: Consolidate Profile into Settings as a Single Source of Truth
  redirect("/cai-dat")
}
