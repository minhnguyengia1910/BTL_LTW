import { useEffect, useState } from "react";
import goiApi from "../api";

function TrangCaNhan(props) {
  var [form, setForm] = useState({ ten: "", tuoi: "", so_thich: "", chuc_vu: "", truong_hoc_cong_ty: "", anh_dai_dien: "" });
  var [dangTai, setDangTai] = useState(true);
  var [dangLuu, setDangLuu] = useState(false);
  var [thongBao, setThongBao] = useState("");
  var [loi, setLoi] = useState("");

  useEffect(function () {
    goiApi("/trang-ca-nhan")
      .then(function (duLieu) { setForm(Object.assign({ ten: "", tuoi: "", so_thich: "", chuc_vu: "", truong_hoc_cong_ty: "", anh_dai_dien: "" }, duLieu)); })
      .catch(function (err) { setLoi(err.message); })
      .finally(function () { setDangTai(false); });
  }, []);

  function doiGiaTri(e) {
    setForm(function (cu) { return Object.assign({}, cu, { [e.target.name]: e.target.value }); });
  }

  function chonAnh(e) {
    var tep = e.target.files && e.target.files[0];
    if (!tep) return;
    setLoi("");
    if (["image/png", "image/jpeg", "image/webp"].indexOf(tep.type) === -1) {
      setLoi("Chỉ hỗ trợ ảnh PNG, JPG hoặc WebP.");
      e.target.value = "";
      return;
    }
    if (tep.size > 1024 * 1024) {
      setLoi("Ảnh phải nhỏ hơn 1 MB.");
      e.target.value = "";
      return;
    }
    var docAnh = new FileReader();
    docAnh.onload = function () {
      setForm(function (cu) { return Object.assign({}, cu, { anh_dai_dien: docAnh.result }); });
    };
    docAnh.readAsDataURL(tep);
  }

  async function luuThongTin(e) {
    e.preventDefault();
    setDangLuu(true);
    setLoi("");
    setThongBao("");
    try {
      await goiApi("/trang-ca-nhan", "PUT", form);
      var taiKhoan = await goiApi("/toi");
      props.setNguoiDung(taiKhoan.nguoi_dung);
      setThongBao("Đã cập nhật trang cá nhân.");
    } catch (err) {
      setLoi(err.message);
    }
    setDangLuu(false);
  }

  async function xoaThongTin() {
    if (!window.confirm("Xóa toàn bộ thông tin trang cá nhân? Bài viết của bạn sẽ hiển thị tác giả là Ẩn danh.")) return;
    setLoi("");
    setThongBao("");
    try {
      await goiApi("/trang-ca-nhan", "DELETE");
      var taiKhoan = await goiApi("/toi");
      props.setNguoiDung(taiKhoan.nguoi_dung);
      setForm({ ten: "", tuoi: "", so_thich: "", chuc_vu: "", truong_hoc_cong_ty: "", anh_dai_dien: "" });
      setThongBao("Đã xóa thông tin trang cá nhân.");
    } catch (err) {
      setLoi(err.message);
    }
  }

  if (dangTai) return <p className="dang-tai">Đang tải trang cá nhân...</p>;

  return (
    <div className="trang-form trang-ca-nhan">
      <p className="ho-so-nhan">HỒ SƠ CỦA BẠN</p>
      <h1>Trang cá nhân</h1>
      <p className="ho-so-mo-ta">Cập nhật thông tin để mọi người hiểu thêm về bạn.</p>
      <form className="hop" onSubmit={luuThongTin}>
        {loi && <div className="thong-bao thong-bao-loi">{loi}</div>}
        {thongBao && <div className="thong-bao thong-bao-ok">{thongBao}</div>}
        <div className="ho-so-anh-khu">
          {form.anh_dai_dien ? <img className="ho-so-anh" src={form.anh_dai_dien} alt="Ảnh đại diện của bạn" /> : <div className="ho-so-anh ho-so-anh-mac-dinh" role="img" aria-label="Ảnh đại diện mặc định" />}
          <div className="ho-so-anh-thao-tac"><label className="nut nut-vien" htmlFor="ho-so-anh">Chọn ảnh đại diện</label><input id="ho-so-anh" className="ho-so-tep-anh" type="file" accept="image/png,image/jpeg,image/webp" onChange={chonAnh} /><p>PNG, JPG hoặc WebP · tối đa 1 MB</p>{form.anh_dai_dien && <button type="button" className="lien-ket ho-so-bo-anh" onClick={function () { setForm(function (cu) { return Object.assign({}, cu, { anh_dai_dien: "" }); }); }}>Bỏ ảnh, dùng ảnh mặc định</button>}</div>
        </div>
        <div className="hai-cot">
          <div className="nhom-truong"><label htmlFor="ho-so-ten">Tên hiển thị</label><input id="ho-so-ten" name="ten" className="o-nhap" value={form.ten} onChange={doiGiaTri} maxLength={80} placeholder="Tên hiển thị (có thể để trống)" /></div>
          <div className="nhom-truong"><label htmlFor="ho-so-tuoi">Tuổi</label><input id="ho-so-tuoi" name="tuoi" type="number" min="1" max="120" className="o-nhap" value={form.tuoi} onChange={doiGiaTri} placeholder="Ví dụ: 20" /></div>
          <div className="nhom-truong"><label htmlFor="ho-so-chuc-vu">Chức vụ</label><input id="ho-so-chuc-vu" name="chuc_vu" className="o-nhap" value={form.chuc_vu} onChange={doiGiaTri} maxLength={300} placeholder="Ví dụ: Sinh viên, nhân viên..." /></div>
          <div className="nhom-truong"><label htmlFor="ho-so-noi-lam">Trường học hoặc công ty</label><input id="ho-so-noi-lam" name="truong_hoc_cong_ty" className="o-nhap" value={form.truong_hoc_cong_ty} onChange={doiGiaTri} maxLength={300} placeholder="Tên trường hoặc công ty" /></div>
        </div>
        <div className="nhom-truong"><label htmlFor="ho-so-so-thich">Sở thích</label><textarea id="ho-so-so-thich" name="so_thich" className="o-nhap o-van-ban" rows={4} value={form.so_thich} onChange={doiGiaTri} maxLength={300} placeholder="Chia sẻ một vài sở thích của bạn" /></div>
        <div className="hang-nut"><button type="submit" className="nut nut-chinh" disabled={dangLuu}>{dangLuu ? "Đang lưu..." : "Lưu thay đổi"}</button><button type="button" className="nut nut-nguy-hiem" onClick={xoaThongTin}>Xóa thông tin cá nhân</button></div>
      </form>
    </div>
  );
}

export default TrangCaNhan;
