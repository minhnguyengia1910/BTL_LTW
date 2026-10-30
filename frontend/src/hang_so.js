// Các hằng số và hàm nhỏ dùng ở nhiều nơi

var DANH_SACH_THE_LOAI = [
  { ten: "Công nghệ", icon: "💻" },
  { ten: "Học tập", icon: "📚" },
  { ten: "Đời sống", icon: "🌿" },
  { ten: "Du lịch", icon: "✈️" },
  { ten: "Ẩm thực", icon: "🍜" },
  { ten: "Khác", icon: "📰" },
];

// Lấy icon theo tên thể loại
function layIcon(tenTheLoai) {
  for (var i = 0; i < DANH_SACH_THE_LOAI.length; i++) {
    if (DANH_SACH_THE_LOAI[i].ten === tenTheLoai) {
      return DANH_SACH_THE_LOAI[i].icon;
    }
  }
  return "📰";
}

// Đổi chuỗi ngày từ server sang dạng 30/10/2026
function dinhDangNgay(chuoiNgay) {
  var ngay = new Date(chuoiNgay);
  return ngay.toLocaleDateString("vi-VN");
}

export { DANH_SACH_THE_LOAI, layIcon, dinhDangNgay };
