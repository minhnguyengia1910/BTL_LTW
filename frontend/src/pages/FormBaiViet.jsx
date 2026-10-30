import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import goiApi from "../api";
import { DANH_SACH_THE_LOAI } from "../hang_so";

// Dùng chung cho cả "Viết bài mới" (/viet-bai) và "Sửa bài" (/sua-bai/:id)
function FormBaiViet() {
  var { id } = useParams();       // có id => đang sửa, không có => viết mới
  var dangSua = !!id;
  var chuyenTrang = useNavigate();

  var [form, setForm] = useState({
    tieu_de: "", tom_tat: "", noi_dung: "", anh_bia: "", the_loai: "Công nghệ", trang_thai: "dang",
  });
  var [loi, setLoi] = useState("");
  var [dangGui, setDangGui] = useState(false);

  // Nếu là sửa bài thì tải nội dung cũ đổ vào form
  useEffect(function () {
    if (!dangSua) {
      return;
    }
    goiApi("/bai-viet/" + id)
      .then(function (bai) {
        if (!bai.la_chu_bai) {
          chuyenTrang("/");
          return;
        }
        setForm({
          tieu_de: bai.tieu_de,
          tom_tat: bai.tom_tat || "",
          noi_dung: bai.noi_dung,
          anh_bia: bai.anh_bia || "",
          the_loai: bai.the_loai,
          trang_thai: bai.trang_thai,
        });
      })
      .catch(function (err) { setLoi(err.message); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Một hàm dùng chung cho mọi ô nhập: lấy name của ô để biết đang sửa trường nào
  function doiGiaTri(e) {
    var banSao = Object.assign({}, form);
    banSao[e.target.name] = e.target.value;
    setForm(banSao);
  }

  async function luuBai(e) {
    e.preventDefault();
    setLoi("");
    setDangGui(true);
    try {
      if (dangSua) {
        await goiApi("/bai-viet/" + id, "PUT", form);
      } else {
        await goiApi("/bai-viet", "POST", form);
      }
      chuyenTrang("/bai-viet-cua-toi");
    } catch (err) {
      setLoi(err.message);
    }
    setDangGui(false);
  }

  var cacLuaChon = [];
  for (var i = 0; i < DANH_SACH_THE_LOAI.length; i++) {
    cacLuaChon.push(
      <option key={DANH_SACH_THE_LOAI[i].ten} value={DANH_SACH_THE_LOAI[i].ten}>
        {DANH_SACH_THE_LOAI[i].icon} {DANH_SACH_THE_LOAI[i].ten}
      </option>
    );
  }

  return (
    <div className="trang-form">
      <h1>{dangSua ? "Sửa bài viết" : "Viết bài mới"}</h1>

      <form onSubmit={luuBai} className="hop">
        {loi && <div className="thong-bao thong-bao-loi">{loi}</div>}

        <div className="nhom-truong">
          <label htmlFor="tieu_de">Tiêu đề</label>
          <input id="tieu_de" name="tieu_de" className="o-nhap" value={form.tieu_de}
            onChange={doiGiaTri} placeholder="Tiêu đề bài viết" required />
        </div>

        <div className="nhom-truong">
          <label htmlFor="tom_tat">Tóm tắt (hiện ở trang chủ)</label>
          <input id="tom_tat" name="tom_tat" className="o-nhap" value={form.tom_tat}
            onChange={doiGiaTri} placeholder="Một hai câu giới thiệu bài viết" maxLength={500} />
        </div>

        <div className="hai-cot">
          <div className="nhom-truong">
            <label htmlFor="the_loai">Thể loại</label>
            <select id="the_loai" name="the_loai" className="o-nhap" value={form.the_loai} onChange={doiGiaTri}>
              {cacLuaChon}
            </select>
          </div>
          <div className="nhom-truong">
            <label htmlFor="trang_thai">Trạng thái</label>
            <select id="trang_thai" name="trang_thai" className="o-nhap" value={form.trang_thai} onChange={doiGiaTri}>
              <option value="dang">Đăng ngay</option>
              <option value="nhap">Lưu nháp</option>
            </select>
          </div>
        </div>

        <div className="nhom-truong">
          <label htmlFor="anh_bia">Link ảnh bìa (không bắt buộc)</label>
          <input id="anh_bia" name="anh_bia" className="o-nhap" value={form.anh_bia}
            onChange={doiGiaTri} placeholder="https://..." />
        </div>

        <div className="nhom-truong">
          <label htmlFor="noi_dung">Nội dung</label>
          <textarea id="noi_dung" name="noi_dung" className="o-nhap o-van-ban" value={form.noi_dung}
            onChange={doiGiaTri} rows={14} placeholder="Viết nội dung bài ở đây..." required />
        </div>

        <div className="hang-nut">
          <button type="submit" className="nut nut-chinh" disabled={dangGui}>
            {dangGui ? "Đang lưu..." : dangSua ? "Lưu thay đổi" : "Lưu bài viết"}
          </button>
          <Link to="/bai-viet-cua-toi" className="nut nut-vien">Huỷ</Link>
        </div>
      </form>
    </div>
  );
}

export default FormBaiViet;
