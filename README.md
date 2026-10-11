# ⚙ Pháo đài Cơ Khí — v3.1.0

## Sửa giao diện v3.1

Bản đồ được co đồng nhất theo tỉ lệ 1280:720 để hiển thị toàn bộ đường đi, căn cứ và 12 ô xây tháp trong vùng chiến trường. Đã bỏ tác động của kích thước Canvas cũ làm phóng lớn và cắt mất phần dưới. Vị trí bấm/kéo thả luôn co cùng hình vẽ.

Thanh bản vẽ, nút wave, bảng địch và nhật ký nằm ở các hàng riêng ngoài chiến trường. Bảng nâng cấp nằm trong thanh dưới, không nổi lên che bản đồ. Giao diện tự tính lại khi đổi kích thước cửa sổ, zoom hoặc xoay màn hình. Câu hỏi, luật chơi, PIN giáo viên và khóa lưu tiến trình v3 được giữ nguyên.

Bản thủ thành được sửa theo **ảnh mẫu và folder Space Product Defense 9 v1.3 bạn gửi**: địch đi theo đường đến căn cứ cuối tuyến, kéo tháp từ thanh vũ khí phía dưới vào các ô **+**, robot gác chặn địch, nâng tháp và chọn nhánh. Chủ đề đổi thành nhà máy, bánh răng, lò hơi và robot cơ khí.

**Bộ câu hỏi tỉ số lượng giác của game đang chỉnh được giữ nguyên.** File thủ thành tham khảo được dùng cho cơ chế chiến đấu và bố cục; không đưa bộ câu hỏi phương trình tích của file mẫu vào game này.

## Mở game

1. Giải nén **toàn bộ ZIP**.
2. Vào folder `Phao-Dai-Co-Khi`.
3. Mở `index.html`. Trên Windows cũng có thể bấm `CHAY_GAME.bat`.

Game chạy cục bộ, không cần cài thư viện, tài khoản, backend hay kết nối Internet. Nếu trình duyệt hạn chế mở tệp, có thể chạy `node tools/serve.cjs` rồi mở địa chỉ mà chương trình in ra (mặc định `http://localhost:5173`).

## Cách chơi

- Chọn một khu vực. Ban đầu căn cứ có **20 HP**, kho có **120 năng lượng**.
- **Kéo** tháp từ thanh vũ khí đến ô **+**. Ô hợp lệ hiện xanh. Hoặc **bấm chọn tháp rồi bấm ô trống**; dùng Tab/Enter cũng được.
- Bấm **GIẢI BẢN VẼ**, làm câu hỏi, đọc lời giải và trở lại trận. Giải đúng mới được bắt đầu wave. Mở lại câu đã đúng không cấp lại điểm hoặc năng lượng.
- Bấm **BẮT ĐẦU WAVE**. Tháp tự bắn, robot gác chặn địch trên đường. Bảng **SẮP TỚI** báo loại đợt, số địch và đội hình. Chạm địch để xem HP, giáp và kỹ năng Boss.
- Chạm tháp đã đặt để xem tầm bắn và nâng cấp. **Cấp 2** nâng chỉ số và đổi hình; **cấp 3** chọn một trong hai nhánh. Bán nhận lại **75% tổng năng lượng đã đầu tư**. Có thể xây, nâng và bán trong trận.
- Diệt mỗi địch nhận **15 năng lượng**; hết wave nhận thêm **25**. Bản vẽ đúng cấp năng lượng theo khu và chuỗi đúng; khu 5–6 được tăng phần thưởng để phù hợp độ khó. Câu đúng cũng tạo tăng tốc bắn tạm thời như cơ chế mẫu.
- Sau khi chặn wave, bấm **BẢN VẼ TIẾP THEO**. Số wave giữ bằng số câu mỗi lượt của bản gốc để không bỏ câu nào.
- **1× → 2× → 3×** đổi tốc độ chiến đấu. Khi mở bản vẽ, tạm dừng hoặc chuyển sang tab khác, chiến đấu dừng.
- Giữa các đợt, khi chưa chọn tháp, bảng chỉ huy có nút **SỬA +5 HP · 45 năng lượng**. Nếu căn cứ hỏng, sửa và thử lại wave đang chơi; giữ bài đã giải, điểm toán và tháp. Năng lượng diệt địch của wave thất bại được trừ khỏi số dư.

Căn cứ được bảo vệ bằng các tháp dọc tuyến. Boss cuối mỗi khu gây 20 sát thương nếu vượt qua, nên cần chặn trước căn cứ.

## Vũ khí

| Tháp | Giá | Mở khi | Cơ chế | Hai nhánh cấp 3 |
| --- | ---: | --- | --- | --- |
| Xưởng Robot Gác | 40 | Ban đầu | Đưa 1/2/3 robot ra đường theo cấp; mỗi robot chặn một địch và trao đổi sát thương | Robot Khiên / Robot Xung Kích |
| Pháo Liên Thanh | 55 | Ban đầu | Đạn bay tới mục tiêu, tốc độ cao | Liên Thanh Siêu Tốc / Đạn Xuyên Giáp |
| Trạm Hơi Lạnh | 75 | Qua khu 1 | Đạn làm chậm địch | Bão Hơi Lạnh / Tia Đóng Băng |
| Pháo Áp Suất | 80 | Qua khu 2 | Sát thương lớn vào một mục tiêu | Áp Suất Cực Đại / Pháo Tầm Xa |
| Tháp Tesla | 105 | Qua khu 3 | Điện nối nhiều địch trong tầm | Tesla Chuỗi / Tesla Quá Tải |

Giá nâng cấp cấp 1 → 2 là 75% giá xây, cấp 2 → 3 là 110%, làm tròn. Tháp mới mở có thể dùng khi quay lại các khu trước. Trong chơi thử giáo viên, tất cả tháp được mở.

## Sáu khu

Giữ đúng **6 đường đi và 72 vị trí đặt tháp** từ file tham khảo: 12 ô/map. Các ô nằm ngoài đường và trong tầm bắn hữu dụng. Mỗi khu có tranh nhà máy riêng, hai loại robot thường và một robot chỉ huy.

| Khu | Câu/wave mỗi lượt | Ngân hàng câu | Robot chỉ huy và kỹ năng |
| --- | ---: | ---: | --- |
| Xưởng Đúc | 10 | 30 | Đốc Công Sắt: quá tải động cơ, tăng tốc và sát thương |
| Tháp Đồng Hồ | 10 | 40 | Chúa Tể Bánh Răng: vượt một đoạn đường ray |
| Mạng Đường Ống | 10 | 30 | Titan Lò Hơi: tái tạo lá chắn |
| Đường Ray Thép | 12 | 36 | Chỉ Huy Đường Ray: hồi máu |
| Xưởng Trên Không | 10 | 32 | Bạo Chúa Tuabin: gọi robot hộ vệ |
| Thành Trì Titan | 15 | 60 | Titan Bánh Răng: dựng khiên, tăng tốc, gọi cận vệ |
| **Tổng** | **67** | **228** | |

Các wave thường luân phiên trinh sát, tốc kích và thiết giáp; wave cuối có Boss. Thành Trì Titan giữ đủ năm nhóm kỹ năng toán gốc, ba câu/nhóm.

## Câu hỏi và giáo viên

Ngân hàng `data/questions.json` và bốn mô-đun `math-engine.js`, `triangle.js`, `question-engine.js`, `validator.js` **trùng từng byte với bản gốc**. Giữ ID, dữ kiện, góc xét, tọa độ hình, đáp án, lời giải, gợi ý, cơ chế tương tác và cách chọn câu mỗi lượt. Phạm vi: Bài 11, SGK Toán 9 Kết nối tri thức tập 1, trang in 66–70.

Giữ tương tác nhận biết cạnh, kéo thả tỉ số, nhập phân số/căn, ghép giá trị góc đặc biệt và nối góc phụ. Vì giữ nguyên câu hỏi, một số đề vẫn nhắc cổng, cầu hoặc tinh thể; trong chủ đề mới chúng được dùng như các bản vẽ kỹ thuật. Map 4 vẫn có 12 giá trị đặc biệt với ba biến thể, không phải 36 giá trị khác nhau.

Chế độ giáo viên ở menu, nút mũ tốt nghiệp. **Pass: `05067379`**.

Giáo viên xem toàn bộ câu hỏi/đáp án/lời giải, tìm câu, xem kiểm định và thông tin hình học, chơi thử từng khu/Boss, mở khóa tất cả hoặc xóa save sau xác nhận. Chơi thử không ghi điểm, sao, thành tích hay ghi đè trận thật. Đổi pass tại `TEACHER_PASSWORD` trong `js/config.js`, giữ dạng chuỗi để không mất số 0 đầu.

## Điểm và lưu

Giữ cách tính điểm toán, chuỗi đúng, accuracy và sao của bản gốc. Diệt robot chỉ cấp tài nguyên chiến đấu, không tăng điểm toán hoặc accuracy. Hoàn thành khu: một sao; accuracy ≥75%: hai sao; accuracy ≥90% và chuỗi tốt nhất ≥4: ba sao. Chơi lại giữ kỷ lục.

Lưu bài hiện tại, lỗi, gợi ý, nháp, tốc độ, HP căn cứ, năng lượng, tháp/nhánh, robot gác, địch và đạn đang bay. Mở lại **cùng địa chỉ trên cùng trình duyệt** rồi chọn TIẾP TỤC. Bản v3 dùng khóa lưu `mechanical-fortress-v3`; trận cũ của cơ chế lõi giữa màn hình không được tiếp tục bằng cơ chế đường đi mới. Reset yêu cầu xác nhận. Nếu localStorage bị chặn, game dùng bộ nhớ phiên và thông báo.

Nhạc và hiệu ứng được tạo bằng Web Audio, có tắt/bật và thanh chỉnh âm lượng trong Cài đặt. Âm thanh cần thao tác người chơi để khởi động. Trên điện thoại, màn hình ngang cho chiến trường lớn hơn; thanh vũ khí có thể cuộn ngang khi màn hình hẹp.

## Folder

| Tệp/folder | Nội dung |
| --- | --- |
| `index.html`, `CHAY_GAME.bat` | Mở game |
| `css/route.css` | HUD, chiến trường và thanh tháp theo bố cục mẫu |
| `css/fortress.css` | Chủ đề cơ khí, menu, bản đồ, cửa sổ toán |
| `css/main.css`, `game.css`, `responsive.css` | Điều khiển chung và tương tác toán |
| `js/route-data.js` | Đường đi, 72 ô, vũ khí, nhánh, robot và kỹ năng Boss |
| `js/defense-engine.js` | Cơ chế từ mẫu, robot gác, đạn, giáp, khiên, sinh địch, snapshot |
| `js/defense-renderer.js` | Gắn Canvas với bộ vẽ chiến trường |
| `js/game.js`, `app.js` | Kết nối câu hỏi với wave, UI, lưu và kết quả |
| `js/maps`, các engine toán, `teacher.js` | Câu hỏi và giáo viên |
| `assets/images` | SVG cơ khí cục bộ, tháp ba cấp, robot, Boss, sáu nền |
| `data` | Ngân hàng câu và baseline SHA-256 |
| `tests` | Kiểm tra toán, chiến đấu/controller, kết quả và checklist |
| `tools` | Máy chủ cục bộ và xuất ngân hàng |

Kiểm tra mã bằng `npm test` (không cần cài dependency). Xem `QA_REPORT.md` để biết phạm vi kiểm tra.
