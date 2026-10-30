// Hàm gọi API dùng chung cho cả dự án
// Ví dụ: goiApi("/bai-viet")                      -> GET
//        goiApi("/dang-nhap", "POST", { ... })     -> POST kèm dữ liệu
async function goiApi(duongDan, phuongThuc, duLieu) {
  var tieuDe = { "Content-Type": "application/json" };

  // Nếu đã đăng nhập thì gửi kèm token để server biết là ai
  var token = localStorage.getItem("token");
  if (token) {
    tieuDe["Authorization"] = "Bearer " + token;
  }

  var phanHoi = await fetch("/api" + duongDan, {
    method: phuongThuc || "GET",
    headers: tieuDe,
    body: duLieu ? JSON.stringify(duLieu) : undefined,
  });
  var ketQua = await phanHoi.json();

  // Server trả về lỗi (400, 401, 404...) thì ném lỗi để chỗ gọi hiển thị ra màn hình
  if (!phanHoi.ok) {
    throw new Error(ketQua.loi || "Có lỗi xảy ra, vui lòng thử lại");
  }
  return ketQua;
}

export default goiApi;
