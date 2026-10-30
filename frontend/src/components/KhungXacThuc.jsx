import { Link } from "react-router-dom";

// Khung chia đôi màn hình dùng chung cho Đăng nhập / Đăng ký / Quên mật khẩu
// Bên trái: giới thiệu. Bên phải: form (truyền vào qua children)
function KhungXacThuc(props) {
  return (
    <div className="xac-thuc">
      <section className="xac-thuc-trai">
        <Link to="/" className="logo logo-sang">✒️ MựcXanh</Link>
        <div>
          <h2>Viết điều bạn nghĩ. Giữ lại điều bạn học.</h2>
          <p>Nơi lưu bài viết, ghi chú và bài báo của riêng bạn, gọn gàng và dễ tìm lại.</p>
        </div>
        <div className="ghi-chu">
          <span>📝 Bản nháp</span>
          <strong>Cách mình ôn thi giữa kỳ trong 7 ngày</strong>
        </div>
      </section>

      <section className="xac-thuc-phai">
        <div className="xac-thuc-form">
          <h1>{props.tieuDe}</h1>
          <p className="mo-ta">{props.moTa}</p>
          {props.children}
        </div>
      </section>
    </div>
  );
}

export default KhungXacThuc;
