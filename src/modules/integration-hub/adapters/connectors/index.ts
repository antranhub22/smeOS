/** Bảng tra đầu nối đã cài đặt. Đầu nối trong danh mục mà chưa có ở đây thì chưa kết nối được. */

import type { Connector } from "../connector-contract"
import { testEchoConnector } from "./test-echo-connector"

const CONNECTORS: ReadonlyMap<string, Connector> = new Map([[testEchoConnector.key, testEchoConnector]])

export function getConnector(key: string): Connector | null {
  return CONNECTORS.get(key) ?? null
}
