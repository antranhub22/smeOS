import type { ReactNode } from "react"
import { FeatureLockedGuard } from "@/components/layout/feature-locked-guard"

export default function ThuHutKhachLayout({ children }: { children: ReactNode }) {
  return <FeatureLockedGuard route="/thu-hut-khach">{children}</FeatureLockedGuard>
}
