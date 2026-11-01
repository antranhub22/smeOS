"use client"

import { useState } from "react"
import { CampaignList } from "./campaign-list"
import { CampaignDetailsView } from "./campaign-details-view"
import { CampaignCreateModal } from "./campaign-create-modal"

export function CampaignWorkspace() {
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  return (
    <div className="mx-auto max-w-6xl">
      {activeCampaignId ? (
        <CampaignDetailsView
          campaignId={activeCampaignId}
          onBack={() => setActiveCampaignId(null)}
        />
      ) : (
        <CampaignList
          onSelectCampaign={(id) => setActiveCampaignId(id)}
          onCreateCampaign={() => setIsCreateOpen(true)}
        />
      )}

      <CampaignCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(created) => {
          setIsCreateOpen(false)
          setActiveCampaignId(created.id)
        }}
      />
    </div>
  )
}
