import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import goiApi from "../api";
import KhungXacThuc from "../components/KhungXacThuc.jsx";

function DangKy() {
  var [ten, setTen] = useState("");
  var [email, setEmail] = useState("");
  var [matKhau, setMatKhau] = useState("");
  var [nhapLai, setNhapLai] = useState("");
  var [loi, setLoi] = useState("");
  var [thanhCong, setThanhCong] = useState("");
  var [dangGui, setDangGui] = useState(false);
  var chuyenTrang = useNavigate();

  async function xuLyDangKy(e) {
    e.preventDefault();
    setLoi("");

    // Kiểm tra nhanh ở frontend trước khi gửi lên server
    if (matKhau.length < 6) {
      setLoi("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (matKhau !== nhapLai) {
      setLoi("Hai mật khẩu không giống nhau");
      return;
    }

    setDangGui(true);
    try {
      await goiApi("/dang-ky", "POST", { ten: ten, email: email, mat_khau: matKhau });
      setThanhCong("Đăng ký thành công! Đang chuyển sang trang đăng nhập...");
      setTimeout(function () { chuyenTrang("/dang-nhap"); }, 1500);
    } catch (err) {
      setLoi(err.message);
    }
    setDangGui(false);
  }

  return (
    <KhungXacThuc tieuDe="Tạo tài khoản" moTa="Chỉ mất một phút để bắt đầu viết.">
      <form onSubmit={xuLyDangKy}>
        {loi && <div className="thong-bao thong-bao-loi">{loi}</div>}
        {thanhCong && <div className="thong-bao thong-bao-ok">{thanhCong}</div>}

        <div className="nhom-truong">
          <label htmlFor="ten">Tên hiển thị</label>
          <input id="ten" className="o-nhap" placeholder="Nguyễn Văn A" value={ten}
            onChange={function (e) { setTen(e.target.value); }} required />
        </div>

        <div className="nhom-truong">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" className="o-nhap" placeholder="ban@example.com" value={email}
            onChange={function (e) { setEmail(e.target.value); }} required />
        </div>

        <div className="nhom-truong">
          <label htmlFor="mat-khau">Mật khẩu</label>
          <input id="mat-khau" type="password" className="o-nhap" placeholder="Ít nhất 6 ký tự" value={matKhau}
            onChange={function (e) { setMatKhau(e.target.value); }} required />
        </div>

        <div className="nhom-truong">
          <label htmlFor="nhap-lai">Nhập lại mật khẩu</label>
          <input id="nhap-lai" type="password" className="o-nhap" placeholder="Nhập lại mật khẩu" value={nhapLai}
            onChange={function (e) { setNhapLai(e.target.value); }} required />
        </div>

        <button type="submit" className="nut nut-chinh nut-rong" disabled={dangGui}>
          {dangGui ? "Đang tạo tài khoản..." : "Đăng ký"}
        </button>
      </form>

      <p className="chan-form">
        Đã có tài khoản? <Link to="/dang-nhap" className="lien-ket">Đăng nhập</Link>
      </p>
    </KhungXacThuc>
  );
}

export default DangKy;
