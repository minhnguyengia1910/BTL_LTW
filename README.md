# ✒️ MựcXanh — Website quản lý và chia sẻ bài viết

MựcXanh giúp người dùng đọc, tìm kiếm, viết và quản lý bài viết. Dự án dùng React cho giao diện, Flask cho API và MongoDB để lưu dữ liệu.

## Tiến độ đối chiếu với mã nguồn

Rà soát ngày **03/11/2026**, trên nhánh `master`, commit [`090a879`](https://github.com/minhnguyengia1910/BTL_LTW/commit/090a879bdd48fde685fc0daf534690733d52abe0).

**Các nhóm chức năng đã mô tả trong README đều có mã triển khai tương ứng.** Tuy nhiên, chưa thể kết luận đã hoàn tất kiểm thử hoặc sẵn sàng triển khai: hướng dẫn cũ tham chiếu file `.env.example` không tồn tại; repository chưa có bộ kiểm thử tự động hay workflow CI. Bảng dưới ghi nhận việc triển khai trong source code, không phải kết quả chạy end-to-end.

| Hạng mục | Kết quả đối chiếu | Mã nguồn chính |
|---|---|---|
| Đăng ký, đăng nhập, khôi phục phiên bằng JWT | Đã có; mật khẩu được băm, JWT có hạn 7 ngày | [backend/app.py](backend/app.py), [DangKy.jsx](frontend/src/pages/DangKy.jsx), [DangNhap.jsx](frontend/src/pages/DangNhap.jsx), [App.jsx](frontend/src/App.jsx) |
| Đăng xuất | Đã có ở frontend: xóa token trong localStorage và trạng thái người dùng; chưa có cơ chế thu hồi JWT ở server | [App.jsx](frontend/src/App.jsx), [Navbar.jsx](frontend/src/components/Navbar.jsx) |
| Khôi phục mật khẩu qua email OTP | Đã có luồng gửi/nhập mã, mã 6 số có hạn 5 phút, băm mã và giới hạn nhập sai; cần cấu hình Gmail để chạy thực tế | [backend/app.py](backend/app.py), [QuenMatKhau.jsx](frontend/src/pages/QuenMatKhau.jsx) |
| Danh sách, tìm kiếm, lọc và phân trang | Đã có; trang chủ tìm trong tiêu đề/tóm tắt, chỉ hiển thị bài đã đăng, 6 bài/trang | [backend/app.py](backend/app.py), [TrangChu.jsx](frontend/src/pages/TrangChu.jsx) |
| Chi tiết và lượt xem | Đã có; chủ bài xem không tăng lượt xem, bản nháp chỉ chủ bài được xem | [backend/app.py](backend/app.py), [ChiTietBaiViet.jsx](frontend/src/pages/ChiTietBaiViet.jsx) |
| Tạo, sửa, xóa, đăng bài và lưu nháp | Đã có; backend kiểm tra chủ sở hữu khi sửa/xóa, có danh sách bài của tài khoản | [backend/app.py](backend/app.py), [FormBaiViet.jsx](frontend/src/pages/FormBaiViet.jsx), [BaiVietCuaToi.jsx](frontend/src/pages/BaiVietCuaToi.jsx) |
| Trợ lý tìm kiếm và thống kê | Đã có; tìm tối đa 5 bài công khai, thống kê bài công khai và số bản nháp của chính người đăng nhập | [backend/app.py](backend/app.py), [TroLyChat.jsx](frontend/src/components/TroLyChat.jsx) |
| Trợ lý hướng dẫn soạn bài | Đã có wizard tiêu đề → tóm tắt → nội dung → lưu nháp/đăng; dùng API tạo bài, thể loại mặc định là `Khác` | [TroLyChat.jsx](frontend/src/components/TroLyChat.jsx) |
| Hồ sơ, ảnh đại diện và xóa thông tin cá nhân | Đã có; đổi tên đồng bộ tên tác giả trên bài đã tạo; xóa hồ sơ giữ lại tài khoản và bài viết | [backend/app.py](backend/app.py), [TrangCaNhan.jsx](frontend/src/pages/TrangCaNhan.jsx) |
| Responsive, hover/focus và giảm chuyển động | Đã có CSS với breakpoint 800 px/560 px và `prefers-reduced-motion`; cần kiểm tra hiển thị trên thiết bị thực | [styles.css](frontend/src/styles.css) |

### Phần còn thiếu hoặc cần xác minh

- **Cấu hình mẫu:** chưa có `backend/.env.example`. Hướng dẫn bên dưới dùng cách tạo `backend/.env` trực tiếp để chạy được theo cấu trúc repository hiện có.
- **Kiểm thử:** chưa có test tự động hoặc workflow CI trong repository. Cần chạy các tình huống ở mục kiểm thử thủ công với MongoDB và Gmail đã cấu hình.
- **Xác thực ảnh đại diện:** frontend giới hạn loại file và dung lượng 1 MiB; backend hiện chỉ kiểm tra tiền tố data URL và độ dài chuỗi tối đa 1.400.000 ký tự, chưa giải mã để xác minh định dạng ảnh và kích thước byte thực tế.
- **Phiên đăng nhập:** đăng xuất và đặt lại mật khẩu chưa thu hồi JWT đã phát hành; token còn có thể dùng đến khi hết hạn.
- **Cấu hình frontend dư:** có `vite.config.js`, `frontend/index.html` và `src/main.jsx`, nhưng `package.json` hiện dùng Create React App, không khai báo Vite. Luồng chạy hiện tại dùng `public/index.html`, `src/index.js` và cổng 3000.

## Công nghệ

| Phần | Công nghệ |
|---|---|
| Frontend | React 18, Create React App, React Router |
| Backend | Python, Flask, Flask-CORS |
| Cơ sở dữ liệu | MongoDB, PyMongo |
| Đăng nhập | JWT; mật khẩu được băm bằng Werkzeug |
| Gửi mã khôi phục mật khẩu | Gmail SMTP, mã OTP 6 số |

## Chức năng

### Tài khoản và bài viết

- Đăng ký, đăng nhập, đăng xuất và khôi phục mật khẩu bằng email OTP.
- Xem danh sách bài viết, tìm kiếm theo từ khóa, lọc theo thể loại và phân trang.
- Xem chi tiết bài viết và lượt xem.
- Viết bài, sửa hoặc xóa bài của mình; chọn đăng ngay hoặc lưu bản nháp.

### Trợ lý MựcXanh

- Mở biểu tượng trợ lý ở góc màn hình để tìm bài viết theo từ khóa.
- Xem thống kê số bài đã đăng, lượt xem, số bài theo thể loại và các bài nổi bật.
- Soạn bài theo các bước: nhập tiêu đề, tóm tắt, nội dung; sau đó chọn lưu nháp hoặc đăng ngay.
- Khung chat hỗ trợ nhập nhiều dòng. Nhấn Enter để xuống dòng, nút **Gửi** để gửi tin; Ctrl+Enter để gửi nhanh.
- Trợ lý hiện nhận biết yêu cầu bằng từ khóa và dùng dữ liệu MongoDB của dự án; nó chưa tự tạo nội dung bằng mô hình AI.
- Cần đăng nhập để lưu nháp hoặc đăng bài. Thống kê bản nháp chỉ bao gồm bản nháp của tài khoản đang đăng nhập.
- Trợ lý không xuất hiện trên các trang đăng nhập, đăng ký và quên mật khẩu. Soạn bài bằng trợ lý hiện chưa có bước chọn thể loại hoặc ảnh bìa; có thể sửa tiếp trong **Bài của tôi**.

### Trang cá nhân

- Mỗi tài khoản có trang `/trang-ca-nhan` để xem và cập nhật tên hiển thị, tuổi, sở thích, chức vụ và trường học/công ty.
- Có thể tải ảnh đại diện PNG, JPG hoặc WebP tối đa 1 MB, xem trước ảnh hoặc bỏ ảnh để dùng hình mặc định.
- Nút **Xóa thông tin cá nhân** xóa thông tin hồ sơ và ảnh đại diện; tài khoản đăng nhập vẫn được giữ lại. Bài viết của tài khoản sẽ hiển thị tác giả là “Ẩn danh”.

### Giao diện

- Nền sáng pha xanh mực, thanh điều hướng cố định và logo ở góc trái trên cùng.
- Thẻ bài viết, nút bấm và biểu mẫu có trạng thái rê chuột/focus; bố cục thích ứng với điện thoại.
- Chuyển động được giảm theo cài đặt `prefers-reduced-motion` của hệ điều hành.

## Cấu trúc thư mục

```text
BTL_LTW/
├── backend/
│   ├── app.py
│   └── requirements.txt
└── frontend/
    ├── package.json
    ├── public/index.html
    └── src/
        ├── index.js, App.jsx, api.js, hang_so.js, styles.css
        ├── components/
        │   ├── Navbar.jsx
        │   ├── KhungXacThuc.jsx
        │   ├── TheBaiViet.jsx
        │   └── TroLyChat.jsx
        └── pages/
            ├── TrangCaNhan.jsx
            └── các trang đăng nhập, trang chủ, bài viết...
```

## Dữ liệu trong MongoDB

Không cần chạy file SQL. Database mặc định là `quan_ly_bai_viet`; MongoDB tự tạo collection khi có dữ liệu.

- `nguoi_dung`: email, mật khẩu đã băm, tên, tuổi, sở thích, chức vụ, trường học/công ty, ảnh đại diện và ngày tạo.
- `bai_viet`: tiêu đề, tóm tắt, nội dung, ảnh bìa, thể loại, trạng thái (`dang`/`nhap`), lượt xem, tác giả và thời gian tạo/cập nhật.
- `ma_otp`: email, mã đã băm, thời hạn và số lần nhập sai; MongoDB tự xóa mã hết hạn.

Ảnh đại diện được lưu trong hồ sơ MongoDB dưới dạng data URL. Frontend giới hạn file 1 MiB; giới hạn và mức xác thực ở backend được nêu trong mục phần còn thiếu. Trường `ngay_sua` của bài viết chỉ được thêm khi cập nhật bài.

## Cách chạy

### 1. Chuẩn bị MongoDB

Cài MongoDB Community Server trên máy hoặc tạo MongoDB Atlas. Nếu dùng Atlas, lấy chuỗi kết nối và thêm vào `MONGO_URI` trong `backend/.env`.

### 2. Cấu hình email OTP

Để dùng chức năng khôi phục mật khẩu, bật xác minh hai bước cho Gmail và tạo mật khẩu ứng dụng. Dùng email và mật khẩu ứng dụng cho `EMAIL_GUI` và `EMAIL_MAT_KHAU_UNG_DUNG` trong `.env`.

### 3. Cài đặt và chạy backend

Clone repository nếu chưa có source code:

```powershell
git clone https://github.com/minhnguyengia1910/BTL_LTW.git
cd BTL_LTW
```

Mở terminal tại thư mục dự án:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
New-Item -ItemType File -Path .env
```

Lệnh tạo `.env` chỉ dùng khi file chưa tồn tại. Repository hiện **không có `.env.example`**; tự điền nội dung sau vào `backend/.env`:

```dotenv
MONGO_URI=mongodb://localhost:27017
DB_NAME=quan_ly_bai_viet
JWT_SECRET=THAY_BANG_KHOA_NGAU_NHIEN_CUA_BAN
EMAIL_GUI=your-address@gmail.com
EMAIL_MAT_KHAU_UNG_DUNG=THAY_BANG_MAT_KHAU_UNG_DUNG_GMAIL
```

Tạo khóa ngẫu nhiên bằng `python -c "import secrets; print(secrets.token_urlsafe(48))"`, rồi dùng kết quả thay cho giá trị mẫu `JWT_SECRET`. Không commit file `.env`; đường dẫn `backend/.env` đã nằm trong `.gitignore`. Hai biến email cần thiết cho chức năng OTP; các chức năng khác vẫn cần MongoDB nhưng không gửi email.

Sau khi cấu hình, chạy từ thư mục `backend`:

```powershell
python app.py
```

Backend chạy tại `http://localhost:5000`.

Nếu PowerShell không cho kích hoạt môi trường, có thể dùng trực tiếp:

```powershell
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe app.py
```

### 4. Cài đặt và chạy frontend

Mở terminal thứ hai:

```powershell
cd frontend
npm install
npm start
```

Frontend mở tại `http://localhost:3000` và chuyển tiếp API đến backend cổng 5000.

Build frontend bằng `npm run build` tại thư mục `frontend`; output của Create React App nằm ở `frontend/build`. File `vite.config.js` không được các npm script hiện tại sử dụng.

## Danh sách API

Các API cần đăng nhập nhận header `Authorization: Bearer <token>`. Lỗi do ứng dụng chủ động trả về dùng dạng `{"loi": "Thông báo"}`.

| Method | Endpoint | Quyền truy cập / chức năng |
|---|---|---|
| POST | `/api/dang-ky` | Công khai; tạo tài khoản |
| POST | `/api/dang-nhap` | Công khai; trả JWT và thông tin người dùng |
| POST | `/api/quen-mat-khau` | Công khai; gửi OTP tới email đã đăng ký |
| POST | `/api/dat-lai-mat-khau` | Công khai; kiểm tra OTP và đặt mật khẩu mới |
| GET | `/api/toi` | Đăng nhập; lấy tài khoản hiện tại |
| GET | `/api/bai-viet` | Công khai; query `tu_khoa`, `the_loai`, `trang` |
| GET | `/api/bai-viet/<bai_id>` | Công khai với bài đã đăng; bản nháp chỉ chủ bài được xem |
| GET | `/api/bai-viet-cua-toi` | Đăng nhập; lấy bài đã đăng và bản nháp của mình |
| POST | `/api/bai-viet` | Đăng nhập; tạo bài với trạng thái `dang` hoặc `nhap` |
| PUT | `/api/bai-viet/<bai_id>` | Đăng nhập, chủ bài; cập nhật bài |
| DELETE | `/api/bai-viet/<bai_id>` | Đăng nhập, chủ bài; xóa bài |
| POST | `/api/tro-ly` | Công khai; body `{"tin_nhan": "..."}`; token được dùng để thống kê thêm bản nháp của mình |
| GET | `/api/trang-ca-nhan` | Đăng nhập; đọc hồ sơ |
| PUT | `/api/trang-ca-nhan` | Đăng nhập; cập nhật hồ sơ và ảnh đại diện |
| DELETE | `/api/trang-ca-nhan` | Đăng nhập; xóa thông tin hồ sơ, không xóa tài khoản/bài viết |

## Kiểm thử và xác minh

Đợt rà soát này đối chiếu mã nguồn backend/frontend, routes, dependencies và cấu hình. Kiểm tra tĩnh đã đạt: cú pháp Python của `backend/app.py`, 15 cặp method/endpoint khớp bảng API, các liên kết file trong README và đường dẫn import nội bộ của frontend. Chưa chạy build frontend hoặc kiểm thử tích hợp với MongoDB/Gmail/trình duyệt. Các tình huống bên dưới là **checklist cần chạy**, chưa phải kết quả kiểm thử thực tế.

- [ ] Đăng ký mới; kiểm tra email trùng, mật khẩu dưới 6 ký tự; đăng nhập đúng/sai; tải lại trang và đăng xuất.
- [ ] Tạo ít nhất 7 bài đã đăng để kiểm tra phân trang; tìm theo tiêu đề/tóm tắt và lọc thể loại.
- [ ] Tạo bản nháp; xác minh tài khoản khác/khách không xem được; sửa, đăng và xóa bằng chủ bài; tài khoản khác nhận lỗi khi sửa/xóa.
- [ ] Mở bài bằng tài khoản khác để kiểm tra lượt xem; chủ bài tự xem không tăng lượt xem.
- [ ] Yêu cầu OTP bằng email thử nghiệm của mình; kiểm tra mã đúng/sai/hết hạn, giới hạn nhập sai và đăng nhập bằng mật khẩu mới.
- [ ] Dùng trợ lý tìm bài, xem thống kê, soạn/lưu nháp/đăng bài; kiểm tra Enter xuống dòng và Ctrl+Enter hoặc Cmd+Enter gửi tin.
- [ ] Cập nhật tên và các thông tin cá nhân; chọn ảnh hợp lệ/quá 1 MiB/sai loại; bỏ ảnh và xóa hồ sơ; kiểm tra tài khoản vẫn đăng nhập được, tên tác giả được cập nhật.
- [ ] Chạy `npm run build`; kiểm tra giao diện trên màn hình nhỏ, bàn phím/focus và chế độ giảm chuyển động.

## Lưu ý triển khai

`python app.py` hiện bật `debug=True`, phù hợp phát triển cục bộ. Trước khi triển khai production, cần tắt debug, dùng WSGI server phù hợp, cấu hình `JWT_SECRET` riêng và giới hạn CORS theo domain thực tế. Cơ chế thu hồi token và xác thực ảnh phía server còn thiếu như đã ghi ở trên.

## Lỗi thường gặp

- **Không tìm thấy module Flask:** kích hoạt `backend/venv` và cài `requirements.txt` bằng đúng Python trong môi trường đó.
- **Không kết nối được MongoDB:** kiểm tra MongoDB đang chạy và `MONGO_URI`; với Atlas, kiểm tra mục Network Access.
- **Không gửi được email OTP:** kiểm tra Gmail, mật khẩu ứng dụng và các biến email trong `.env`.
- **Frontend báo lỗi mạng:** đảm bảo backend đang chạy tại `http://localhost:5000`.
