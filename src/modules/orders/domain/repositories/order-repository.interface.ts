/**
 * Order Repository Port (Domain Interface).
 * Pure TypeScript — No Prisma or database imports.
 * Belongs to Domain Layer of M10 — Orders (Store OS).
 */

import type {
  CreateOrderInput,
  UpdateOrderInput,
  OrderFilter,
  OrderRecord,
  OrderAssignmentRecord,
  OrderEventRecord,
  OrderEventAxis,
} from "../order-types"

export interface IOrderRepository {
  /** Đếm số đơn hàng tạo trong ngày của tenant để sinh mã đơn (Code sequence). */
  countTodayOrders(organizationId: string, date?: Date): Promise<number>

  /** Tạo đơn hàng mới kèm items và event khởi tạo (transactional). */
  create(
    organizationId: string,
    code: string,
    input: CreateOrderInput,
    totalVnd: number,
    createdBy: string
  ): Promise<OrderRecord>

  /** Tìm đơn hàng theo ID nội bộ, có kiểm soát cách ly theo tenant. */
  findById(organizationId: string, id: string): Promise<OrderRecord | null>

  /** Tìm đơn hàng theo mã đơn hiển thị (code), có kiểm soát cách ly theo tenant. */
  findByCode(organizationId: string, code: string): Promise<OrderRecord | null>

  /** Danh sách đơn hàng theo bộ lọc phân trang. */
  list(organizationId: string, filter?: OrderFilter): Promise<{ orders: OrderRecord[]; total: number }>

  /** Cập nhật thông tin / trạng thái đơn hàng. */
  update(
    organizationId: string,
    id: string,
    input: UpdateOrderInput
  ): Promise<OrderRecord>

  /** Phân công nhân sự thực hiện đơn (thợ chế tác, thợ may, đầu bếp...). */
  createAssignment(
    organizationId: string,
    orderId: string,
    assigneeId: string,
    assignedBy: string,
    difficulty?: string
  ): Promise<OrderAssignmentRecord>

  /** Ghi nhận sự kiện thay đổi trên các trục (order, production, delivery). */
  recordEvent(
    organizationId: string,
    orderId: string,
    axis: OrderEventAxis,
    toValue: string,
    actorId?: string,
    fromValue?: string,
    reason?: string
  ): Promise<OrderEventRecord>
}
