// Nhóm bán hàng & marketing — chăm sóc khách (+ hộp tạo nhóm), in ấn, báo giá (khách / đối tác),
// đơn hàng, thẻ tư vấn bán hàng, nội dung, tin nhắn, trang chủ. Dùng khi sửa component dùng chung của các màn này.
export async function run({ open, shot }) {
  await shot("cham-soc", (p) => open(p, "/cham-soc"))
  await shot("in-an", (p) => open(p, "/in-an"))
  await shot("bao-gia", (p) => open(p, "/bao-gia"))
  await shot("don-hang", (p) => open(p, "/don-hang"))
  await shot("the-tu-van", (p) => open(p, "/tai-anh?tab=m01c"))
  await shot("noi-dung", (p) => open(p, "/noi-dung"))
  await shot("tin-nhan", (p) => open(p, "/tin-nhan"))
  await shot("trang-chu", (p) => open(p, "/"))
}
