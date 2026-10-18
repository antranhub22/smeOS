export interface MatrixIndustry {
  key: string
  name: string
  iconName: string
  description?: string
}

export interface MatrixGroup {
  key: string
  label: string
}

export interface MatrixNavItem {
  navKey: string
  label: string
  group: string
  href: string
  iconKey: string
}

export interface NavMatrixApiResponse {
  industries: MatrixIndustry[]
  groups: MatrixGroup[]
  navItems: MatrixNavItem[]
  defaultMatrix: Record<string, string[]>
  activeOverrides: Record<string, string[]>
}

export interface MatrixDiffItem {
  industryName: string
  industryKey: string
  navItemLabel: string
  navKey: string
  action: "HIDE" | "SHOW"
}
