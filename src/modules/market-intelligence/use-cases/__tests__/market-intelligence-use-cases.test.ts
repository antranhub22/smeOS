import { describe, it, expect, vi } from "vitest";
import type { IMarketIntelligenceRepository } from "../../domain/repositories/market-intelligence-repository.interface";
import { triggerResearchRun } from "../trigger-research-run";
import { listTenantOpportunities } from "../list-tenant-opportunities";
import { personalizeOpportunitiesForTenants } from "../personalize-opportunities";

describe("Market Intelligence Use Cases with Clean Repositories", () => {
  it("triggerResearchRun calls triggerResearchRunAndNotify on repository", async () => {
    const mockRepo: Partial<IMarketIntelligenceRepository> = {
      triggerResearchRunAndNotify: vi.fn().mockResolvedValue({
        id: "run-123",
        status: "PENDING",
        run_type: "MANUAL",
        created_at: new Date("2026-10-25T10:00:00Z"),
      }),
    };

    const result = await triggerResearchRun("MANUAL", { keyword: "váy lụa" }, mockRepo as IMarketIntelligenceRepository);
    expect(result.runId).toBe("run-123");
    expect(result.status).toBe("PENDING");
    expect(mockRepo.triggerResearchRunAndNotify).toHaveBeenCalledWith("MANUAL", { keyword: "váy lụa" });
  });

  it("listTenantOpportunities calls countOpportunities and listOpportunitiesWithTopic", async () => {
    const mockRepo: Partial<IMarketIntelligenceRepository> = {
      countOpportunities: vi.fn().mockResolvedValue(1),
      listOpportunitiesWithTopic: vi.fn().mockResolvedValue([
        {
          id: "opp-1",
          organization_id: "org-1",
          topic_id: "topic-1",
          content_opportunity_score: 85,
          trend_score: 90,
          viral_score: 80,
          commercial_score: 85,
          confidence: 0.9,
          opportunity_summary: "Xu hướng đầm dự tiệc",
          content_angles: [],
          recommended_formats: ["REEL"],
          recommended_hooks: ["Hook 1"],
          expires_at: new Date(),
          created_at: new Date(),
          topic: { canonical_name: "Đầm dự tiệc" },
        },
      ]),
    };

    const result = await listTenantOpportunities(
      { organizationId: "org-1", limit: 10 },
      mockRepo as IMarketIntelligenceRepository
    );

    expect(result.total).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.topicName).toBe("Đầm dự tiệc");
    expect(mockRepo.countOpportunities).toHaveBeenCalledWith("org-1", 0, undefined);
    expect(mockRepo.listOpportunitiesWithTopic).toHaveBeenCalled();
  });

  it("personalizeOpportunitiesForTenants processes organizations and creates opportunities", async () => {
    const mockRepo: Partial<IMarketIntelligenceRepository> = {
      getTenantsForPersonalization: vi.fn().mockResolvedValue([
        {
          id: "org-1",
          name: "Tiệm Hoa Xinh",
          type: "RETAIL",
          settings: { industry: "FLORAL" },
          brand_profile: {
            tone_of_voice: "Thanh lịch",
            hashtags: ["#hoaxinh"],
            default_offers: ["Free ship"],
          },
          products: [{ id: "p1", name: "Bó hoa hồng" }],
          pricing_rules: [{ key: "muc_thu", value: 300_000 }],
          customers: [{ tier: "VIP" }],
        },
      ]),
      getScoredTopics: vi.fn().mockResolvedValue([
        {
          id: "topic-1",
          canonical_name: "Hoa tulip cam",
          scores: [{ trend_score: 88, viral_score: 82, calculated_at: new Date() }],
        },
      ]),
      createContentOpportunity: vi.fn().mockResolvedValue({
        id: "opp-new",
        organization_id: "org-1",
        topic_id: "topic-1",
        opportunity_summary: "Gợi ý",
        content_angles: [],
        recommended_formats: [],
        recommended_hooks: [],
        trend_score: 88,
        viral_score: 82,
        commercial_score: 80,
        content_opportunity_score: 84,
        confidence: 0.85,
        expires_at: new Date(),
      }),
    };

    const result = await personalizeOpportunitiesForTenants(
      ["topic-1"],
      undefined,
      mockRepo as IMarketIntelligenceRepository
    );

    expect(result.organizationsProcessed).toBe(1);
    expect(result.opportunitiesCreated).toBe(1);
    expect(mockRepo.createContentOpportunity).toHaveBeenCalled();
  });
});
