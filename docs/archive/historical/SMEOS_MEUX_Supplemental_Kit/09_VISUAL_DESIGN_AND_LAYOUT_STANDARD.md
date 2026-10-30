# 09 — SMEOS Visual Design & Layout Standard (VDLS)

**Trạng thái:** Tiêu chuẩn bổ sung đề xuất, cần được tích hợp vào source of truth UX hiện hành sau khi audit.  
**Mục tiêu:** Chuyển định hướng “tối giản, rõ ràng, ít nhiễu” thành quy tắc bố cục và thị giác có thể thiết kế, review và kiểm thử.

## 1. Định hướng thị giác

SMEOS hướng tới phong cách **Clean SaaS Dashboard**: giao diện nghiệp vụ gọn, có cấu trúc ổn định, ưu tiên nhiệm vụ hiện tại và giảm các yếu tố trang trí không mang giá trị thao tác.

Ảnh SePay do người dùng cung cấp là **tham chiếu về bố cục và phân cấp thị giác**, không phải mẫu để sao chép pixel-for-pixel hoặc sao chép thương hiệu.

### Đặc điểm mục tiêu
- **Persistent Navigation:** điều hướng cấp hệ thống nhất quán, thường ở bên trái trên desktop.
- **Stable Top Bar:** tiêu đề trang và các điều khiển cấp hệ thống ở vị trí ổn định.
- **Focused Workspace:** vùng nội dung chính dành phần lớn diện tích cho nhiệm vụ hiện tại.
- **Restrained Containers:** dùng card, border, shadow và nền phân tách có chọn lọc.
- **Concise Copy:** tiêu đề và mô tả ngắn, cụ thể, hỗ trợ thao tác.
- **Clear Primary Action:** hành động chính dễ nhận biết khi tác vụ có mục tiêu rõ.
- **Quiet Surface Palette:** nền và bề mặt trung tính; màu nhấn dành cho hành động hoặc trạng thái có ý nghĩa.
- **Consistent Rhythm:** spacing, typography và chiều rộng nội dung dùng hệ thống chung.

Đây là định hướng nội bộ SMEOS, không phải một framework thương mại hoặc tiêu chuẩn quốc tế độc lập.

## 2. Quy tắc bố cục tổng thể

### 2.1 Shell ứng dụng
- **MUST:** Các module có cùng cấp điều hướng phải sử dụng shell chung nếu kiến trúc hiện tại hỗ trợ: navigation, top bar và workspace.
- **MUST:** Không tạo thanh tiêu đề hoặc điều hướng riêng lẻ cho một module nếu không có lý do nghiệp vụ được ghi nhận.
- **SHOULD:** Trên desktop, giữ vị trí điều hướng ổn định để người dùng không phải học lại giữa các module.
- **SHOULD:** Cho phép thu gọn navigation khi phù hợp với hệ thống hiện tại; trạng thái thu gọn phải dễ hiểu và không làm mất khả năng tìm chức năng.
- **MUST:** Trên màn hình nhỏ, chuyển shell sang bố cục phù hợp với thiết bị; không ép giữ sidebar desktop nếu làm hẹp vùng làm việc.

### 2.2 Page header
- **MUST:** Header trang nêu rõ tên tác vụ hoặc đối tượng.
- **SHOULD:** Chỉ có một dòng mô tả ngắn khi nó giúp người dùng hiểu mục đích hoặc bước tiếp theo.
- **SHOULD:** Đặt hành động cấp trang ở vị trí nhất quán.
- **MUST NOT:** Dùng một khối giới thiệu lớn cho công cụ nội bộ nếu người dùng đã ở trong ngữ cảnh chức năng.

### 2.3 Workspace
- **MUST:** Vùng làm việc chính phải có diện tích ưu tiên so với trang trí và phần giới thiệu.
- **SHOULD:** Chọn chiều rộng phù hợp loại tác vụ: biểu mẫu/thiết lập có thể hẹp hơn; bảng dữ liệu hoặc trình biên tập có thể rộng hơn.
- **MUST:** Tránh các lớp container lồng nhau nếu chúng không thể hiện ranh giới thông tin hoặc tương tác thực sự.
- **SHOULD:** Ưu tiên phân nhóm bằng khoảng cách, tiêu đề và căn chỉnh trước khi thêm border hoặc background.

### 2.4 Hành động chính
- **MUST:** Với tác vụ có kết quả chính, cung cấp một hành động chính dễ nhận biết.
- **SHOULD:** Giữ hành động chính gần nội dung cần thiết để quyết định; với biểu mẫu dài, có thể dùng action bar cố định nếu không che nội dung hoặc bàn phím.
- **MUST NOT:** Làm nhiều nút ngang cấp cùng nổi bật nếu chúng có vai trò khác nhau.
- **MUST:** Hành động nguy hiểm/destructive phải được phân biệt theo tiêu chuẩn hành động hiện có và có bảo vệ phù hợp.

## 3. Quy tắc sử dụng bề mặt và trang trí

- **MUST:** Card chỉ dùng khi nhóm nội dung là đơn vị độc lập, có thể chọn, có hành động hoặc cần được phân tách rõ.
- **SHOULD:** Dùng danh sách, hàng dữ liệu, fieldset hoặc khoảng cách thay cho card nếu đủ truyền đạt cấu trúc.
- **MUST NOT:** Đặt card bên trong card theo thói quen mà không có ý nghĩa cấu trúc.
- **SHOULD:** Giảm border và shadow dư thừa; không dùng cả nền khác màu, border đậm và shadow cho mọi thành phần.
- **MUST:** Màu sắc có ý nghĩa hệ thống và tuân theo design tokens hiện hành.
- **MUST NOT:** Tạo một bảng màu riêng cho module nếu token hệ thống đáp ứng.
- **MUST:** Giữ đủ tương phản, focus visibility và trạng thái tương tác.

## 4. Mẫu bố cục theo loại trang (Page Archetypes)

Không áp một bố cục duy nhất cho mọi trang. Chọn archetype phù hợp với nhiệm vụ.

### A. Dashboard / Overview
- Hiển thị trạng thái và chỉ số quan trọng trước.
- Chỉ dùng biểu đồ/card khi chúng giúp phát hiện xu hướng hoặc hành động.
- Không biến dashboard thành một trang tổng hợp mọi chỉ số.
- Có liên kết rõ tới tác vụ tiếp theo khi cần.

### B. Data List / Search
- Header gọn.
- Tìm kiếm, bộ lọc và sắp xếp gần danh sách.
- Bảng/danh sách là vùng nội dung chính.
- Hành động hàng loạt chỉ xuất hiện hoặc được kích hoạt khi có lựa chọn phù hợp.
- Empty state phải giải thích cách bắt đầu hoặc điều chỉnh bộ lọc.

### C. Detail / Record
- Đặt tên và trạng thái của đối tượng ở đầu.
- Nhóm dữ liệu theo chủ đề nghiệp vụ.
- Hành động chính và hành động nguy hiểm được phân biệt rõ.
- Thông tin phụ có thể nằm trong tab/section nếu người dùng không cần so sánh đồng thời.

### D. Form / Configuration
- Nhóm trường theo quyết định hoặc nhiệm vụ.
- Dùng label rõ; helper text chỉ khi cần.
- Hiển thị lỗi cạnh trường liên quan.
- Chia bước chỉ khi có thứ tự nghiệp vụ hoặc việc chia bước thực sự giảm độ phức tạp.
- Không dùng placeholder thay label.

### E. Content Creation / Builder
- Ưu tiên đầu vào chính và vùng xem trước.
- Cấu hình ít dùng nằm trong khu vực tùy chỉnh/advanced có thể mở.
- Cho thấy trạng thái đã chọn và số lượng đầu vào.
- Hành động tạo/xuất bản rõ ràng.
- Nếu có chế độ AI và thủ công, chỉ hiển thị cấu hình liên quan đến chế độ đang chọn; bảo toàn dữ liệu khi chuyển chế độ.

### F. Settings / Integration
- Trình bày trạng thái kết nối và hành động tiếp theo trước.
- Cấu hình chia thành nhóm có tên rõ.
- Hướng dẫn dài đặt trong vùng trợ giúp hoặc liên kết tài liệu.
- Không hiển thị tất cả cấu hình nâng cao nếu không cần để hoàn tất tác vụ cơ bản.

## 5. Copywriting UI

- Dùng động từ cụ thể cho hành động: “Tạo”, “Lưu”, “Kết nối”, “Tải lên”.
- Dùng tiêu đề mô tả tác vụ, tránh slogan quảng bá trong màn hình nghiệp vụ.
- Mỗi dòng mô tả phải bổ sung thông tin chưa có trong tiêu đề/nhãn.
- Hướng dẫn dài chuyển sang trợ giúp theo ngữ cảnh, tài liệu hoặc disclosure phù hợp.
- Không xóa thông tin về chi phí, quyền, rủi ro, dữ liệu bị ảnh hưởng hoặc điều kiện quan trọng chỉ để rút ngắn giao diện.

## 6. Tham chiếu hình ảnh và đánh giá tương đồng

Khi người dùng cung cấp ảnh tham chiếu:
1. Xác định thuộc tính cần học: bố cục, phân cấp, mật độ, điều hướng, bề mặt, typography, vị trí hành động.
2. Phân biệt thuộc tính hệ thống có thể tái sử dụng với chi tiết riêng của sản phẩm tham chiếu.
3. Không sao chép logo, thương hiệu, nội dung độc quyền hoặc pixel layout nếu không có yêu cầu và quyền phù hợp.
4. Chuyển các quan sát thành quy tắc thiết kế có thể áp dụng xuyên module.
5. So sánh màn hình trước/sau ở cùng viewport và trạng thái tương đương.
6. Ghi nhận điểm đạt, chưa đạt và các khác biệt có chủ đích.

## 7. Visual review checklist

- [ ] Shell điều hướng nhất quán với các module cùng cấp.
- [ ] Tiêu đề trang và tác vụ chính dễ nhận biết.
- [ ] Vùng làm việc chính chiếm ưu tiên hợp lý.
- [ ] Card, border, shadow và nền có mục đích rõ.
- [ ] Không có container lồng nhau dư thừa.
- [ ] Mô tả ngắn gọn, không lặp nhãn hoặc tiêu đề.
- [ ] Hành động chính dễ tìm; hành động phụ không cạnh tranh không cần thiết.
- [ ] Bố cục phù hợp archetype của trang.
- [ ] Responsive và accessibility được kiểm tra.
- [ ] Các chức năng, trạng thái và thông tin nghiệp vụ vẫn đầy đủ.

## 8. Không được coi đây là quy tắc cứng khi thiếu ngữ cảnh

Không bắt buộc mọi trang phải có sidebar nhìn thấy mọi lúc, một nút duy nhất, nền trắng hoặc không có card. Đây là các lựa chọn có điều kiện. Quyết định cuối cùng phải dựa trên shell hiện tại, loại tác vụ, responsive, accessibility và bằng chứng sử dụng.
