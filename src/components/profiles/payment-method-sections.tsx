"use client"

import React from "react"
import {
  Landmark,
  CreditCard,
  Truck,
  Store,
  Smartphone,
} from "@/components/ui/icons"
import type {
  StorePaymentMethodsConfig,
  CardProviderKey,
  EWalletProviderKey,
} from "@/modules/greeting-card/domain/store-payment-methods"

interface SectionProps {
  config: StorePaymentMethodsConfig
  updateConfig: (patch: Partial<StorePaymentMethodsConfig>) => void
}

/** 1. Chuyển khoản ngân hàng (VietQR) */
export function BankTransferSection({ config, updateConfig }: SectionProps) {
  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-border bg-surface shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Landmark size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text">1. Chuyển khoản ngân hàng (VietQR)</h3>
            <p className="text-caption text-text-muted">Tự động sinh mã VietQR động theo đơn hàng</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.enableVietQr}
            onChange={(e) => updateConfig({ enableVietQr: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-10 h-6 bg-surface-alt peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
        </label>
      </div>

      {config.enableVietQr && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          <div className="space-y-1">
            <label className="text-caption font-bold text-text">Mã ngân hàng (VietQR)</label>
            <input
              type="text"
              value={config.bankId}
              onChange={(e) => updateConfig({ bankId: e.target.value.toUpperCase() })}
              placeholder="VD: VCB, MB, TCB, ACB, TPB..."
              className="w-full h-10 px-3 text-xs rounded-xl border border-border bg-background text-text focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-caption font-bold text-text">Tên ngân hàng hiển thị</label>
            <input
              type="text"
              value={config.bankName}
              onChange={(e) => updateConfig({ bankName: e.target.value })}
              placeholder="VD: Vietcombank, Ngân hàng Quân Đội..."
              className="w-full h-10 px-3 text-xs rounded-xl border border-border bg-background text-text focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-caption font-bold text-text">Số tài khoản nhận tiền</label>
            <input
              type="text"
              value={config.accountNo}
              onChange={(e) => updateConfig({ accountNo: e.target.value })}
              placeholder="VD: 0071001234567"
              className="w-full h-10 px-3 text-xs rounded-xl border border-border bg-background text-text focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-caption font-bold text-text">Tên chủ tài khoản</label>
            <input
              type="text"
              value={config.accountName}
              onChange={(e) => updateConfig({ accountName: e.target.value.toUpperCase() })}
              placeholder="VD: NGUYEN VAN A"
              className="w-full h-10 px-3 text-xs rounded-xl border border-border bg-background text-text focus:ring-1 focus:ring-primary uppercase"
            />
          </div>
        </div>
      )}
    </div>
  )
}

/** 2. Tiền mặt khi nhận hàng (COD) */
export function CodPaymentSection({ config, updateConfig }: SectionProps) {
  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-border bg-surface shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Truck size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text">2. Tiền mặt khi nhận hàng (COD)</h3>
            <p className="text-caption text-text-muted">Shipper thu tiền mặt khi giao hàng tận nơi</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.enableCod}
            onChange={(e) => updateConfig({ enableCod: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-10 h-6 bg-surface-alt peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
        </label>
      </div>

      {config.enableCod && (
        <div className="space-y-3 pt-1">
          <label className="flex items-center gap-2 text-xs font-semibold text-text cursor-pointer">
            <input
              type="checkbox"
              checked={config.codRequiresDeposit}
              onChange={(e) => updateConfig({ codRequiresDeposit: e.target.checked })}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span>Yêu cầu đặt cọc trước (khách cọc theo tỷ lệ ở mục 4, phần còn lại thu COD khi giao)</span>
          </label>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-xs text-text-muted">Áp dụng COD cho đơn tối đa:</span>
            <input
              type="number"
              value={config.codMaxVnd ?? ""}
              onChange={(e) => updateConfig({ codMaxVnd: e.target.value ? Number(e.target.value) : null })}
              placeholder="Để trống = Không giới hạn"
              className="w-56 h-9 px-3 text-xs rounded-xl border border-border bg-background text-text"
            />
            <span className="text-caption text-text-muted">VNĐ (Đơn trên mức này bắt buộc thanh toán 100%)</span>
          </div>
        </div>
      )}
    </div>
  )
}

/** 3. Thẻ quốc tế & Cổng thanh toán (Visa / Mastercard) */
export function InternationalCardSection({ config, updateConfig }: SectionProps) {
  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-border bg-surface shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CreditCard size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text">3. Cổng thanh toán thẻ quốc tế (Visa / Mastercard)</h3>
            <p className="text-caption text-text-muted">Phục vụ khách hàng Việt kiều & quốc tế thanh toán từ xa</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.enableCard}
            onChange={(e) => updateConfig({ enableCard: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-10 h-6 bg-surface-alt peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
        </label>
      </div>

      {config.enableCard && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <label className="text-caption font-bold text-text">Nhà cung cấp cổng thanh toán</label>
            <select
              value={config.cardProvider}
              onChange={(e) => updateConfig({ cardProvider: e.target.value as CardProviderKey })}
              className="w-full h-10 px-3 text-xs rounded-xl border border-border bg-surface text-text"
            >
              <option value="ONEPAY">OnePay (Hỗ trợ Visa, Master, JCB, Napas)</option>
              <option value="VNPAY">VNPay Gateway (Cổng thanh toán quốc tế & QR)</option>
              <option value="STRIPE">Stripe (Dành cho tài khoản doanh nghiệp quốc tế)</option>
              <option value="CUSTOM">Cổng liên kết đối tác riêng</option>
            </select>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-caption font-bold text-text">Hướng dẫn / Cam kết hiển thị cho khách</label>
            <input
              type="text"
              value={config.cardInstructions}
              onChange={(e) => updateConfig({ cardInstructions: e.target.value })}
              className="w-full h-10 px-3 text-xs rounded-xl border border-border bg-surface text-text"
            />
          </div>
        </div>
      )}
    </div>
  )
}

/** 4. Thanh toán tại quầy khi nhận hàng & Ví điện tử */
export function InStoreAndEWalletSection({ config, updateConfig }: SectionProps) {
  return (
    <>
      <div className="p-5 sm:p-6 rounded-2xl border border-border bg-surface shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success-bg text-success">
              <Store size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text">4. Thanh toán tại cửa hàng khi nhận hàng</h3>
              <p className="text-caption text-text-muted">Áp dụng cho khách đến lấy trực tiếp tại shop</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enableInStore}
              onChange={(e) => updateConfig({ enableInStore: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-surface-alt peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
          </label>
        </div>

        {config.enableInStore && (
          <div className="space-y-1 pt-1">
            <label className="text-caption font-bold text-text">Hướng dẫn thanh toán tại quầy</label>
            <input
              type="text"
              value={config.inStoreInstructions}
              onChange={(e) => updateConfig({ inStoreInstructions: e.target.value })}
              className="w-full h-10 px-3 text-xs rounded-xl border border-border bg-surface text-text"
            />
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6 rounded-2xl border border-border bg-surface shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Smartphone size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text">5. Ví điện tử (MoMo / ZaloPay)</h3>
              <p className="text-caption text-text-muted">Nhận tiền qua số điện thoại ví điện tử</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enableEWallet}
              onChange={(e) => updateConfig({ enableEWallet: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-surface-alt peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
          </label>
        </div>

        {config.enableEWallet && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-caption font-bold text-text">Loại ví</label>
              <select
                value={config.eWalletProvider}
                onChange={(e) => updateConfig({ eWalletProvider: e.target.value as EWalletProviderKey })}
                className="w-full h-10 px-3 text-xs rounded-xl border border-border bg-background text-text"
              >
                <option value="MOMO">Ví MoMo</option>
                <option value="ZALOPAY">ZaloPay</option>
                <option value="VNPAY">VNPay Ví</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-caption font-bold text-text">Số điện thoại nhận tiền</label>
              <input
                type="text"
                value={config.eWalletPhone}
                onChange={(e) => updateConfig({ eWalletPhone: e.target.value })}
                placeholder="VD: 0908123456"
                className="w-full h-10 px-3 text-xs rounded-xl border border-border bg-background text-text"
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
