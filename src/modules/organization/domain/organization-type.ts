/**
 * ADR-012 D-T11 (D-55): `FLOWER_NETWORK` và `CHAIN` chỉ khác nhãn → mọi tổ chức chuỗi lưu là `CHAIN`.
 * T-8a: mọi đường GHI loại tổ chức đi qua `toStoredOrganizationType`; đường đọc còn chấp nhận `FLOWER_NETWORK`
 * cho tới T-8b (bỏ giá trị enum). Gói dịch vụ `FLOWER_NETWORK` là khái niệm khác, không đổi.
 */
export function toStoredOrganizationType<T extends string>(type: T): Exclude<T, "FLOWER_NETWORK"> | "CHAIN" {
  return (type === "FLOWER_NETWORK" ? "CHAIN" : type) as Exclude<T, "FLOWER_NETWORK"> | "CHAIN"
}
