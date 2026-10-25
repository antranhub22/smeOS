/**
 * SMEOS Inputs Architecture v2.1 — Chain Collection Profile Repository
 *
 * Implements persistent storage for Chain Collection Profiles within
 * organization configuration settings.
 */

import { prisma } from "@/core/tenancy/infra/prisma"
import type {
  ChainCollectionProfile,
  CollectionRule,
  DataSharingAgreement,
} from "../domain/chain-collection-profile"

export interface IChainCollectionProfileRepository {
  getProfile(organizationId: string): Promise<ChainCollectionProfile | null>
  saveProfile(profile: ChainCollectionProfile): Promise<void>
  getStoreDsa(storeId: string): Promise<DataSharingAgreement | null>
  listActiveDsas(organizationId: string): Promise<readonly DataSharingAgreement[]>
}

const SETTINGS_KEY = "chain_collection_profile"
const DSA_KEY = "data_sharing_agreements"

export class ChainCollectionProfileRepository implements IChainCollectionProfileRepository {
  async getProfile(organizationId: string): Promise<ChainCollectionProfile | null> {
    const org = await prisma.organizations.findUnique({
      where: { id: organizationId },
      select: { settings: true },
    })

    if (!org?.settings || typeof org.settings !== "object") {
      return null
    }

    const settingsObj = org.settings as Record<string, unknown>
    const stored = settingsObj[SETTINGS_KEY]

    if (!stored || typeof stored !== "object") {
      return null
    }

    return stored as ChainCollectionProfile
  }

  async saveProfile(profile: ChainCollectionProfile): Promise<void> {
    const org = await prisma.organizations.findUnique({
      where: { id: profile.organizationId },
      select: { settings: true },
    })

    const currentSettings =
      org?.settings && typeof org.settings === "object"
        ? (org.settings as Record<string, unknown>)
        : {}

    const updatedSettings = {
      ...currentSettings,
      [SETTINGS_KEY]: profile,
    }

    await prisma.organizations.update({
      where: { id: profile.organizationId },
      data: {
        settings: JSON.parse(JSON.stringify(updatedSettings)),
      },
    })
  }

  async getStoreDsa(storeId: string): Promise<DataSharingAgreement | null> {
    // Read DSA from branch / store settings or organization settings
    const branch = await prisma.branches.findUnique({
      where: { id: storeId },
      select: { organization_id: true },
    })

    if (!branch) return null

    const org = await prisma.organizations.findUnique({
      where: { id: branch.organization_id },
      select: { settings: true },
    })

    if (!org?.settings || typeof org.settings !== "object") return null

    const settingsObj = org.settings as Record<string, unknown>
    const dsas = (settingsObj[DSA_KEY] as Record<string, DataSharingAgreement>) ?? {}

    return dsas[storeId] ?? null
  }

  async listActiveDsas(organizationId: string): Promise<readonly DataSharingAgreement[]> {
    const org = await prisma.organizations.findUnique({
      where: { id: organizationId },
      select: { settings: true },
    })

    if (!org?.settings || typeof org.settings !== "object") return []

    const settingsObj = org.settings as Record<string, unknown>
    const dsas = (settingsObj[DSA_KEY] as Record<string, DataSharingAgreement>) ?? {}

    return Object.values(dsas).filter((d) => d.status === "ACTIVE")
  }
}
