import { useState, useEffect } from "react";
import goiApi from "../api";
import TheBaiViet from "../components/TheBaiViet.jsx";
import { DANH_SACH_THE_LOAI } from "../hang_so";

function TrangChu() {
  var [tuKhoa, setTuKhoa] = useState("");        // chữ đang gõ trong ô tìm kiếm
  var [tuKhoaTim, setTuKhoaTim] = useState("");  // chữ đã bấm tìm
  var [theLoai, setTheLoai] = useState("");
  var [trang, setTrang] = useState(1);
  var [ketQua, setKetQua] = useState({ danh_sach: [], tong_trang: 1 });
  var [dangTai, setDangTai] = useState(true);
  var [loi, setLoi] = useState("");

  // Mỗi khi từ khoá, thể loại hoặc trang đổi thì tải lại danh sách
  useEffect(function () {
    setDangTai(true);
    var duongDan = "/bai-viet?trang=" + trang
      + "&tu_khoa=" + encodeURIComponent(tuKhoaTim)
      + "&the_loai=" + encodeURIComponent(theLoai);

    goiApi(duongDan)
      .then(function (kq) { setKetQua(kq); setLoi(""); })
      .catch(function (err) { setLoi(err.message); })
      .finally(function () { setDangTai(false); });
  }, [tuKhoaTim, theLoai, trang]);

  function timKiem(e) {
    e.preventDefault();
    setTrang(1);
    setTuKhoaTim(tuKhoa);
  }

  function chonTheLoai(ten) {
    setTheLoai(ten);
    setTrang(1);
  }

  // Tạo các nút chọn thể loại
  var cacChip = [];
  cacChip.push(
    <button key="tat-ca" className={"chip" + (theLoai === "" ? " chip-chon" : "")}
      onClick={function () { chonTheLoai(""); }}>Tất cả</button>
  );
  for (var i = 0; i < DANH_SACH_THE_LOAI.length; i++) {
    var tl = DANH_SACH_THE_LOAI[i];
    cacChip.push(
      <button key={tl.ten} className={"chip" + (theLoai === tl.ten ? " chip-chon" : "")}
        onClick={chonTheLoai.bind(null, tl.ten)}>
        {tl.icon} {tl.ten}
      </button>
    );
  }

  // Tạo các thẻ bài viết
  var cacThe = [];
  for (var j = 0; j < ketQua.danh_sach.length; j++) {
    cacThe.push(<TheBaiViet key={ketQua.danh_sach[j].id} bai={ketQua.danh_sach[j]} />);
  }

  // Tạo các nút số trang
  var cacNutTrang = [];
  for (var k = 1; k <= ketQua.tong_trang; k++) {
    cacNutTrang.push(
      <button key={k} className={"nut-trang" + (k === trang ? " nut-trang-chon" : "")}
        onClick={setTrang.bind(null, k)}>{k}</button>
    );
  }

  return (
    <div>
      <section className="dau-trang">
        <h1>Bài viết mới nhất</h1>
        <form className="o-tim-kiem" onSubmit={timKiem}>
          <input className="o-nhap" placeholder="🔍 Tìm theo tiêu đề hoặc tóm tắt..."
            value={tuKhoa} onChange={function (e) { setTuKhoa(e.target.value); }} />
          <button type="submit" className="nut nut-chinh">Tìm</button>
        </form>
        <div className="hang-chip">{cacChip}</div>
      </section>

      {loi && <div className="thong-bao thong-bao-loi">{loi}</div>}
      {dangTai && <p className="dang-tai">Đang tải bài viết...</p>}

      {!dangTai && !loi && cacThe.length === 0 && (
        <p className="trong">📭 Chưa có bài viết nào phù hợp. Thử đổi từ khoá hoặc thể loại khác nhé.</p>
      )}

      <div className="luoi-the">{cacThe}</div>

      {ketQua.tong_trang > 1 && <div className="phan-trang">{cacNutTrang}</div>}
    </div>
  );
}

export default TrangChu;
