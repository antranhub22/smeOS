"use client"
/**
 * VariantWorkspace — Khu vực D (Chặng 06c): M04b Biến thể Marketing
 * Tách sub-components: VariantResultBoard, VariantConfigPanel, useVariantWorkspace
 */

import { Check } from "@/components/ui/icon-set/check"
import { AlertTriangle } from "@/components/ui/icon-set/alert-triangle"
import { FlowSteps } from "@/components/flow/flow-steps"
import { Button } from "@/components/ui/button"
import { FLOW_M04B } from "./types"
import type { UseCreativeStudioReturn } from "./use-creative-studio-data"
import { VariantResultBoard } from "./variant-result-board"
import { VariantConfigPanel } from "./variant-config-panel"
import { useVariantWorkspace } from "./use-variant-workspace"

interface VariantWorkspaceProps {
  data: UseCreativeStudioReturn
}

export function VariantWorkspace({ data }: VariantWorkspaceProps) {
  const ws = useVariantWorkspace(data)

  // PHASE: RUNNING B
  if (ws.phase === "running-b") {
    return (
      <div className="flex flex-1 flex-col items-center gap-5 w-full max-w-xl mx-auto py-8">
        <div className="text-center">
          <div className="text-title font-extrabold text-text">Đang sinh biến thể Biến thể marketing</div>
          <div className="mt-1 text-body-sm text-text-muted">{ws.jobPhase ?? "Đang xếp hàng chờ worker nhận việc..."}</div>
        </div>
        <div className="w-full">
          <FlowSteps
            steps={FLOW_M04B}
            currentStep={ws.jobPhase ?? "SEGMENTING"}
            cancellable={ws.jobStatus === "PENDING"}
            onCancel={() => {
              ws.setJobStatus("CANCELLED")
              ws.setPhase("config-b")
            }}
          />
        </div>
      </div>
    )
  }

  // PHASE: RESULT B
  if (ws.phase === "result-b" && ws.scenePlan) {
    return (
      <VariantResultBoard
        narrativeResultScenes={ws.narrativeResultScenes}
        sceneCandidates={ws.sceneCandidates}
        sceneMeta={ws.sceneMeta}
        selectedSceneIndex={ws.selectedSceneIndex}
        setSelectedSceneIndex={ws.setSelectedSceneIndex}
        sceneCount={ws.sceneCount}
        generatedSceneCount={ws.generatedSceneCount}
        sceneCreditTotal={ws.sceneCreditTotal}
        cloudAvailable={ws.cloudAvailable}
        sceneEngine={ws.sceneEngine}
        setSceneEngine={ws.setSceneEngine}
        renderOpts={ws.renderOpts}
        setRenderOpts={ws.setRenderOpts}
        sceneProvider={ws.sceneProvider}
        setSceneProvider={ws.setSceneProvider}
        watermarkEnabled={ws.watermarkEnabled}
        variantRatio={ws.variantRatio}
        setVariantRatio={ws.setVariantRatio}
        planRatios={ws.planRatios}
        ratioCounts={ws.ratioCounts}
        viewRatio={ws.viewRatio}
        judgmentB={ws.judgmentB}
        variantIntegrity={ws.variantIntegrity}
        minSceneIntegrity={ws.minSceneIntegrity}
        generatingAllScenes={ws.generatingAllScenes}
        generatingSceneIndex={ws.generatingSceneIndex}
        approvingSceneIndex={ws.approvingSceneIndex}
        canApproveVariantCap={ws.canApproveVariantCap}
        handleGenerateAllScenes={ws.handleGenerateAllScenes}
        handleGenerateAllRatios={ws.handleGenerateAllRatios}
        handleGenerateSingleScene={ws.handleGenerateSingleScene}
        handleApproveScene={ws.handleApproveScene}
        handleSelectCandidate={ws.handleSelectCandidate}
        setPhase={ws.setPhase}
        navigateToArea={ws.navigateToArea}
        planScenes={ws.planScenes}
      />
    )
  }

  // PHASE: SAVED
  if (ws.phase === "saved") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center my-auto py-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-success-bg">
          <Check size={40} strokeWidth={2} className="text-secondary" />
        </div>
        <div>
          <div className="text-title font-extrabold text-text">Đã lưu vào Kho ảnh sản phẩm</div>
          <div className="mt-1 text-body-sm text-text-muted">Biến thể marketing và Master Image đều được bảo toàn trong kho ảnh của tiệm</div>
        </div>
        <div className="flex gap-3 mt-2">
          <Button variant="outline" onClick={() => ws.setPhase("config-b")}>Tạo thêm biến thể khác</Button>
          <Button onClick={() => ws.navigateToArea("e")} className="gap-1.5">Tiếp tục → Chuyển sang Tạo Video (Video)</Button>
        </div>
      </div>
    )
  }

  // PHASE: ERROR
  if (ws.phase === "error") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center my-auto py-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-danger-bg">
          <AlertTriangle size={40} strokeWidth={2} className="text-danger" />
        </div>
        <div>
          <div className="text-title font-extrabold text-text">Đã xảy ra lỗi</div>
          <div className="mt-1 text-body-sm text-text-muted">{ws.errorMsg ?? "Không thể hoàn thành tác vụ"}</div>
        </div>
        <div className="flex gap-3 mt-2">
          <Button onClick={() => { ws.setErrorMsg(null); ws.setPhase("config-b") }}>Thử lại</Button>
        </div>
      </div>
    )
  }

  // PHASE: CONFIG-B (Default)
  return (
    <VariantConfigPanel
      context={ws.context}
      scenePlan={ws.scenePlan}
      planLoading={ws.planLoading}
      planWriting={ws.planWriting}
      planError={ws.planError}
      planCtx={ws.planCtx}
      cloudAvailable={ws.cloudAvailable}
      sceneEngine={ws.sceneEngine}
      setSceneEngine={ws.setSceneEngine}
      sceneProvider={ws.sceneProvider}
      setSceneProvider={ws.setSceneProvider}
      renderOpts={ws.renderOpts}
      variantRatio={ws.variantRatio}
      setVariantRatio={ws.setVariantRatio}
      watermarkEnabled={ws.watermarkEnabled}
      setWatermarkEnabled={ws.setWatermarkEnabled}
      sceneCount={ws.sceneCount}
      sceneCreditTotal={ws.sceneCreditTotal}
      narrativeResultScenes={ws.narrativeResultScenes}
      showManualSourcePicker={ws.showManualSourcePicker}
      setShowManualSourcePicker={ws.setShowManualSourcePicker}
      approvedMasters={ws.approvedMasters}
      selectedMasterId={ws.selectedMasterId}
      setSelectedMasterId={ws.setSelectedMasterId}
      assets={ws.assets}
      promoteOriginalToMaster={ws.promoteOriginalToMaster}
      loadingMasters={ws.loadingMasters}
      loadingAssets={ws.loadingAssets}
      canApprove={ws.canApprove}
      promotingMaster={ws.promotingMaster}
      generatingAllScenes={ws.generatingAllScenes}
      masterError={ws.masterError}
      activeMasterId={ws.activeMasterId}
      hasImageSource={ws.hasImageSource}
      navigateToArea={ws.navigateToArea}
      openSceneBoard={ws.openSceneBoard}
      handleWritePlan={ws.handleWritePlan}
      handleUseRulePlan={ws.handleUseRulePlan}
    />
  )
}
