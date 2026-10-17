"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import type { IndustryPluginContract } from "@/modules/organization/domain/industry-plugin-contract"
import {
  getDesignFieldsConfig,
  type BomItem,
  type TerminologyGetter,
} from "./create-product-types"

interface UseCreateProductFormProps {
  ti: TerminologyGetter
  activeIndustry: IndustryPluginContract
}

export function useCreateProductForm({ ti, activeIndustry }: UseCreateProductFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const industryPrefix = useMemo(() => {
    switch (activeIndustry.identity.key) {
      case "FASHION":
        return "FS"
      case "FNB":
        return "FB"
      case "HANDMADE_CRAFT":
        return "HC"
      case "GENERAL_RETAIL":
        return "GR"
      case "SERVICES":
        return "SV"
      case "FLORAL":
      default:
        return "FL"
    }
  }, [activeIndustry.identity.key])

  const categories = useMemo(() => {
    return activeIndustry.taxonomy.defaultCategories.map((c) => c.label)
  }, [activeIndustry])

  const designConfig = useMemo(() => {
    return getDesignFieldsConfig(activeIndustry.identity.key)
  }, [activeIndustry.identity.key])

  // Form states
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [category, setCategory] = useState(categories[0] || "")
  const [shape, setShape] = useState(designConfig.shapeOptions[0] || "")
  const [facing, setFacing] = useState(designConfig.facingOptions[0] || "")
  const [container, setContainer] = useState("")
  const [priceVnd, setPriceVnd] = useState("")
  const [primaryColor, setPrimaryColor] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<"ACTIVE" | "DRAFT">("ACTIVE")

  // Image upload states
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // BOM items
  const [bomItems, setBomItems] = useState<BomItem[]>([])

  // Reset / sync categories and design config when industry changes
  useEffect(() => {
    if (categories.length > 0 && !categories.includes(category)) {
      setCategory(categories[0] ?? "")
    }
  }, [categories, category])

  useEffect(() => {
    if (designConfig.shapeOptions.length > 0 && !designConfig.shapeOptions.includes(shape)) {
      setShape(designConfig.shapeOptions[0] ?? "")
    }
    if (designConfig.facingOptions.length > 0 && !designConfig.facingOptions.includes(facing)) {
      setFacing(designConfig.facingOptions[0] ?? "")
    }
  }, [designConfig, shape, facing])

  // Auto-generate code if empty
  useEffect(() => {
    if (!code) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000)
      setCode(`${industryPrefix}-${randomSuffix}`)
    }
  }, [code, industryPrefix])

  // Initial BOM item based on industry
  useEffect(() => {
    const defaultUnit = activeIndustry.bomSpec?.measurementUnits?.[0] || "cái"
    const defaultRole = activeIndustry.bomSpec?.componentRoles?.[0]?.label || "Chủ đạo"
    const defaultName =
      activeIndustry.identity.key === "FASHION"
        ? "Vải chính (Cotton / Lụa)"
        : activeIndustry.identity.key === "FNB"
        ? "Nguyên liệu chính"
        : "Hoa hồng đỏ"

    setBomItems((prev) => {
      if (prev.length > 0) return prev
      return [
        {
          id: "init-1",
          name: defaultName,
          quantity: activeIndustry.identity.key === "FASHION" ? 2 : 10,
          unit: defaultUnit,
          color: "Tiêu chuẩn",
          role: defaultRole,
        },
      ]
    })
  }, [activeIndustry])

  // Cleanup object url
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const url = URL.createObjectURL(file)
    setImagePreview(url)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview)
    }
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleAddBomItem = () => {
    const defaultUnit = activeIndustry.bomSpec?.measurementUnits?.[0] || "cái"
    const defaultRole =
      activeIndustry.bomSpec?.componentRoles?.[1]?.label ||
      activeIndustry.bomSpec?.componentRoles?.[0]?.label ||
      "Phụ"

    setBomItems((prev) => [
      ...prev,
      {
        id: `bom-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        name: "",
        quantity: 1,
        unit: defaultUnit,
        color: "",
        role: defaultRole,
      },
    ])
  }

  const handleUpdateBomItem = (id: string, field: keyof BomItem, value: string | number) => {
    setBomItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  const handleRemoveBomItem = (id: string) => {
    setBomItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setErrorMsg(`Vui lòng nhập tên ${ti("sampleProduct").toLowerCase()}.`)
      return
    }
    if (!code.trim()) {
      setErrorMsg(`Vui lòng nhập mã ${ti("sampleProduct").toLowerCase()}.`)
      return
    }

    setSubmitting(true)
    setErrorMsg(null)

    try {
      let uploadedAssetId: string | null = null

      if (imageFile) {
        const urlRes = await fetch("/api/v1/assets/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: null, mime_type: imageFile.type }),
        })

        if (!urlRes.ok) {
          throw new Error("Không thể khởi tạo đường dẫn tải ảnh lên.")
        }

        const { asset_id, storage_key, upload_url } = await urlRes.json()

        const putRes = await fetch(upload_url, {
          method: "PUT",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        })

        if (!putRes.ok) {
          throw new Error("Tải file ảnh lên kho lưu trữ thất bại.")
        }

        const registerRes = await fetch("/api/v1/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            asset_id,
            product_id: null,
            kind: "ORIGINAL",
            storage_key,
            mime_type: imageFile.type,
            file_size: imageFile.size,
          }),
        })

        if (!registerRes.ok) {
          throw new Error("Không thể ghi nhận tài nguyên ảnh vào hệ thống.")
        }

        uploadedAssetId = asset_id
      }

      const validBom = bomItems
        .filter((b) => b.name.trim().length > 0)
        .map((b) => ({
          name: b.name.trim(),
          quantity: Number(b.quantity) || 1,
          unit: b.unit || "cái",
          color: b.color || "Tiêu chuẩn",
          role: b.role || "Chủ đạo",
        }))

      const parsedPrice = priceVnd.trim() ? Number(priceVnd.replace(/\D/g, "")) : null

      const attributesPayload = {
        price: parsedPrice,
        price_vnd: parsedPrice,
        description: description.trim() || null,
        color: primaryColor.trim() || null,
        bom: {
          flowers: validBom,
          materials: validBom,
        },
      }

      const createRes = await fetch("/api/v1/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim(),
          category,
          shape,
          facing,
          container: container.trim() || null,
          status,
          attributes: attributesPayload,
          image_asset_id: uploadedAssetId,
        }),
      })

      if (!createRes.ok) {
        let msg = `Không thể tạo ${ti("sampleProduct").toLowerCase()}`
        try {
          const body = await createRes.json()
          msg = body.error?.message ?? msg
        } catch { /* ignore */ }
        throw new Error(msg)
      }

      router.push("/san-pham" as never)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : `Đã xảy ra lỗi khi tạo ${ti("sampleProduct").toLowerCase()}.`)
    } finally {
      setSubmitting(false)
    }
  }

  return {
    name,
    setName,
    code,
    setCode,
    priceVnd,
    setPriceVnd,
    category,
    setCategory,
    categories,
    shape,
    setShape,
    facing,
    setFacing,
    container,
    setContainer,
    primaryColor,
    setPrimaryColor,
    description,
    setDescription,
    status,
    setStatus,
    imagePreview,
    submitting,
    errorMsg,
    bomItems,
    fileInputRef,
    industryPrefix,
    handleFileChange,
    handleRemoveImage,
    handleAddBomItem,
    handleUpdateBomItem,
    handleRemoveBomItem,
    handleSubmit,
  }
}
