import { useState } from "react";
import { Link } from "react-router-dom";
import goiApi from "../api";

function TroLyChat() {
  var [mo, setMo] = useState(false);
  var [tinNhan, setTinNhan] = useState("");
  var [dangXuLy, setDangXuLy] = useState(false);
  var [buocViet, setBuocViet] = useState("");
  var [banViet, setBanViet] = useState({ tieu_de: "", tom_tat: "", noi_dung: "" });
  var [tinNhanChat, setTinNhanChat] = useState([
    { vaiTro: "bot", loai: "chao", noiDung: "Chào bạn! Mình có thể tìm bài viết, thống kê dữ liệu hoặc hướng dẫn bạn soạn và lưu bài." },
  ]);

  function themTin(vaiTro, noiDung, loai, duLieu) {
    setTinNhanChat(function (cu) { return cu.concat([{ vaiTro: vaiTro, noiDung: noiDung, loai: loai || "text", duLieu: duLieu }]); });
  }

  function batDauViet() {
    setBanViet({ tieu_de: "", tom_tat: "", noi_dung: "" });
    setBuocViet("tieu_de");
    themTin("bot", "Được nhé. Trước tiên, bạn gửi tiêu đề bài viết.");
  }

  async function xuLyYeuCau(cauHoi) {
    var cauThuong = cauHoi.toLowerCase();
    if (/viết bài|đăng bài|soạn bài|tạo bài/.test(cauThuong)) {
      batDauViet();
      return;
    }
    setDangXuLy(true);
    try {
      var ketQua = await goiApi("/tro-ly", "POST", { tin_nhan: cauHoi });
      if (ketQua.loai === "thong_ke") {
        themTin("bot", "Đây là thống kê hiện tại:", "thong_ke", ketQua.du_lieu);
      } else if (ketQua.loai === "tim_kiem") {
        themTin("bot", ketQua.danh_sach.length ? "Mình tìm thấy các bài viết sau:" : "Chưa tìm thấy bài phù hợp. Bạn thử từ khoá khác nhé.", "tim_kiem", ketQua.danh_sach);
      } else {
        themTin("bot", ketQua.thong_diep);
      }
    } catch (err) {
      themTin("bot", err.message);
    }
    setDangXuLy(false);
  }

  function guiTin(e) {
    e.preventDefault();
    var noiDung = tinNhan.trim();
    if (!noiDung || dangXuLy) return;
    setTinNhan("");
    themTin("ban", noiDung);

    if (buocViet === "tieu_de") {
      setBanViet(function (cu) { return Object.assign({}, cu, { tieu_de: noiDung }); });
      setBuocViet("tom_tat");
      themTin("bot", "Bạn viết một câu tóm tắt ngắn cho bài nhé.");
    } else if (buocViet === "tom_tat") {
      setBanViet(function (cu) { return Object.assign({}, cu, { tom_tat: noiDung }); });
      setBuocViet("noi_dung");
      themTin("bot", "Giờ gửi nội dung chính của bài viết.");
    } else if (buocViet === "noi_dung") {
      setBanViet(function (cu) { return Object.assign({}, cu, { noi_dung: noiDung }); });
      setBuocViet("chon");
      themTin("bot", "Tiêu đề: " + banViet.tieu_de + "\nTóm tắt: " + banViet.tom_tat + "\nNội dung: " + noiDung.slice(0, 180) + (noiDung.length > 180 ? "…" : "") + "\n\nChọn lưu nháp để xem lại, hoặc đăng ngay.");
    } else {
      xuLyYeuCau(noiDung);
    }
  }

  async function luuBai(trangThai) {
    setDangXuLy(true);
    try {
      await goiApi("/bai-viet", "POST", Object.assign({}, banViet, { trang_thai: trangThai, the_loai: "Khác" }));
      themTin("bot", trangThai === "nhap" ? "Đã lưu bản nháp. Bạn có thể vào “Bài của tôi” để sửa tiếp." : "Đã đăng bài viết thành công!");
      setBuocViet("");
      setBanViet({ tieu_de: "", tom_tat: "", noi_dung: "" });
    } catch (err) {
      themTin("bot", err.message + (err.message.indexOf("đăng nhập") >= 0 ? ". Hãy đăng nhập rồi thử lại." : ""));
    }
    setDangXuLy(false);
  }

  return (
    <div className="tro-ly">
      {mo && <section className="tro-ly-hop" aria-label="Trợ lý MựcXanh">
        <header className="tro-ly-dau"><div><strong>Trợ lý MựcXanh</strong><span>Tìm kiếm · Soạn bài · Thống kê</span></div>
          <button type="button" className="tro-ly-dong" onClick={function () { setMo(false); }} aria-label="Đóng">×</button></header>
        <div className="tro-ly-tin-nhan" aria-live="polite">
          {tinNhanChat.map(function (tin, i) {
            return <div className={"tro-ly-tin " + tin.vaiTro} key={i}>
              <p>{tin.noiDung}</p>
              {tin.loai === "tim_kiem" && tin.duLieu && tin.duLieu.map(function (bai) {
                return <Link className="tro-ly-ket-qua" to={"/bai-viet/" + bai.id} key={bai.id} onClick={function () { setMo(false); }}><b>{bai.tieu_de}</b><span>{bai.the_loai} · {bai.tac_gia}</span></Link>;
              })}
              {tin.loai === "thong_ke" && tin.duLieu && <div className="tro-ly-so-lieu">
                <span>Đã đăng: <b>{tin.duLieu.tong_bai_dang}</b></span><span>Lượt xem: <b>{tin.duLieu.tong_luot_xem}</b></span><span>Bản nháp của bạn: <b>{tin.duLieu.tong_ban_nhap}</b></span>
                <span>Thể loại: {Object.keys(tin.duLieu.theo_the_loai).map(function (ten) { return ten + " (" + tin.duLieu.theo_the_loai[ten] + ")"; }).join(", ") || "chưa có"}</span>
                {tin.duLieu.bai_noi_bat.map(function (bai) { return <Link to={"/bai-viet/" + bai.id} key={bai.id} onClick={function () { setMo(false); }}>{bai.tieu_de} · {bai.luot_xem} lượt xem</Link>; })}
              </div>}
            </div>;
          })}
          {dangXuLy && <div className="tro-ly-tin bot"><p>Đang xử lý…</p></div>}
        </div>
        {tinNhanChat.length === 1 && <div className="tro-ly-goi-y">
          <button type="button" onClick={function () { setTinNhan("Tìm bài viết"); }}>Tìm bài viết</button>
          <button type="button" onClick={function () { xuLyYeuCau("Tổng hợp dữ liệu"); }}>Thống kê</button>
          <button type="button" onClick={batDauViet}>Soạn bài</button>
        </div>}
        {buocViet === "chon" && <div className="tro-ly-hanh-dong"><button type="button" onClick={luuBai.bind(null, "nhap")} disabled={dangXuLy}>Lưu nháp</button><button type="button" onClick={luuBai.bind(null, "dang")} disabled={dangXuLy}>Đăng ngay</button></div>}
        <form className="tro-ly-nhap" onSubmit={guiTin}><textarea rows={2} value={tinNhan} onChange={function (e) { setTinNhan(e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); e.currentTarget.form.requestSubmit(); } }} placeholder={buocViet === "noi_dung" ? "Nhập nội dung bài viết…" : "Nhập câu hỏi…"} aria-label="Tin nhắn" /><button type="submit" disabled={dangXuLy || !tinNhan.trim()}>Gửi</button></form>
      </section>}
      <button className="tro-ly-nut" type="button" onClick={function () { setMo(!mo); }} aria-label={mo ? "Đóng trợ lý" : "Mở trợ lý"}>{mo ? "×" : "✦"}</button>
    </div>
  );
}

export default TroLyChat;
