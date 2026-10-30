import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import goiApi from "./api";
import Navbar from "./components/Navbar.jsx";
import TrangChu from "./pages/TrangChu.jsx";
import ChiTietBaiViet from "./pages/ChiTietBaiViet.jsx";
import FormBaiViet from "./pages/FormBaiViet.jsx";
import BaiVietCuaToi from "./pages/BaiVietCuaToi.jsx";
import DangNhap from "./pages/DangNhap.jsx";
import DangKy from "./pages/DangKy.jsx";
import QuenMatKhau from "./pages/QuenMatKhau.jsx";
import TroLyChat from "./components/TroLyChat.jsx";
import TrangCaNhan from "./pages/TrangCaNhan.jsx";

// Bọc những trang bắt buộc đăng nhập: chưa đăng nhập thì chuyển sang trang đăng nhập
function BaoVe(props) {
  if (!props.nguoiDung) {
    return <Navigate to="/dang-nhap" replace />;
  }
  return props.children;
}

function App() {
  var [nguoiDung, setNguoiDung] = useState(null);
  var [dangTai, setDangTai] = useState(true);
  var viTri = useLocation();

  // Khi mở web: nếu còn token thì hỏi server xem token còn dùng được không
  useEffect(function () {
    if (!localStorage.getItem("token")) {
      setDangTai(false);
      return;
    }
    goiApi("/toi")
      .then(function (ketQua) {
        setNguoiDung(ketQua.nguoi_dung);
      })
      .catch(function () {
        localStorage.removeItem("token"); // token hết hạn hoặc sai
      })
      .finally(function () {
        setDangTai(false);
      });
  }, []);

  function dangXuat() {
    localStorage.removeItem("token");
    setNguoiDung(null);
  }

  if (dangTai) {
    return <p className="dang-tai">Đang tải...</p>;
  }

  // 3 trang đăng nhập/đăng ký/quên mật khẩu có giao diện riêng, không hiện thanh menu
  var trangXacThuc = ["/dang-nhap", "/dang-ky", "/quen-mat-khau"];
  var laTrangXacThuc = trangXacThuc.indexOf(viTri.pathname) !== -1;

  return (
    <>
      {!laTrangXacThuc && <Navbar nguoiDung={nguoiDung} dangXuat={dangXuat} />}
      <main className={laTrangXacThuc ? "" : "khung"}>
        <Routes>
          <Route path="/" element={<TrangChu />} />
          <Route path="/bai-viet/:id" element={<ChiTietBaiViet />} />
          <Route path="/dang-nhap" element={<DangNhap setNguoiDung={setNguoiDung} />} />
          <Route path="/dang-ky" element={<DangKy />} />
          <Route path="/quen-mat-khau" element={<QuenMatKhau />} />
          <Route path="/trang-ca-nhan" element={<BaoVe nguoiDung={nguoiDung}><TrangCaNhan setNguoiDung={setNguoiDung} /></BaoVe>} />
          <Route
            path="/viet-bai"
            element={<BaoVe nguoiDung={nguoiDung}><FormBaiViet /></BaoVe>}
          />
          <Route
            path="/sua-bai/:id"
            element={<BaoVe nguoiDung={nguoiDung}><FormBaiViet /></BaoVe>}
          />
          <Route
            path="/bai-viet-cua-toi"
            element={<BaoVe nguoiDung={nguoiDung}><BaiVietCuaToi /></BaoVe>}
          />
          <Route path="*" element={<p className="trong">Không tìm thấy trang này.</p>} />
        </Routes>
      </main>
      {!laTrangXacThuc && <TroLyChat />}
    </>
  );
}

export default App;
