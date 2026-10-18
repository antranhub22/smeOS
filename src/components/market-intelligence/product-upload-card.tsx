"use client";

import React, { useState, useEffect } from "react";
import { Upload, Image as ImageIcon, Sparkles, Check, Flower2, Library, Loader2, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface ProductUploadCardProps {
  selectedImage: string;
  selectedAssetId?: string | undefined;
  productTitle: string;
  onUpdateProductTitle: (title: string) => void;
  onSelectImage: (url: string, name: string, assetId?: string | undefined) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

interface DemoItem {
  name: string;
  url: string;
  style: string;
}

/** Ảnh minh hoạ mẫu theo ngành — 3 mục khớp với aiConfig.sampleProductNames */
const DEMO_IMAGES_BY_INDUSTRY: Record<string, DemoItem[]> = {
  FLORAL: [
    { name: "", url: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80", style: "Romantic & Tinh tế" },
    { name: "", url: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80", style: "Vintage Cổ điển" },
    { name: "", url: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=600&q=80", style: "Sang trọng & Quý phái" },
  ],
  HOMESTAY: [
    { name: "", url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80", style: "Phòng Deluxe hiện đại" },
    { name: "", url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80", style: "Căn hộ ấm cúng gia đình" },
    { name: "", url: "https://images.unsplash.com/photo-1416949929422-a1d9c8fe84af?auto=format&fit=crop&w=600&q=80", style: "Villa sân vườn BBQ" },
  ],
  FASHION: [
    { name: "", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80", style: "Thời trang đường phố" },
    { name: "", url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=600&q=80", style: "Phong cách tối giản" },
    { name: "", url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=600&q=80", style: "Vintage Retro" },
  ],
  FNB: [
    { name: "", url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80", style: "Món chính đặc sắc" },
    { name: "", url: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=600&q=80", style: "Tráng miệng tinh tế" },
    { name: "", url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80", style: "Đồ uống & Coffee" },
  ],
  CRAFT_GIFT: [
    { name: "", url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80", style: "Quà tặng handmade" },
    { name: "", url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80", style: "Thủ công mỹ nghệ" },
    { name: "", url: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=600&q=80", style: "Hộp quà cao cấp" },
  ],
  RETAIL_GENERAL: [
    { name: "", url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80", style: "Sản phẩm bán lẻ" },
    { name: "", url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80", style: "Trưng bày cửa hàng" },
    { name: "", url: "https://images.unsplash.com/photo-1560472355-536de3962603?auto=format&fit=crop&w=600&q=80", style: "Combo sản phẩm" },
  ],
  SERVICES: [
    { name: "", url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80", style: "Dịch vụ chuyên nghiệp" },
    { name: "", url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=600&q=80", style: "Hỗ trợ kỹ thuật" },
    { name: "", url: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&q=80", style: "Tư vấn & Giải pháp" },
  ],
};

interface CatalogProductItem {
  id: string;
  title: string;
  price?: number;
  imageUrl?: string;
}

/** Một dòng `GET /api/v1/products` — chỉ các trường thẻ chọn từ catalog đọc. */
interface ProductApiRow {
  id: string;
  title?: string;
  name?: string;
  price?: number | null;
  image_url?: string | null;
  master_asset?: { url?: string } | null;
}

export function ProductUploadCard({
  selectedImage,
  selectedAssetId,
  productTitle,
  onUpdateProductTitle,
  onSelectImage,
  onAnalyze,
  isAnalyzing,
}: ProductUploadCardProps) {
  const { ti, industry, industryKey } = useI18n();
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<CatalogProductItem[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const demoImagesArr: DemoItem[] = DEMO_IMAGES_BY_INDUSTRY[industryKey ?? "FLORAL"] ?? DEMO_IMAGES_BY_INDUSTRY.FLORAL ?? [];
  const demoItems: DemoItem[] = ((industry?.aiConfig?.sampleProductNames) ?? []).map((name, i) => ({
    name,
    url: demoImagesArr[i]?.url ?? demoImagesArr[0]?.url ?? "",
    style: demoImagesArr[i]?.style ?? "",
  }));

  // 25/09/2026: kiểm TỪNG bước (xin URL → PUT kho → đăng ký asset). Bản trước
  // nuốt mọi lỗi và vẫn chọn ảnh — Chặng 02 rồi chạy trên một asset trỏ tới tệp
  // không tồn tại. Chặng 02 nay đọc ảnh từ kho theo asset_id, nên không có
  // asset hợp lệ thì không cho chọn.
  const uploadFileAsset = async (file: File, displayUrl: string, title: string) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const mime = file.type || "image/jpeg";
      const res = await fetch("/api/v1/assets/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mime_type: mime }),
      });
      if (!res.ok) throw new Error(`Không xin được chỗ lưu ảnh (HTTP ${res.status})`);
      const { upload_url, asset_id, storage_key } = await res.json();
      const put = await fetch(upload_url, { method: "PUT", headers: { "Content-Type": mime }, body: file });
      if (!put.ok) throw new Error(`Tải ảnh lên kho thất bại (HTTP ${put.status})`);
      const reg = await fetch("/api/v1/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asset_id, kind: "ORIGINAL", storage_key, mime_type: mime, file_size: file.size }),
      });
      if (!reg.ok) throw new Error(`Đăng ký ảnh vào kho thất bại (HTTP ${reg.status})`);
      onSelectImage(displayUrl, title, asset_id);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Không lưu được ảnh vào kho — thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  /** Sản phẩm Catalog → ảnh Master đã duyệt (hoặc ảnh gốc mới nhất) trong kho của đúng sản phẩm. */
  const handleSelectCatalogProduct = async (p: CatalogProductItem) => {
    setIsCatalogModalOpen(false);
    setUploadError(null);
    setIsUploading(true);
    try {
      const tim = async (q: string) => {
        const r = await fetch(`/api/v1/assets?product_id=${encodeURIComponent(p.id)}&limit=1&${q}`);
        if (!r.ok) return null;
        const j = (await r.json()) as { data?: { id: string; url: string | null }[] };
        return j.data?.[0] ?? null;
      };
      const anh = (await tim("kind=MASTER&approval_state=APPROVED")) ?? (await tim("kind=ORIGINAL"));
      if (!anh || !anh.url) throw new Error(`"${p.title}" chưa có ảnh trong kho — hãy tải ảnh của mẫu này lên.`);
      onUpdateProductTitle(p.title);
      onSelectImage(anh.url, p.title, anh.id);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Không lấy được ảnh của sản phẩm.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectDemo = async (item: DemoItem) => {
    onUpdateProductTitle(item.name);
    try {
      const res = await fetch(item.url);
      if (!res.ok) throw new Error(`Không tải được ảnh mẫu (HTTP ${res.status})`);
      const blob = await res.blob();
      const file = new File([blob], "demo-product.jpg", { type: blob.type || "image/jpeg" });
      await uploadFileAsset(file, item.url, item.name);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : `Không tải được ảnh mẫu — hãy tải ảnh ${ti("sampleProduct")} của tiệm.`);
    }
  };

  const handleOpenCatalog = async () => {
    setIsCatalogModalOpen(true);
    if (catalogProducts.length > 0) return;
    setLoadingCatalog(true);
    try {
      const res = await fetch("/api/v1/products?limit=15");
      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json.data)
          ? (json.data as ProductApiRow[]).map((p) => ({
              id: p.id,
              title: p.title || p.name || "",
              ...(typeof p.price === "number" ? { price: p.price } : {}),
              ...(p.master_asset?.url || p.image_url ? { imageUrl: (p.master_asset?.url || p.image_url) as string } : {}),
            }))
          : [];
        setCatalogProducts(items);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingCatalog(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = (e.target?.result as string) || URL.createObjectURL(file);
      const rawName = file.name.replace(/\.[^/.]+$/, "");
      const title = rawName.length > 3 ? rawName : `${ti("sampleProduct")} đang nhận diện`;
      onUpdateProductTitle(title);
      await uploadFileAsset(file, dataUrl, title);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-2xl border border-cool-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cool-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blush-50 text-blush-600">
            <Flower2 size={18} />
          </span>
          <div>
            <h2 className="text-sm font-bold text-cool-900">1. Tải ảnh & Nhận diện {ti("sampleProduct")} (Chặng 01 & 02)</h2>
            <p className="text-caption text-cool-500">
              Tải ảnh thực tế của tiệm, chọn mẫu từ Catalog hoặc thử nghiệm nhanh mẫu tiêu biểu
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCatalog}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blush-200 bg-blush-50/50 hover:bg-blush-100/70 text-blush-700 text-xs font-bold transition"
        >
          <Library size={14} />
          Chọn từ Catalog tiệm
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Upload Box */}
        <div className="md:col-span-2 space-y-3">
          <label className="text-xs font-bold text-cool-800 block">
            Tên {ti("sampleProduct")} đang nghiên cứu
          </label>
          <input
            type="text"
            value={productTitle}
            onChange={(e) => onUpdateProductTitle(e.target.value)}
            placeholder={`VD: ${demoItems[0]?.name ?? ti("sampleProduct")}...`}
            className="h-10 w-full rounded-xl border border-cool-200 bg-cool-50/50 px-3 text-xs text-cool-900 outline-none focus:border-blush-500 focus:bg-white transition"
          />

          {/* Drag and Drop Zone */}
          <div className="relative border-2 border-dashed border-cool-200 hover:border-blush-300 rounded-2xl p-6 text-center bg-cool-50/30 hover:bg-blush-50/20 transition cursor-pointer group">
            <input
              type="file"
              accept="image/*"
              disabled={isUploading}
              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-xs text-blush-600 group-hover:scale-110 transition">
                {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              </span>
              <p className="text-xs font-bold text-cool-700">
                {isUploading ? (
                  "Đang đồng bộ hóa ảnh lên hệ thống..."
                ) : (
                  <>
                    Kéo thả ảnh vào đây, hoặc <span className="text-blush-600 underline">chọn tệp từ máy</span>
                  </>
                )}
              </p>
              <p className="text-caption text-cool-400">Hỗ trợ JPG, PNG, WebP (Tối đa 10MB)</p>
            </div>
          </div>

          {/* Quick Demo Selector */}
          <div>
            <span className="text-caption font-bold text-cool-500 block mb-1.5">
              Hoặc thử nghiệm nhanh với mẫu {ti("sampleProduct")} tiêu biểu:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {demoItems.map((flower) => {
                const isSelected = selectedImage === flower.url;
                return (
                  <button
                    key={flower.name}
                    type="button"
                    onClick={() => handleSelectDemo(flower)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs transition ${
                      isSelected
                        ? "border-blush-500 bg-blush-50/60 text-blush-900 font-semibold"
                        : "border-cool-200 hover:bg-cool-50 text-cool-700"
                    }`}
                  >
                    <img
                      src={flower.url}
                      alt={flower.name}
                      className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-caption font-bold truncate leading-tight">{flower.name}</p>
                      <p className="text-caption text-cool-400 truncate mt-0.5">{flower.style}</p>
                    </div>
                    {isSelected && <Check size={14} className="text-blush-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Image Preview & Trigger Button */}
        <div className="flex flex-col justify-between rounded-xl border border-cool-100 bg-cool-50/50 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cool-700">Ảnh {ti("sampleProduct")} đã chọn</span>
            {selectedAssetId && (
              <span className="text-caption font-bold px-2 py-0.5 rounded bg-mint-50 text-mint-700 border border-mint-200">
                Asset Đã Đăng Ký
              </span>
            )}
          </div>

          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white border border-cool-200">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Selected"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-cool-400 gap-1 text-xs">
                <ImageIcon size={24} />
                <span>Chưa chọn ảnh</span>
              </div>
            )}
          </div>

          {uploadError && (
            <p role="alert" className="text-caption leading-snug text-danger">{uploadError}</p>
          )}
          <button
            type="button"
            onClick={onAnalyze}
            disabled={isAnalyzing || !selectedImage || !selectedAssetId || isUploading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blush-600 py-2.5 px-4 text-xs font-bold text-white hover:bg-blush-700 shadow-sm transition disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Vision AI đang bóc tách cấu trúc...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>{ti("scanButtonLabel")} (Vision AI · 1 credit)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal Chọn từ Catalog tiệm */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Library className="h-5 w-5 text-blush-600" />
                <h3 className="text-sm font-bold text-cool-900">Chọn {ti("sampleProduct")} từ Catalog của tiệm</h3>
              </div>
              <button
              aria-label="Đóng"
                type="button"
                onClick={() => setIsCatalogModalOpen(false)}
                className="rounded-lg p-1 text-cool-400 hover:bg-cool-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loadingCatalog ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-cool-500 text-xs">
                  <Loader2 size={20} className="animate-spin text-blush-600" />
                  <span>Đang tải danh sách sản phẩm tiệm...</span>
                </div>
              ) : catalogProducts.length === 0 ? (
                <div className="text-center py-12 text-cool-400 text-xs">
                  Chưa có {ti("sampleProduct")} nào trong Catalog. Bạn có thể kéo thả ảnh mới từ máy tính.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {catalogProducts.map((p) => (
                    <div
              role="button"
              tabIndex={0}
                      key={p.id}
                      onClick={() => void handleSelectCatalogProduct(p)}
                      className="flex items-center gap-2.5 p-2 rounded-xl border border-cool-200 hover:border-blush-500 hover:bg-blush-50/40 cursor-pointer transition text-left"
                    >
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.title} className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-cool-100 text-cool-400 flex-shrink-0">
                          <ImageIcon size={18} />
                        </span>
                      )}
                      <div className="min-w-0 flex-1 text-xs">
                        <p className="font-bold text-cool-900 truncate">{p.title}</p>
                        {p.price && (
                          <p className="text-caption font-semibold text-blush-600 mt-0.5">
                            {p.price.toLocaleString("vi-VN")}đ
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
