# ✒️ MựcXanh — Website quản lý và chia sẻ bài viết

MựcXanh giúp người dùng đọc, tìm kiếm, viết và quản lý bài viết. Dự án dùng React cho giao diện, Flask cho API và MongoDB để lưu dữ liệu.

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
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── package.json
    └── src/
        ├── App.jsx, api.js, hang_so.js, styles.css
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

Ảnh đại diện được lưu trong hồ sơ MongoDB dưới dạng data URL sau khi giới hạn loại ảnh và dung lượng ở mức 1 MB.

## Cách chạy

### 1. Chuẩn bị MongoDB

Cài MongoDB Community Server trên máy hoặc tạo MongoDB Atlas. Nếu dùng Atlas, lấy chuỗi kết nối và thêm vào `MONGO_URI` trong `backend/.env`.

### 2. Cấu hình email OTP

Để dùng chức năng khôi phục mật khẩu, bật xác minh hai bước cho Gmail và tạo mật khẩu ứng dụng. Dùng email và mật khẩu ứng dụng cho `EMAIL_GUI` và `EMAIL_MAT_KHAU_UNG_DUNG` trong `.env`.

### 3. Cài đặt và chạy backend

Mở terminal tại thư mục dự án:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Điền `MONGO_URI`, `JWT_SECRET` và thông tin Gmail cần thiết vào `backend/.env`, rồi chạy:

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

## API bổ sung

- `POST /api/tro-ly`: tìm bài hoặc lấy thống kê bài viết.
- `GET /api/trang-ca-nhan`: đọc hồ sơ đang đăng nhập.
- `PUT /api/trang-ca-nhan`: cập nhật thông tin và ảnh đại diện.
- `DELETE /api/trang-ca-nhan`: xóa thông tin hồ sơ và ảnh đại diện.

Các API hồ sơ yêu cầu token đăng nhập.

## Lỗi thường gặp

- **Không tìm thấy module Flask:** kích hoạt `backend/venv` và cài `requirements.txt` bằng đúng Python trong môi trường đó.
- **Không kết nối được MongoDB:** kiểm tra MongoDB đang chạy và `MONGO_URI`; với Atlas, kiểm tra mục Network Access.
- **Không gửi được email OTP:** kiểm tra Gmail, mật khẩu ứng dụng và các biến email trong `.env`.
- **Frontend báo lỗi mạng:** đảm bảo backend đang chạy tại `http://localhost:5000`.
