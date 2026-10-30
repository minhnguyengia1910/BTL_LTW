import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import goiApi from "../api";
import KhungXacThuc from "../components/KhungXacThuc.jsx";

// Quên mật khẩu gồm 2 bước:
//   Bước 1: nhập email -> server gửi mã OTP về email
//   Bước 2: nhập mã OTP + mật khẩu mới
function QuenMatKhau() {
  var [buoc, setBuoc] = useState(1);
  var [email, setEmail] = useState("");
  var [maOtp, setMaOtp] = useState("");
  var [matKhauMoi, setMatKhauMoi] = useState("");
  var [nhapLai, setNhapLai] = useState("");
  var [loi, setLoi] = useState("");
  var [thongBao, setThongBao] = useState("");
  var [dangGui, setDangGui] = useState(false);
  var chuyenTrang = useNavigate();

  async function guiMaOtp(e) {
    e.preventDefault();
    setLoi("");
    setThongBao("");
    setDangGui(true);
    try {
      var ketQua = await goiApi("/quen-mat-khau", "POST", { email: email });
      setThongBao(ketQua.thong_diep);
      setBuoc(2);
    } catch (err) {
      setLoi(err.message);
    }
    setDangGui(false);
  }

  async function datLaiMatKhau(e) {
    e.preventDefault();
    setLoi("");
    if (matKhauMoi !== nhapLai) {
      setLoi("Hai mật khẩu không giống nhau");
      return;
    }
    setDangGui(true);
    try {
      await goiApi("/dat-lai-mat-khau", "POST", {
        email: email,
        ma_otp: maOtp,
        mat_khau_moi: matKhauMoi,
      });
      setThongBao("Đổi mật khẩu thành công! Đang chuyển sang trang đăng nhập...");
      setTimeout(function () { chuyenTrang("/dang-nhap"); }, 1500);
    } catch (err) {
      setLoi(err.message);
    }
    setDangGui(false);
  }

  var moTa = buoc === 1
    ? "Nhập email đã đăng ký, chúng tôi sẽ gửi mã OTP 6 số."
    : "Nhập mã OTP vừa gửi tới " + email + " và đặt mật khẩu mới.";

  return (
    <KhungXacThuc tieuDe="Quên mật khẩu" moTa={moTa}>
      {loi && <div className="thong-bao thong-bao-loi">{loi}</div>}
      {thongBao && <div className="thong-bao thong-bao-ok">{thongBao}</div>}

      {buoc === 1 && (
        <form onSubmit={guiMaOtp}>
          <div className="nhom-truong">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" className="o-nhap" placeholder="ban@example.com" value={email}
              onChange={function (e) { setEmail(e.target.value); }} required />
          </div>
          <button type="submit" className="nut nut-chinh nut-rong" disabled={dangGui}>
            {dangGui ? "Đang gửi mã..." : "Gửi mã OTP"}
          </button>
        </form>
      )}

      {buoc === 2 && (
        <form onSubmit={datLaiMatKhau}>
          <div className="nhom-truong">
            <label htmlFor="otp">Mã OTP</label>
            <input id="otp" className="o-nhap o-otp" placeholder="••••••" maxLength={6}
              inputMode="numeric" value={maOtp}
              onChange={function (e) { setMaOtp(e.target.value); }} required />
          </div>
          <div className="nhom-truong">
            <label htmlFor="mk-moi">Mật khẩu mới</label>
            <input id="mk-moi" type="password" className="o-nhap" placeholder="Ít nhất 6 ký tự"
              value={matKhauMoi} onChange={function (e) { setMatKhauMoi(e.target.value); }} required />
          </div>
          <div className="nhom-truong">
            <label htmlFor="nhap-lai">Nhập lại mật khẩu mới</label>
            <input id="nhap-lai" type="password" className="o-nhap" placeholder="Nhập lại mật khẩu mới"
              value={nhapLai} onChange={function (e) { setNhapLai(e.target.value); }} required />
          </div>
          <button type="submit" className="nut nut-chinh nut-rong" disabled={dangGui}>
            {dangGui ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>
          <button type="button" className="nut nut-vien nut-rong nut-cach"
            onClick={function () { setBuoc(1); setThongBao(""); setLoi(""); }}>
            Gửi lại mã / đổi email
          </button>
        </form>
      )}

      <p className="chan-form">
        <Link to="/dang-nhap" className="lien-ket">Quay lại đăng nhập</Link>
      </p>
    </KhungXacThuc>
  );
}

export default QuenMatKhau;
