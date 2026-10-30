import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import goiApi from "../api";
import KhungXacThuc from "../components/KhungXacThuc.jsx";

function DangNhap(props) {
  var [email, setEmail] = useState("");
  var [matKhau, setMatKhau] = useState("");
  var [hienMatKhau, setHienMatKhau] = useState(false);
  var [loi, setLoi] = useState("");
  var [dangGui, setDangGui] = useState(false);
  var chuyenTrang = useNavigate();

  async function xuLyDangNhap(e) {
    e.preventDefault();
    setLoi("");
    setDangGui(true);
    try {
      var ketQua = await goiApi("/dang-nhap", "POST", { email: email, mat_khau: matKhau });
      localStorage.setItem("token", ketQua.token); // lưu token để lần sau vẫn đăng nhập
      props.setNguoiDung(ketQua.nguoi_dung);
      chuyenTrang("/");
    } catch (err) {
      setLoi(err.message);
    }
    setDangGui(false);
  }

  return (
    <KhungXacThuc tieuDe="Đăng nhập" moTa="Chào mừng bạn quay lại.">
      <form onSubmit={xuLyDangNhap}>
        {loi && <div className="thong-bao thong-bao-loi">{loi}</div>}

        <div className="nhom-truong">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" className="o-nhap" placeholder="ban@example.com"
            value={email} onChange={function (e) { setEmail(e.target.value); }} required />
        </div>

        <div className="nhom-truong">
          <label htmlFor="mat-khau">Mật khẩu</label>
          <div className="o-mat-khau">
            <input id="mat-khau" type={hienMatKhau ? "text" : "password"} className="o-nhap"
              placeholder="Nhập mật khẩu" value={matKhau}
              onChange={function (e) { setMatKhau(e.target.value); }} required />
            <button type="button" className="nut-mat" title="Hiện/ẩn mật khẩu"
              onClick={function () { setHienMatKhau(!hienMatKhau); }}>
              {hienMatKhau ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <div className="dong-phai">
          <Link to="/quen-mat-khau" className="lien-ket">Quên mật khẩu?</Link>
        </div>

        <button type="submit" className="nut nut-chinh nut-rong" disabled={dangGui}>
          {dangGui ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      <p className="chan-form">
        Chưa có tài khoản? <Link to="/dang-ky" className="lien-ket">Đăng ký ngay</Link>
      </p>
    </KhungXacThuc>
  );
}

export default DangNhap;
