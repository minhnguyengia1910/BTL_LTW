# ✒️ MựcXanh - Website quản lý bài viết (React + Flask + MongoDB)

## Công nghệ
| Phần | Công nghệ |
|---|---|
| Frontend | ReactJS (Create React App) + React Router |
| Backend | Python Flask |
| Database | MongoDB (thư viện pymongo) |
| Đăng nhập | JWT token, mật khẩu băm bằng werkzeug |
| Gửi OTP | Gmail SMTP (email thật) |

## Chức năng
- Đăng ký, đăng nhập, đăng xuất
- Quên mật khẩu: nhập email -> nhận mã OTP 6 số qua email -> đặt mật khẩu mới
- Xem danh sách bài viết, tìm kiếm, lọc thể loại, phân trang
- Xem chi tiết bài viết (có đếm lượt xem)
- Viết, sửa, xoá bài; lưu nháp hoặc đăng ngay (chỉ tác giả mới sửa/xoá được bài của mình)

## Cấu trúc thư mục
```
quan-ly-bai-viet/
├── backend/
│   ├── app.py            # toàn bộ API (đọc từ trên xuống là hiểu)
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    └── src/
        ├── index.js, App.jsx, api.js, hang_so.js, styles.css
        ├── components/   # Navbar, KhungXacThuc, TheBaiViet
        └── pages/        # DangNhap, DangKy, QuenMatKhau, TrangChu, ...
```

## Dữ liệu trong MongoDB
Không cần chạy file SQL. Database `quan_ly_bai_viet` và các collection tự được tạo khi có dữ liệu đầu tiên:
- `nguoi_dung`: ten, email (không trùng), mat_khau (đã băm), ngay_tao
- `bai_viet`: tieu_de, tom_tat, noi_dung, anh_bia, the_loai, trang_thai ("dang" / "nhap"), luot_xem, nguoi_dung_id, tac_gia, ngay_tao, ngay_sua
- `ma_otp`: email, ma_bam, het_han, so_lan_sai (MongoDB tự xoá khi hết hạn)

## Cách chạy

### Bước 1: Chuẩn bị MongoDB (chọn 1 trong 2)
- **Cách A - cài trên máy:** tải MongoDB Community Server và MongoDB Compass (giao diện xem dữ liệu) tại mongodb.com/try/download. Cài xong MongoDB tự chạy ở `localhost:27017`.
- **Cách B - MongoDB Atlas (miễn phí, không cần cài):** tạo cluster free tại mongodb.com/atlas, lấy chuỗi kết nối rồi dán vào `MONGO_URI` trong `.env`.

### Bước 2: Lấy "Mật khẩu ứng dụng" Gmail để gửi OTP
1. Bật xác minh 2 bước cho tài khoản Google.
2. Vào https://myaccount.google.com/apppasswords, tạo mật khẩu ứng dụng (16 ký tự).
3. Dùng 16 ký tự đó cho `EMAIL_MAT_KHAU_UNG_DUNG`. Không dùng mật khẩu Gmail thường.

### Bước 3: Chạy backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows  (Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env         # Mac/Linux: cp .env.example .env
# Mở file .env và điền MONGO_URI, Gmail, JWT_SECRET
python app.py                  # chạy ở http://localhost:5000
```

### Bước 4: Chạy frontend (mở terminal mới)
```bash
cd frontend
npm install
npm start                      # tự mở http://localhost:3000
```

## Lỗi thường gặp
- **Không kết nối được MongoDB / chờ rất lâu**: MongoDB chưa chạy, hoặc `MONGO_URI` sai. Với Atlas, nhớ thêm địa chỉ IP của bạn vào Network Access.
- **Không gửi được email**: sai mật khẩu ứng dụng, hoặc chưa bật xác minh 2 bước.
- **Trang web báo lỗi mạng**: backend chưa chạy ở cổng 5000.
