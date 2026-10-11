# QA — Pháo đài Cơ Khí v3.1.0

Ngày kiểm tra: 11/10/2026.

## Sửa lỗi phóng lớn và che bản đồ

Đối chiếu trực tiếp ảnh `image(4).png` người dùng gửi. Quy tắc `#battle-canvas` cũ đặt `height:auto` và tỉ lệ 1000:640, có độ ưu tiên cao hơn `.route-stage canvas`; Canvas bị giãn quá khung, cắt mất đường phía dưới và không khớp với lớp nút đặt tháp.

Bản v3.1 đặt Canvas và lớp nút vào cùng vùng `.route-board`, cùng kích thước pixel được tính từ vùng trống theo tỉ lệ 1280:720. CSS mới ưu tiên đúng, giới hạn kích thước theo khung và căn giữa. ResizeObserver theo dõi chính vùng bản đồ; có cập nhật khi resize cửa sổ. Các bảng bản vẽ/wave/địch, nhật ký và bảng nâng cấp nằm ngoài vùng bản đồ, trong các hàng bố cục riêng.

Kiểm tra hồi quy bằng DOM stub: 72 ô trên sáu khu nằm trong bảy khung bản đồ có kích thước 2048×800, 1280×380, 1366×500, 844×188, 390×500, 320×280 và 760×90. Canvas/lớp nút cùng kích thước, giữ đúng tỉ lệ; quy đổi ngược tọa độ chuột khớp mọi ô. Khung 0×0 rồi mở lại 960×540 cũng tính lại đúng. Kiểm tra chọn địch dùng vùng thông tin riêng và trả lại bảng wave khi địch chết. Các kích thước trên là đầu vào đo vùng trống của phép tính, không phải kết quả đo overflow bằng trình duyệt.

## Mẫu gameplay và nội dung giữ nguyên

Tham khảo trực tiếp ZIP `space_product_defense_9_v1_3_complete(1).zip` và ảnh `image(3).png` người dùng gửi. Bộ chiến đấu được chuyển từ nguồn mẫu: các đường đi, vị trí tháp, robot chặn địch, đạn bay, Tesla nhiều mục tiêu, ba cấp tháp, mười nhánh nâng cấp và sáu kỹ năng Boss. Bố cục mới có HUD trên, Canvas giữa, bảng đợt địch, thanh tháp dưới và bảng tháp được chọn.

Giữ nguyên cả sáu đường đi và 72 vị trí đặt tháp. Thay hình, tên và bối cảnh thành cơ khí. Bộ câu hỏi phương trình tích của file mẫu không được đưa vào bản này.

Kiểm tra SHA-256 của `data/questions.json`, `js/math-engine.js`, `js/triangle.js`, `js/question-engine.js`, `js/validator.js`: 5/5 tệp trùng bản TRIG EXPEDITION gốc. Giữ 228 câu trong ngân hàng và 67 câu mỗi hành trình; mọi dữ kiện, góc xét, hình, đáp án, lời giải và gợi ý được giữ. PIN giáo viên: `05067379`.

## 665/665 kiểm tra logic đạt

Chạy `npm test`:

- **613/613 toán, hình học, chọn câu, điểm và lưu cơ bản** đạt. 228/228 câu qua kiểm định, không có câu bị loại trong ngân hàng giao. Báo cáo ở `tests/automated-results.json`.
- **52/52 chiến đấu, controller và hồi quy kích thước** đạt. Báo cáo ở `tests/defense-results.json`.

Bộ chiến đấu kiểm tra: sáu đường riêng; 12 ô/khu; khoảng cách 72 ô tới đường; căn cứ không tự bắn; mở khóa tháp; xây/nâng/bán đúng tiền; cả mười nhánh cấp 3 thay đổi chỉ số thật; từ chối khi thiếu tiền; quy đổi tọa độ kéo thả trên Canvas có khoảng trống hai bên; robot gác sinh ra, chặn và trao đổi sát thương; bán xưởng giải phóng địch; làm chậm thật; giáp và khiên; Tesla nhiều mục tiêu; đạn bay; diệt địch cấp thưởng một lần; sáu kỹ năng Boss; Boss vượt tuyến làm thua; sửa căn cứ và thử lại; lưu/khôi phục tham chiếu đạn vào đúng địch/tháp đang sống.

Mô phỏng đủ 67 wave trong sáu khu bằng tiền ban đầu, phần thưởng giải bài và diệt địch theo quy tắc game; không cấp thêm tiền ngoài quy tắc. Có chiến lược hoàn thành mọi khu và Boss mà không cần sửa trận thua. Đã tăng thưởng bản vẽ ở khu khó và ưu tiên xuyên giáp/sửa HP trong chiến lược kiểm tra. Đây là bằng chứng một chiến lược có thể hoàn thành, không phải đo độ khó với học sinh.

Controller dùng DOM stub kiểm tra: chưa giải đúng không bắt đầu wave; điểm/năng lượng bài đúng không cộng lại; mở toán/tạm dừng làm chiến đấu dừng ở ×1/×2/×3; lưu lỗi/gợi ý/nháp/tốc độ/trận; preview không ghi đè tiến trình; hoàn thành không tạo lại ô Continue; đi đủ 67 câu của sáu nhóm. DOM stub không phải trình duyệt thật.

## Mã và hình

Mọi JavaScript qua kiểm tra cú pháp. Các tài nguyên HTML/CSS và toàn bộ SVG chiến trường tồn tại cục bộ; không cần CDN hay thư viện runtime tải qua mạng.

Chạy bộ vẽ Canvas thật của game bằng thư viện Canvas trong môi trường kiểm tra, nạp và render các SVG cục bộ, xuất và xem sáu chiến trường. Đã xem riêng khu 2 để đối chiếu ảnh mẫu: đường ngoằn ngoèo, 12 ô dấu + và căn cứ cuối tuyến đúng vị trí mẫu. Đây là kiểm tra bộ vẽ Canvas, không phải ảnh chụp toàn bộ UI trình duyệt.

## Phạm vi chưa kiểm tra

Phiên này không có công cụ điều khiển trình duyệt phù hợp, nên chưa chạy luồng UI trên trình duyệt thật; chưa đo overflow bằng browser, kéo thả/cảm ứng trên thiết bị vật lý, fullscreen hoặc nghe nhạc trên loa. Không sử dụng kết quả browser QA của bản leo núi hay file mẫu để tuyên bố bản v3.1 đã qua browser QA. Lỗi được xác định từ ảnh thực tế và độ ưu tiên CSS; phép co và tọa độ đã kiểm tra riêng bằng DOM stub.

CSS có bố cục desktop, điện thoại ngang/dọc và thanh tháp cuộn ngang. Bộ logic đã kiểm tra tọa độ Canvas có letterbox và cách chọn tháp rồi chọn ô; tương tác UI, âm thanh và bố cục thực tế cần thử trên thiết bị dạy học. Checklist ở `tests/manual-checklist.md` ghi rõ các mục chưa xác nhận. Thời lượng và độ khó chưa được đo trong lớp học.
