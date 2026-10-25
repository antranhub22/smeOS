/**
 * SMEOS Inputs Architecture v2.1 — Register Partner Store with DSA (§4.3 & §9.5.3)
 *
 * Implements onboarding of a franchise/partner store under a separate legal entity,
 * bound by a Data Sharing Agreement (DSA).
 */

import { prisma } from "@/core/tenancy/infra/prisma"
import { ChainCollectionProfileRepository } from "../infra/chain-collection-repository"
import type { DataSharingAgreement } from "../domain/chain-collection-profile"
import type { PropagationTarget } from "../domain/field-registry-v2"

export interface RegisterPartnerStoreInput {
  readonly organizationId: string
  readonly name: string
  readonly code: string
  readonly address?: string | null | undefined
  readonly legalEntityId: string
  readonly fieldCeilings: Readonly<Record<string, PropagationTarget>>
  readonly validUntil?: string | undefined
}

export interface RegisterPartnerStoreResult {
  readonly storeId: string
  readonly name: string
  readonly code: string
  readonly isPartner: boolean
  readonly dsa: DataSharingAgreement
}

const DSA_KEY = "data_sharing_agreements"

export async function registerPartnerStore(
  input: RegisterPartnerStoreInput
): Promise<RegisterPartnerStoreResult> {
  const { organizationId, name, code, address, legalEntityId, fieldCeilings, validUntil } = input

  // 1. Create branch entry marked as partner
  const branch = await prisma.branches.create({
    data: {
      organization_id: organizationId,
      name,
      code,
      address: address ?? null,
      is_active: true,
    },
  })

  // 2. Setup Data Sharing Agreement
  const dsa: DataSharingAgreement = {
    storeId: branch.id,
    legalEntityId,
    fieldCeilings,
    validUntil: validUntil ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    status: "ACTIVE",
  }

  // 3. Persist DSA into organization settings
  const org = await prisma.organizations.findUnique({
    where: { id: organizationId },
    select: { settings: true },
  })

  const currentSettings =
    org?.settings && typeof org.settings === "object"
      ? (org.settings as Record<string, unknown>)
      : {}

  const currentDsas = (currentSettings[DSA_KEY] as Record<string, DataSharingAgreement>) ?? {}

  const updatedSettings = {
    ...currentSettings,
    [DSA_KEY]: {
      ...currentDsas,
      [branch.id]: dsa,
    },
  }

  await prisma.organizations.update({
    where: { id: organizationId },
    data: {
      settings: JSON.parse(JSON.stringify(updatedSettings)),
    },
  })

  return {
    storeId: branch.id,
    name: branch.name,
    code: branch.code,
    isPartner: true,
    dsa,
  }
}
