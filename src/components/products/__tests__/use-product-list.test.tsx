import React from "react"
import { describe, expect, it, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { INITIAL_PRODUCT_LIST_URL, useProductList, type ProductListPage } from "../use-product-list"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))

type Row = { id: string; name: string }

function List({ initial }: { initial: ProductListPage<Row> | null }) {
  const { items, total } = useProductList<Row>("", null, null, null, initial)
  if (items === null) return <p>đang tải</p>
  return (
    <ul data-total={total?.count ?? ""}>
      {items.map((r) => (
        <li key={r.id}>{r.name}</li>
      ))}
    </ul>
  )
}

describe("useProductList — trang đầu máy chủ tải sẵn (/san-pham LCP)", () => {
  it("render ngay dữ liệu khởi tạo, không chờ gọi API", () => {
    const html = renderToStaticMarkup(
      <List initial={{ data: [{ id: "a", name: "Bó hoa A" }, { id: "b", name: "Bó hoa B" }], next_cursor: null, total: 2 }} />,
    )
    expect(html).toContain("Bó hoa A")
    expect(html).toContain("Bó hoa B")
    expect(html).toContain('data-total="2"')
    expect(html).not.toContain("đang tải")
  })

  it("không có dữ liệu khởi tạo thì ở trạng thái đang tải như trước", () => {
    expect(renderToStaticMarkup(<List initial={null} />)).toContain("đang tải")
  })

  it("URL trang đầu khớp URL client gọi khi chưa lọc", () => {
    expect(INITIAL_PRODUCT_LIST_URL).toBe("/api/v1/products?limit=100")
  })
})
