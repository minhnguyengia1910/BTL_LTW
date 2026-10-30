import { Link, useNavigate } from "react-router-dom";

function Navbar(props) {
  var nguoiDung = props.nguoiDung;
  var chuyenTrang = useNavigate();

  function xuLyDangXuat() {
    props.dangXuat();
    chuyenTrang("/");
  }

  return (
    <header className="thanh-menu">
      <div className="thanh-menu-trong">
        <Link to="/" className="logo">✒️ MựcXanh</Link>

        <nav className="menu-phai">
          {nguoiDung ? (
            <>
              <Link to="/trang-ca-nhan" className="menu-link">Trang cá nhân</Link>
              <Link to="/bai-viet-cua-toi" className="menu-link">Bài của tôi</Link>
              <Link to="/viet-bai" className="nut nut-chinh nut-nho">✍️ Viết bài</Link>
              <span className="ten-nguoi-dung">{nguoiDung.anh_dai_dien && <img className="menu-anh-dai-dien" src={nguoiDung.anh_dai_dien} alt="" />}Chào, {nguoiDung.ten || "Ẩn danh"}</span>
              <button className="nut nut-vien nut-nho" onClick={xuLyDangXuat}>Đăng xuất</button>
            </>
          ) : (
            <>
              <Link to="/dang-nhap" className="menu-link">Đăng nhập</Link>
              <Link to="/dang-ky" className="nut nut-chinh nut-nho">Đăng ký</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
