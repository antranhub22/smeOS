/**
 * greeting-card.ts — English dictionary section `greetingCard` (mirrors vi/greeting-card.ts)
 */

export const greetingCardEn = {
  header: {
    breadcrumb: "Orders",
    title: "Showcase Card",
    description: "Send product catalogs for customers to browse, select, order, and pay directly on mobile.",
    guideButton: "Showcase Guide",
    todoButton: "Action Items",
    modes: {
      quickSend: "Quick Send",
      manage: "Management",
    },
    refresh: "Refresh",
    exportExcel: "Export Excel",
  },
  tabs: {
    catalogs: "Catalogs",
    tracking: "Order Tracking",
    sales: "Sales",
    operation: "Operations",
    coordination: "Dispatch",
  },
  readiness: {
    openProfile: "Open Shop Profile",
    warning: "Shop profile incomplete. Please notify Operations to update before creating links.",
  },
  catalogs: {
    title: "Catalog Management",
    description: "Create and customize product catalogs to share with customers.",
    createButton: "New Catalog",
    copyChannelLabel: "Copy link for channel",
    channelNote: "This link is tied to your account. Orders placed will be credited to you.",
    noChannel: "No channel selected",
  },
  guideModal: {
    title: "How to Use Showcase Cards",
    step1: "Create a curated catalog for seasonal events or customer needs",
    step2: "Copy and share the link via messaging apps",
    step3: "Customers browse designs, write card notes or instructions, and place orders directly",
    step4: "Orders route automatically to the production workshop for preparation",
  },
} as const
