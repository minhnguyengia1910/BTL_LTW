import { useState } from "react";
import { Link } from "react-router-dom";
import { layIcon, dinhDangNgay } from "../hang_so";

// Một thẻ bài viết ở trang chủ
function TheBaiViet(props) {
  var bai = props.bai;
  var [anhLoi, setAnhLoi] = useState(false); // link ảnh hỏng thì hiện icon thay thế

  var phanAnh;
  if (bai.anh_bia && !anhLoi) {
    phanAnh = (
      <img
        className="the-anh"
        src={bai.anh_bia}
        alt={bai.tieu_de}
        onError={function () { setAnhLoi(true); }}
      />
    );
  } else {
    phanAnh = <div className="the-anh the-anh-trong">{layIcon(bai.the_loai)}</div>;
  }

  return (
    <Link to={"/bai-viet/" + bai.id} className="the">
      {phanAnh}
      <div className="the-noi-dung">
        <span className="nhan-the-loai">{bai.the_loai}</span>
        <h3>{bai.tieu_de}</h3>
        <p>{bai.tom_tat}</p>
        <div className="the-chan">
          <span>{bai.tac_gia}</span>
          <span>{dinhDangNgay(bai.ngay_tao)}</span>
          <span>👁️ {bai.luot_xem}</span>
        </div>
      </div>
    </Link>
  );
}

export default TheBaiViet;
