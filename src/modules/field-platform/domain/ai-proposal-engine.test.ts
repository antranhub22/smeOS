import { describe, expect, it } from "vitest"
import {
  approveProposal,
  createAiProposal,
  rejectProposal,
  requiresHumanApproval,
} from "./ai-proposal-engine"

describe("AI Proposal Governance Engine (§10.1)", () => {
  it("creates a valid pending proposal with TTL and immutable diff", () => {
    const proposal = createAiProposal({
      proposalId: "prop-101",
      organizationId: "org-1",
      capability: "pricing_optimizer",
      targetEntity: "PRODUCT_VARIANT",
      targetField: "pricing.product_price",
      oldValue: 250000,
      newValue: 270000,
      rationale: "Giá hoa nhập tăng 15% trong tuần lễ",
      sources: [
        {
          sourceId: "src-1",
          title: "Báo giá chợ hoa Quảng Bá",
          version: "1.0",
        },
      ],
      confidence: 0.88,
      riskClass: "R1_FINANCIAL_LEGAL",
      approverRole: "STORE_MANAGER",
      ttlHours: 24,
    })

    expect(proposal.status).toBe("PENDING")
    expect(proposal.diff.oldValue).toBe(250000)
    expect(proposal.diff.newValue).toBe(270000)
    expect(proposal.expiresAt.getTime()).toBeGreaterThan(proposal.createdAt.getTime())
    expect(requiresHumanApproval(proposal.targetField, proposal.riskClass)).toBe(true)
  })

  it("approves a pending proposal and records reviewer", () => {
    const proposal = createAiProposal({
      proposalId: "prop-102",
      organizationId: "org-1",
      capability: "tag_suggest",
      targetEntity: "PRODUCT",
      targetField: "catalog.tags",
      oldValue: ["hoa tươi"],
      newValue: ["hoa tươi", "hoa sinh nhật"],
      rationale: "Mẫu phù hợp dịp sinh nhật",
      sources: [],
      confidence: 0.95,
      riskClass: "R3_PRESENTATIONAL",
      approverRole: "STAFF",
    })

    const approved = approveProposal(proposal, "user-manager-1", new Date())
    expect(approved.status).toBe("APPROVED")
    expect(approved.reviewedBy).toBe("user-manager-1")
    expect(approved.reviewedAt).toBeDefined()
  })

  it("fails to approve an expired proposal", () => {
    const proposal = createAiProposal({
      proposalId: "prop-103",
      organizationId: "org-1",
      capability: "pricing_optimizer",
      targetEntity: "PRODUCT",
      targetField: "pricing.product_price",
      oldValue: 100000,
      newValue: 120000,
      rationale: "Tăng giá",
      sources: [],
      confidence: 0.7,
      riskClass: "R1_FINANCIAL_LEGAL",
      approverRole: "OWNER",
      ttlHours: 1,
    })

    const futureDate = new Date(proposal.expiresAt.getTime() + 1000)
    expect(() => approveProposal(proposal, "user-owner", futureDate)).toThrow(
      "hết hạn"
    )
  })

  it("rejects a proposal and records rejection reason", () => {
    const proposal = createAiProposal({
      proposalId: "prop-104",
      organizationId: "org-1",
      capability: "pricing_optimizer",
      targetEntity: "PRODUCT",
      targetField: "pricing.product_price",
      oldValue: 100000,
      newValue: 150000,
      rationale: "Tăng giá sốc",
      sources: [],
      confidence: 0.5,
      riskClass: "R1_FINANCIAL_LEGAL",
      approverRole: "OWNER",
    })

    const rejected = rejectProposal(
      proposal,
      "user-owner",
      "Giá tăng quá cao, khách sẽ bỏ đi",
      new Date()
    )
    expect(rejected.status).toBe("REJECTED")
    expect(rejected.rejectionReason).toContain("Giá tăng quá cao")
  })
})
