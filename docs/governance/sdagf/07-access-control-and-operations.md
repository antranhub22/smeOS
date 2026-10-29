# 07. Access Control & Allowed Operations

## 1. Mô hình kiểm soát

Dùng kết hợp:
- **RBAC:** quyền theo vai trò.
- **ABAC/policy checks:** thuộc tính actor, tenant, asset classification, purpose, lifecycle state và context.
- **Tenant isolation:** mọi truy cập tenant-scoped phải kiểm tra tenant ở backend.
- **Service identity:** module/service dùng danh tính riêng, không chia sẻ credential người dùng.

Không nhất thiết triển khai một policy engine riêng ngay lập tức. Cần đảm bảo các quy tắc được định nghĩa nhất quán và không phân tán tùy tiện.

## 2. Quyết định authorization

Mỗi quyết định tối thiểu xét:
- actor/service identity
- action
- asset ID
- tenant context
- asset classification
- lifecycle state
- business relationship/ownership
- declared purpose
- relevant approval/consent
- policy version

Nếu context bắt buộc bị thiếu hoặc không đáng tin cậy, mặc định deny với thao tác nhạy cảm.

## 3. Các thao tác chuẩn

`discover`, `read_metadata`, `read_content`, `create`, `upload`, `transform`, `derive`, `replace_version`, `approve`, `publish`, `share`, `download`, `export`, `archive`, `restore`, `place_legal_hold`, `delete`, `purge`.

Mỗi asset class phải khai báo thao tác được phép theo trạng thái. Không phải mọi vai trò đều có mọi thao tác.

## 4. Ma trận mặc định tham khảo

| Trạng thái | Read | Transform | Publish/share | Replace | Delete |
|---|---|---|---|---|---|
| Quarantined | Chỉ security/processing có thẩm quyền | Sau validation | Không | Theo quy trình | Theo policy |
| Draft | Owner/module được cấp quyền | Có thể | Không mặc định | Tạo version mới | Có thể nếu không bị hold |
| In review | Reviewer và owner phù hợp | Theo quy trình | Không | Không ghi đè; tạo version mới | Hạn chế |
| Approved | Theo quyền | Tạo derived version | Chỉ role được phép | Tạo version mới | Theo retention/policy |
| Published | Theo access policy | Không sửa nội dung đã phát hành; tạo version mới | Có điều kiện | Tạo version mới | Theo quy trình thu hồi/retention |
| Archived | Hạn chế | Không mặc định | Không mặc định | Không | Theo policy |
| Pending deletion | Hạn chế | Không | Không | Không | Tiếp tục workflow |
| Deleted/purged | Không đọc payload bình thường | Không | Không | Không | Không |

Ma trận chỉ là mặc định tham chiếu; từng class cần xác định ngoại lệ.

## 5. Quy tắc quan trọng

- Authorization phải được thực thi server-side.
- Không tin `tenant_id`, `owner_id`, `storage_key` do client gửi nếu chưa xác minh.
- Không cho phép module truy cập trực tiếp bucket/path của module khác nếu vượt qua policy.
- Dùng presigned/signed URLs có thời hạn khi phù hợp; giới hạn scope và thời gian.
- Không cho phép thay đổi asset owner/tenant bằng thao tác update thông thường.
- Mọi thao tác export/share/publication phải kiểm tra policy riêng.
- Các thao tác bulk phải có limit, authorization, audit và khả năng dry-run.
- Privileged access cần hạn chế, giám sát và rà soát định kỳ.

## 6. Tenant isolation tests

Bắt buộc kiểm tra:
- Tenant A không đọc được asset metadata/payload của Tenant B.
- Không đoán được ID là không đủ; backend vẫn phải kiểm tra tenant.
- Search/list/count/export không rò rỉ dữ liệu cross-tenant.
- Signed URL không cấp quyền vượt quá asset và thời hạn.
- Job background giữ đúng tenant context.
- Cache keys và storage references không gây cross-tenant collision/leak.
- Admin/platform support access có quy trình và audit rõ.
