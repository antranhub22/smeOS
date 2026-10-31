/**
 * Google Service Account Auth Provider
 * Tạo GoogleAuth client từ credentials lưu trong env hoặc file local.
 *
 * Priority:
 *  1. GOOGLE_SERVICE_ACCOUNT_JSON (env string — dùng trên production/Render/Vercel)
 *  2. GOOGLE_SERVICE_ACCOUNT_KEY_PATH (đường dẫn file — dùng local dev)
 *  3. secrets/google-service-account.json (mặc định local dev nếu không set path)
 */

import path from "path"
import fs from "fs"
import { google } from "googleapis"

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets.readonly",
  "https://www.googleapis.com/auth/drive.readonly",
]

export interface GoogleServiceAccountCredentials {
  type: string
  project_id: string
  private_key_id: string
  private_key: string
  client_email: string
  client_id: string
  auth_uri: string
  token_uri: string
}

function loadCredentials(): GoogleServiceAccountCredentials {
  // Option 1: inline JSON string from env (production)
  const inlineJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (inlineJson) {
    try {
      return JSON.parse(inlineJson) as GoogleServiceAccountCredentials
    } catch {
      throw new Error(
        "GOOGLE_SERVICE_ACCOUNT_JSON không hợp lệ — kiểm tra JSON có đúng định dạng không."
      )
    }
  }

  // Option 2: file path from env
  const keyPath =
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH ??
    path.resolve(process.cwd(), "secrets/google-service-account.json")

  if (!fs.existsSync(keyPath)) {
    throw new Error(
      `Không tìm thấy Google Service Account credentials.\n` +
        `Đặt env GOOGLE_SERVICE_ACCOUNT_JSON (production) hoặc\n` +
        `tải file JSON key về ${keyPath} (local dev).\n` +
        `Xem hướng dẫn tại secrets/README.md`
    )
  }

  try {
    const raw = fs.readFileSync(keyPath, "utf-8")
    return JSON.parse(raw) as GoogleServiceAccountCredentials
  } catch {
    throw new Error(`Không đọc được file Service Account key tại: ${keyPath}`)
  }
}

export function getGoogleSheetsAuth() {
  const credentials = loadCredentials()
  return new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  })
}
