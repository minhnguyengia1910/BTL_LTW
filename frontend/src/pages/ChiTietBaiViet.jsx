import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import goiApi from "../api";
import { layIcon, dinhDangNgay } from "../hang_so";

function ChiTietBaiViet() {
  var { id } = useParams();
  var chuyenTrang = useNavigate();
  var [bai, setBai] = useState(null);
  var [loi, setLoi] = useState("");

  useEffect(function () {
    goiApi("/bai-viet/" + id)
      .then(function (kq) { setBai(kq); })
      .catch(function (err) { setLoi(err.message); });
  }, [id]);

  async function xoaBai() {
    if (!window.confirm("Bạn chắc chắn muốn xoá bài viết này?")) {
      return;
    }
    try {
      await goiApi("/bai-viet/" + id, "DELETE");
      chuyenTrang("/bai-viet-cua-toi");
    } catch (err) {
      setLoi(err.message);
    }
  }

  if (loi) {
    return <div className="thong-bao thong-bao-loi">{loi}</div>;
  }
  if (!bai) {
    return <p className="dang-tai">Đang tải bài viết...</p>;
  }

  return (
    <article className="bai-chi-tiet">
      <Link to="/" className="lien-ket">← Về trang chủ</Link>

      <span className="nhan-the-loai">{layIcon(bai.the_loai)} {bai.the_loai}</span>
      <h1>{bai.tieu_de}</h1>
      <div className="thong-tin-bai">
        <span>Tác giả: <b>{bai.tac_gia}</b></span>
        <span>{dinhDangNgay(bai.ngay_tao)}</span>
        <span>👁️ {bai.luot_xem} lượt xem</span>
        {bai.trang_thai === "nhap" && <span className="nhan-trang-thai nhap">Bản nháp</span>}
      </div>

      {bai.la_chu_bai && (
        <div className="hang-nut">
          <Link to={"/sua-bai/" + bai.id} className="nut nut-vien nut-nho">✏️ Sửa</Link>
          <button className="nut nut-nguy-hiem nut-nho" onClick={xoaBai}>🗑️ Xoá</button>
        </div>
      )}

      {bai.anh_bia && <img className="anh-bia" src={bai.anh_bia} alt={bai.tieu_de} />}
      {bai.tom_tat && <p className="tom-tat">{bai.tom_tat}</p>}
      <div className="noi-dung-bai">{bai.noi_dung}</div>
    </article>
  );
}

export default ChiTietBaiViet;
