import { redirect } from "next/navigation"

export default function HoSoRedirectPage() {
  // Option 1: Consolidate Profile into Settings as a Single Source of Truth
  redirect("/cai-dat")
}
