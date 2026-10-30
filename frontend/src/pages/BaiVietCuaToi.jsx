import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import goiApi from "../api";
import { dinhDangNgay } from "../hang_so";

function BaiVietCuaToi() {
  var [danhSach, setDanhSach] = useState([]);
  var [dangTai, setDangTai] = useState(true);
  var [loi, setLoi] = useState("");

  function taiDanhSach() {
    goiApi("/bai-viet-cua-toi")
      .then(function (kq) { setDanhSach(kq.danh_sach); })
      .catch(function (err) { setLoi(err.message); })
      .finally(function () { setDangTai(false); });
  }

  useEffect(function () {
    taiDanhSach();
  }, []);

  async function xoaBai(id) {
    if (!window.confirm("Bạn chắc chắn muốn xoá bài viết này?")) {
      return;
    }
    try {
      await goiApi("/bai-viet/" + id, "DELETE");
      taiDanhSach(); // xoá xong tải lại danh sách
    } catch (err) {
      setLoi(err.message);
    }
  }

  var cacDong = [];
  for (var i = 0; i < danhSach.length; i++) {
    var bai = danhSach[i];
    cacDong.push(
      <div className="dong-bai" key={bai.id}>
        <div className="dong-bai-trai">
          <Link to={"/bai-viet/" + bai.id} className="dong-bai-tieu-de">{bai.tieu_de}</Link>
          <div className="thong-tin-bai">
            <span>{bai.the_loai}</span>
            <span>{dinhDangNgay(bai.ngay_tao)}</span>
            <span>👁️ {bai.luot_xem}</span>
          </div>
        </div>
        <span className={"nhan-trang-thai " + bai.trang_thai}>
          {bai.trang_thai === "dang" ? "Đã đăng" : "Bản nháp"}
        </span>
        <div className="hang-nut">
          <Link to={"/sua-bai/" + bai.id} className="nut nut-vien nut-nho">✏️ Sửa</Link>
          <button className="nut nut-nguy-hiem nut-nho" onClick={xoaBai.bind(null, bai.id)}>🗑️ Xoá</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="dau-trang-ngang">
        <h1>Bài viết của tôi</h1>
        <Link to="/viet-bai" className="nut nut-chinh">✍️ Viết bài mới</Link>
      </div>

      {loi && <div className="thong-bao thong-bao-loi">{loi}</div>}
      {dangTai && <p className="dang-tai">Đang tải...</p>}
      {!dangTai && danhSach.length === 0 && (
        <p className="trong">✍️ Bạn chưa có bài viết nào. Bấm "Viết bài mới" để bắt đầu.</p>
      )}

      <div className="danh-sach-dong">{cacDong}</div>
    </div>
  );
}

export default BaiVietCuaToi;
